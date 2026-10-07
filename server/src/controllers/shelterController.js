const { pool } = require('../config/db');

/**
 * Get all shelters with optional status & search filter
 * GET /api/shelters
 */
async function getAllShelters(req, res, next) {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT s.*, u.name AS creator_name
      FROM shelters s
      LEFT JOIN users u ON s.created_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ` AND s.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += ` ORDER BY FIELD(s.status, 'Available', 'Full', 'Temporarily Closed'), s.available_slots DESC, s.name ASC`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      shelters: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single shelter by ID
 * GET /api/shelters/:id
 */
async function getShelterById(req, res, next) {
  try {
    const shelterId = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT * FROM shelters WHERE shelter_id = ?', [shelterId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Relief shelter not found.' });
    }

    return res.status(200).json({
      success: true,
      shelter: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new shelter (Admin only)
 * POST /api/shelters
 */
async function createShelter(req, res, next) {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      capacity = 100,
      available_slots = 100,
      contact_number,
      status = 'Available'
    } = req.body;

    if (!name || !address || !contact_number) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and contact number are required.'
      });
    }

    const cap = parseInt(capacity, 10) || 100;
    const slots = parseInt(available_slots, 10) !== undefined ? parseInt(available_slots, 10) : cap;

    const [result] = await pool.query(
      `INSERT INTO shelters
       (name, address, latitude, longitude, capacity, available_slots, contact_number, status, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name.trim(),
        address.trim(),
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        cap,
        slots,
        contact_number.trim(),
        status,
        req.user ? req.user.user_id : null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Relief shelter added successfully.',
      shelter_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing shelter (Admin only)
 * PUT /api/shelters/:id
 */
async function updateShelter(req, res, next) {
  try {
    const shelterId = parseInt(req.params.id, 10);
    const {
      name,
      address,
      latitude,
      longitude,
      capacity,
      available_slots,
      contact_number,
      status
    } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name.trim()); }
    if (address) { updates.push('address = ?'); params.push(address.trim()); }
    if (latitude !== undefined) { updates.push('latitude = ?'); params.push(latitude ? parseFloat(latitude) : null); }
    if (longitude !== undefined) { updates.push('longitude = ?'); params.push(longitude ? parseFloat(longitude) : null); }
    if (capacity !== undefined) { updates.push('capacity = ?'); params.push(parseInt(capacity, 10)); }
    if (available_slots !== undefined) { updates.push('available_slots = ?'); params.push(parseInt(available_slots, 10)); }
    if (contact_number) { updates.push('contact_number = ?'); params.push(contact_number.trim()); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    params.push(shelterId);
    await pool.query(`UPDATE shelters SET ${updates.join(', ')} WHERE shelter_id = ?`, params);

    return res.status(200).json({
      success: true,
      message: 'Shelter details updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a shelter (Admin only)
 * DELETE /api/shelters/:id
 */
async function deleteShelter(req, res, next) {
  try {
    const shelterId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM shelters WHERE shelter_id = ?', [shelterId]);

    return res.status(200).json({
      success: true,
      message: 'Relief shelter deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter
};
