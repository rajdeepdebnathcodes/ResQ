const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const config = require('../config/env');

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, phone, role = 'citizen', skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const validRoles = ['citizen', 'volunteer', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'citizen';

    // Disallow arbitrary self-registration as admin in production
    // For demo/academic convenience, allow if requested or default to citizen
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [emailTrimmed]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name.trim(), emailTrimmed, hashedPassword, phone ? phone.trim() : null, assignedRole]
    );

    const newUserId = result.insertId;

    // If volunteer, insert into volunteers table
    if (assignedRole === 'volunteer') {
      await pool.query(
        'INSERT INTO volunteers (user_id, skills, availability_status, created_at) VALUES (?, ?, "available", NOW())',
        [newUserId, skills ? skills.trim() : 'First Aid & Rescue Assistance']
      );
    } else if (assignedRole === 'admin') {
      await pool.query(
        'INSERT INTO admins (user_id, created_at) VALUES (?, NOW())',
        [newUserId]
      );
    }

    const newUser = {
      user_id: newUserId,
      name: name.trim(),
      email: emailTrimmed,
      phone: phone || null,
      role: assignedRole
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * User login
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const [rows] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.password, u.phone, u.role, u.created_at,
              v.skills, v.availability_status
       FROM users u
       LEFT JOIN volunteers v ON u.user_id = v.user_id
       WHERE u.email = ?`,
      [emailTrimmed]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const safeUser = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      skills: user.skills || null,
      availability_status: user.availability_status || null,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.phone, u.role, u.created_at,
              v.skills, v.availability_status
       FROM users u
       LEFT JOIN volunteers v ON u.user_id = v.user_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe
};
