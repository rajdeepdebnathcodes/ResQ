const { pool } = require('../config/db');

/**
 * Create rescue request for an emergency report (Citizen)
 * POST /api/rescue
 */
async function createRescueRequest(req, res, next) {
  try {
    const { report_id, notes, priority_level } = req.body;
    const userId = req.user.user_id;

    if (!report_id) {
      return res.status(400).json({ success: false, message: 'Report ID is required.' });
    }

    // Check if report exists and belongs to user (or user is admin)
    const [reportRows] = await pool.query(
      'SELECT report_id, user_id, priority_level FROM emergency_reports WHERE report_id = ?',
      [report_id]
    );

    if (reportRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Emergency report not found.' });
    }

    // Check if a rescue request already exists
    const [existing] = await pool.query(
      'SELECT request_id, status FROM rescue_requests WHERE report_id = ?',
      [report_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `A rescue request already exists for this report with status: ${existing[0].status}`,
        request_id: existing[0].request_id
      });
    }

    const priority = priority_level || reportRows[0].priority_level || 'Medium';

    const [result] = await pool.query(
      `INSERT INTO rescue_requests (report_id, requested_by, status, priority_level, notes, created_at)
       VALUES (?, ?, 'Pending', ?, ?, NOW())`,
      [report_id, userId, priority, notes || 'Immediate rescue assistance requested by citizen.']
    );

    return res.status(201).json({
      success: true,
      message: 'Rescue request created and queued for emergency volunteer dispatch.',
      request_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pending rescue requests queue (Volunteers & Admin)
 * GET /api/rescue/pending
 */
async function getPendingRequests(req, res, next) {
  try {
    const query = `
      SELECT rr.*,
             r.disaster_type, r.description, r.location, r.latitude, r.longitude,
             r.image_url, r.summary, r.ai_classification,
             u.name AS citizen_name, u.phone AS citizen_phone
      FROM rescue_requests rr
      JOIN emergency_reports r ON rr.report_id = r.report_id
      JOIN users u ON rr.requested_by = u.user_id
      WHERE rr.status = 'Pending'
      ORDER BY FIELD(rr.priority_level, 'Critical', 'High', 'Medium', 'Low'), rr.created_at ASC
    `;

    const [rows] = await pool.query(query);

    return res.status(200).json({
      success: true,
      count: rows.length,
      requests: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all rescue requests (Admin & Volunteer view)
 * GET /api/rescue
 */
async function getAllRescueRequests(req, res, next) {
  try {
    const { status, priority, limit = 50 } = req.query;

    let query = `
      SELECT rr.*,
             r.disaster_type, r.description, r.location, r.latitude, r.longitude,
             r.image_url, r.summary, r.ai_classification,
             u.name AS citizen_name, u.phone AS citizen_phone,
             vol.name AS volunteer_name, vol.phone AS volunteer_phone
      FROM rescue_requests rr
      JOIN emergency_reports r ON rr.report_id = r.report_id
      JOIN users u ON rr.requested_by = u.user_id
      LEFT JOIN users vol ON rr.assigned_to = vol.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ` AND rr.status = ?`;
      params.push(status);
    }
    if (priority && priority !== 'All') {
      query += ` AND rr.priority_level = ?`;
      params.push(priority);
    }

    query += ` ORDER BY FIELD(rr.priority_level, 'Critical', 'High', 'Medium', 'Low'), rr.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      requests: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get rescue requests assigned to current volunteer
 * GET /api/rescue/my-assignments
 */
async function getMyAssignedRequests(req, res, next) {
  try {
    const volunteerId = req.user.user_id;

    const query = `
      SELECT rr.*,
             r.disaster_type, r.description, r.location, r.latitude, r.longitude,
             r.image_url, r.summary, r.ai_classification,
             u.name AS citizen_name, u.phone AS citizen_phone
      FROM rescue_requests rr
      JOIN emergency_reports r ON rr.report_id = r.report_id
      JOIN users u ON rr.requested_by = u.user_id
      WHERE rr.assigned_to = ?
      ORDER BY FIELD(rr.status, 'In Progress', 'Accepted', 'Pending', 'Completed', 'Cancelled'), rr.updated_at DESC
    `;

    const [rows] = await pool.query(query, [volunteerId]);

    return res.status(200).json({
      success: true,
      requests: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Volunteer accepts a rescue request
 * POST /api/rescue/:id/accept
 */
async function acceptRescueRequest(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const volunteerId = req.user.user_id;

    const [reqRows] = await pool.query(
      'SELECT request_id, status, assigned_to, report_id FROM rescue_requests WHERE request_id = ?',
      [requestId]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rescue request not found.' });
    }

    const currentReq = reqRows[0];
    if (currentReq.status !== 'Pending' && currentReq.assigned_to !== null) {
      return res.status(400).json({
        success: false,
        message: `Rescue request has already been claimed (Status: ${currentReq.status}).`
      });
    }

    // Update request
    await pool.query(
      `UPDATE rescue_requests
       SET assigned_to = ?, status = 'Accepted', updated_at = NOW()
       WHERE request_id = ?`,
      [volunteerId, requestId]
    );

    // Update emergency report status to 'In Progress'
    await pool.query(
      `UPDATE emergency_reports SET status = 'In Progress' WHERE report_id = ?`,
      [currentReq.report_id]
    );

    // Insert update audit record
    await pool.query(
      `INSERT INTO rescue_updates (request_id, volunteer_id, status, remarks, updated_at)
       VALUES (?, ?, 'Accepted', ?, NOW())`,
      [requestId, volunteerId, `${req.user.name} accepted the rescue request and is responding.`]
    );

    return res.status(200).json({
      success: true,
      message: 'Rescue request accepted successfully. You are now the assigned responder.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Volunteer or Admin updates rescue progress status with remarks
 * POST /api/rescue/:id/update-status
 */
async function updateRescueStatus(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const volunteerId = req.user.user_id;
    const { status, remarks } = req.body;

    const validStatuses = ['Accepted', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of [${validStatuses.join(', ')}]`
      });
    }

    const [reqRows] = await pool.query(
      'SELECT request_id, report_id, assigned_to, status FROM rescue_requests WHERE request_id = ?',
      [requestId]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rescue request not found.' });
    }

    const current = reqRows[0];

    // Ensure responder or admin is making updates
    if (req.user.role === 'volunteer' && current.assigned_to && current.assigned_to !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update rescue operations assigned to you.'
      });
    }

    // Update rescue request
    await pool.query(
      `UPDATE rescue_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    // If completed or cancelled, update underlying report
    if (status === 'Completed') {
      await pool.query(
        `UPDATE emergency_reports SET status = 'Resolved' WHERE report_id = ?`,
        [current.report_id]
      );
    }

    // Add entry to rescue_updates log
    const note = remarks && remarks.trim() ? remarks.trim() : `Status transitioned to ${status}.`;
    await pool.query(
      `INSERT INTO rescue_updates (request_id, volunteer_id, status, remarks, updated_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [requestId, volunteerId, status, note]
    );

    return res.status(200).json({
      success: true,
      message: `Rescue status updated to "${status}".`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get rescue request details along with live timeline of updates
 * GET /api/rescue/:id
 */
async function getRescueDetails(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);

    const [reqRows] = await pool.query(
      `SELECT rr.*,
              r.disaster_type, r.description, r.location, r.latitude, r.longitude,
              r.image_url, r.summary, r.ai_classification,
              u.name AS citizen_name, u.phone AS citizen_phone, u.email AS citizen_email,
              vol.name AS volunteer_name, vol.phone AS volunteer_phone, vol.email AS volunteer_email,
              vprofile.skills AS volunteer_skills
       FROM rescue_requests rr
       JOIN emergency_reports r ON rr.report_id = r.report_id
       JOIN users u ON rr.requested_by = u.user_id
       LEFT JOIN users vol ON rr.assigned_to = vol.user_id
       LEFT JOIN volunteers vprofile ON vol.user_id = vprofile.user_id
       WHERE rr.request_id = ?`,
      [requestId]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rescue request not found.' });
    }

    // Fetch chronological updates log
    const [updates] = await pool.query(
      `SELECT ru.*, u.name AS author_name, u.role AS author_role
       FROM rescue_updates ru
       JOIN users u ON ru.volunteer_id = u.user_id
       WHERE ru.request_id = ?
       ORDER BY ru.updated_at ASC`,
      [requestId]
    );

    return res.status(200).json({
      success: true,
      rescue_request: reqRows[0],
      timeline: updates
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRescueRequest,
  getPendingRequests,
  getAllRescueRequests,
  getMyAssignedRequests,
  acceptRescueRequest,
  updateRescueStatus,
  getRescueDetails
};
