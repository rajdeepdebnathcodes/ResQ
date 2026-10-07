const { pool } = require('../config/db');

/**
 * Get active emergency alerts
 * GET /api/alerts/active
 */
async function getActiveAlerts(req, res, next) {
  try {
    const query = `
      SELECT a.*, u.name AS broadcast_by
      FROM alerts a
      LEFT JOIN users u ON a.admin_id = u.user_id
      WHERE a.is_active = TRUE
      ORDER BY FIELD(a.severity, 'Critical', 'High', 'Medium', 'Low'), a.created_at DESC
    `;

    const [rows] = await pool.query(query);

    return res.status(200).json({
      success: true,
      count: rows.length,
      alerts: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all alerts including archived (Admin view)
 * GET /api/alerts
 */
async function getAllAlerts(req, res, next) {
  try {
    const query = `
      SELECT a.*, u.name AS broadcast_by
      FROM alerts a
      LEFT JOIN users u ON a.admin_id = u.user_id
      ORDER BY a.created_at DESC
    `;

    const [rows] = await pool.query(query);

    return res.status(200).json({
      success: true,
      count: rows.length,
      alerts: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new emergency alert (Admin only)
 * POST /api/alerts
 */
async function createAlert(req, res, next) {
  try {
    const {
      title,
      message,
      alert_type = 'General',
      severity = 'Medium',
      location = 'All Affected Areas'
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required for an emergency alert.'
      });
    }

    const adminId = req.user.user_id;

    const [result] = await pool.query(
      `INSERT INTO alerts (admin_id, title, message, alert_type, severity, location, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [adminId, title.trim(), message.trim(), alert_type, severity, location.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Emergency alert broadcasted successfully.',
      alert_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an alert (toggle active status or edit)
 * PUT /api/alerts/:id
 */
async function updateAlert(req, res, next) {
  try {
    const alertId = parseInt(req.params.id, 10);
    const { title, message, alert_type, severity, location, is_active } = req.body;

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title.trim()); }
    if (message) { updates.push('message = ?'); params.push(message.trim()); }
    if (alert_type) { updates.push('alert_type = ?'); params.push(alert_type); }
    if (severity) { updates.push('severity = ?'); params.push(severity); }
    if (location) { updates.push('location = ?'); params.push(location.trim()); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    params.push(alertId);
    await pool.query(`UPDATE alerts SET ${updates.join(', ')} WHERE alert_id = ?`, params);

    return res.status(200).json({
      success: true,
      message: 'Alert updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an alert
 * DELETE /api/alerts/:id
 */
async function deleteAlert(req, res, next) {
  try {
    const alertId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM alerts WHERE alert_id = ?', [alertId]);

    return res.status(200).json({
      success: true,
      message: 'Alert deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getActiveAlerts,
  getAllAlerts,
  createAlert,
  updateAlert,
  deleteAlert
};
