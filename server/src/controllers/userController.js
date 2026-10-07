const { pool } = require('../config/db');

/**
 * Get all users (Admin only)
 * GET /api/users
 */
async function getAllUsers(req, res, next) {
  try {
    const { role, search } = req.query;

    let query = `
      SELECT u.user_id, u.name, u.email, u.phone, u.role, u.created_at,
             v.skills, v.availability_status
      FROM users u
      LEFT JOIN volunteers v ON u.user_id = v.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'All') {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      users: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user role (Admin only)
 * PATCH /api/users/:id/role
 */
async function updateUserRole(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const validRoles = ['citizen', 'volunteer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of [${validRoles.join(', ')}]`
      });
    }

    // Update role
    await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, targetUserId]);

    // If changing to volunteer, ensure volunteer record exists
    if (role === 'volunteer') {
      await pool.query(
        `INSERT INTO volunteers (user_id, skills, availability_status, created_at)
         VALUES (?, 'Emergency Relief Volunteer', 'available', NOW())
         ON DUPLICATE KEY UPDATE availability_status = 'available'`,
        [targetUserId]
      );
    }

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update volunteer availability status and skills
 * PATCH /api/users/volunteer/status
 */
async function updateVolunteerStatus(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { availability_status, skills } = req.body;

    const validStatuses = ['available', 'busy', 'offline'];
    if (availability_status && !validStatuses.includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of [${validStatuses.join(', ')}]`
      });
    }

    await pool.query(
      `INSERT INTO volunteers (user_id, skills, availability_status, created_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         availability_status = COALESCE(?, availability_status),
         skills = COALESCE(?, skills)`,
      [
        userId,
        skills || 'General Relief',
        availability_status || 'available',
        availability_status || null,
        skills || null
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Volunteer profile and availability updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
async function deleteUser(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    // Prevent deleting self
    if (targetUserId === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.'
      });
    }

    await pool.query('DELETE FROM users WHERE user_id = ?', [targetUserId]);

    return res.status(200).json({
      success: true,
      message: 'User removed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateVolunteerStatus,
  deleteUser
};
