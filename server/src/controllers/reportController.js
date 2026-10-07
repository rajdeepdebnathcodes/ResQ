const { pool } = require('../config/db');
const aiService = require('../services/aiService');

/**
 * Create a new emergency report (Citizen)
 * POST /api/reports
 */
async function createReport(req, res, next) {
  try {
    const {
      disaster_type = 'Other',
      description,
      location,
      latitude,
      longitude,
      request_rescue
    } = req.body;

    if (!description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the incident description and location.'
      });
    }

    const userId = req.user.user_id;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // 1. Initial report insertion
    const [reportResult] = await pool.query(
      `INSERT INTO emergency_reports
       (user_id, disaster_type, description, location, latitude, longitude, image_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Reported', NOW())`,
      [
        userId,
        disaster_type,
        description.trim(),
        location.trim(),
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        imageUrl
      ]
    );

    const reportId = reportResult.insertId;

    // 2. Run AI Analysis (Gemini API with Fallback)
    let aiResult;
    try {
      aiResult = await aiService.analyzeEmergencyReport({
        description: description.trim(),
        location: location.trim(),
        userDisasterType: disaster_type
      });
    } catch (err) {
      console.warn(`[AI Pipeline Error] Fallback triggered: ${err.message}`);
      aiResult = {
        classification: disaster_type,
        confidence: 'Fallback',
        priority: 'Medium',
        summary: description.slice(0, 150),
        safety_tips: aiService.getSafetyTips(disaster_type),
        source: 'fallback'
      };
    }

    // 3. Store AI Analysis in ai_analysis table
    const [aiAnalysisResult] = await pool.query(
      `INSERT INTO ai_analysis
       (report_id, classification, confidence, priority, summary, safety_tips, source, raw_response, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        reportId,
        aiResult.classification,
        aiResult.confidence,
        aiResult.priority,
        aiResult.summary,
        aiResult.safety_tips,
        aiResult.source,
        aiResult.raw_response || null
      ]
    );

    // 4. Update report with AI conclusions
    await pool.query(
      `UPDATE emergency_reports
       SET ai_classification = ?, priority_level = ?, summary = ?
       WHERE report_id = ?`,
      [aiResult.classification, aiResult.priority, aiResult.summary, reportId]
    );

    // 5. Automatically initiate Rescue Request if requested by user or if Critical
    let rescueRequestId = null;
    if (request_rescue === 'true' || request_rescue === true || aiResult.priority === 'Critical') {
      const [rescueResult] = await pool.query(
        `INSERT INTO rescue_requests
         (report_id, requested_by, status, priority_level, notes, created_at)
         VALUES (?, ?, 'Pending', ?, ?, NOW())`,
        [
          reportId,
          userId,
          aiResult.priority,
          `Automated dispatch created upon submission: ${aiResult.summary}`
        ]
      );
      rescueRequestId = rescueResult.insertId;
    }

    // 6. Return response
    return res.status(201).json({
      success: true,
      message: 'Emergency report logged and analyzed successfully.',
      report: {
        report_id: reportId,
        user_id: userId,
        disaster_type,
        ai_classification: aiResult.classification,
        priority_level: aiResult.priority,
        summary: aiResult.summary,
        location,
        latitude,
        longitude,
        image_url: imageUrl,
        status: 'Reported',
        created_at: new Date()
      },
      ai_analysis: {
        analysis_id: aiAnalysisResult.insertId,
        classification: aiResult.classification,
        confidence: aiResult.confidence,
        priority: aiResult.priority,
        summary: aiResult.summary,
        safety_tips: aiResult.safety_tips,
        source: aiResult.source
      },
      rescue_request_id: rescueRequestId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all reports with optional filtering (Admin, Volunteer, or general view)
 * GET /api/reports
 */
async function getAllReports(req, res, next) {
  try {
    const { disaster_type, priority, status, search, limit = 50 } = req.query;

    let query = `
      SELECT r.*, u.name AS reporter_name, u.phone AS reporter_phone,
             a.analysis_id, a.confidence AS ai_confidence, a.safety_tips AS ai_safety_tips, a.source AS ai_source,
             rr.request_id AS rescue_request_id, rr.status AS rescue_status, rr.assigned_to AS rescue_assigned_to,
             vol.name AS assigned_volunteer_name
      FROM emergency_reports r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN ai_analysis a ON r.report_id = a.report_id
      LEFT JOIN rescue_requests rr ON r.report_id = rr.report_id
      LEFT JOIN users vol ON rr.assigned_to = vol.user_id
      WHERE 1=1
    `;
    const params = [];

    if (disaster_type && disaster_type !== 'All') {
      query += ` AND (r.disaster_type = ? OR r.ai_classification = ?)`;
      params.push(disaster_type, disaster_type);
    }
    if (priority && priority !== 'All') {
      query += ` AND r.priority_level = ?`;
      params.push(priority);
    }
    if (status && status !== 'All') {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (r.location LIKE ? OR r.description LIKE ? OR r.summary LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY FIELD(r.priority_level, 'Critical', 'High', 'Medium', 'Low'), r.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      reports: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get reports created by logged in citizen
 * GET /api/reports/my-reports
 */
async function getMyReports(req, res, next) {
  try {
    const userId = req.user.user_id;

    const query = `
      SELECT r.*,
             a.analysis_id, a.confidence AS ai_confidence, a.safety_tips AS ai_safety_tips, a.source AS ai_source,
             rr.request_id AS rescue_request_id, rr.status AS rescue_status, rr.assigned_to,
             vol.name AS assigned_volunteer_name, vol.phone AS volunteer_phone
      FROM emergency_reports r
      LEFT JOIN ai_analysis a ON r.report_id = a.report_id
      LEFT JOIN rescue_requests rr ON r.report_id = rr.report_id
      LEFT JOIN users vol ON rr.assigned_to = vol.user_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;

    const [rows] = await pool.query(query, [userId]);

    return res.status(200).json({
      success: true,
      reports: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single report details
 * GET /api/reports/:id
 */
async function getReportById(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);

    const query = `
      SELECT r.*, u.name AS reporter_name, u.phone AS reporter_phone, u.email AS reporter_email,
             a.analysis_id, a.confidence AS ai_confidence, a.safety_tips AS ai_safety_tips, a.source AS ai_source,
             rr.request_id AS rescue_request_id, rr.status AS rescue_status, rr.assigned_to,
             vol.name AS assigned_volunteer_name, vol.phone AS volunteer_phone
      FROM emergency_reports r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN ai_analysis a ON r.report_id = a.report_id
      LEFT JOIN rescue_requests rr ON r.report_id = rr.report_id
      LEFT JOIN users vol ON rr.assigned_to = vol.user_id
      WHERE r.report_id = ?
    `;

    const [rows] = await pool.query(query, [reportId]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emergency report not found.'
      });
    }

    return res.status(200).json({
      success: true,
      report: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update report status (Admin / Volunteer)
 * PATCH /api/reports/:id/status
 */
async function updateReportStatus(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);
    const { status, priority_level } = req.body;

    const validStatuses = ['Reported', 'Verified', 'In Progress', 'Resolved', 'Dismissed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of [${validStatuses.join(', ')}]`
      });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (priority_level) {
      updates.push('priority_level = ?');
      params.push(priority_level);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(reportId);
    await pool.query(`UPDATE emergency_reports SET ${updates.join(', ')} WHERE report_id = ?`, params);

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete report (Admin only)
 * DELETE /api/reports/:id
 */
async function deleteReport(req, res, next) {
  try {
    const reportId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM emergency_reports WHERE report_id = ?', [reportId]);
    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  deleteReport
};
