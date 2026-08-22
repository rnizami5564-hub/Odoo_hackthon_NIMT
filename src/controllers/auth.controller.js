const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return process.env.JWT_SECRET;
}

function getRequestValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function signUp(req, res) {
  const body = req.body || {};
  const employeeId = getRequestValue(body.employeeId);
  const email = getRequestValue(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const firstName = getRequestValue(body.firstName);
  const lastName = getRequestValue(body.lastName);
  const phone = getRequestValue(body.phone) || null;
  const address = getRequestValue(body.address) || null;
  const profilePicUrl = getRequestValue(body.profilePicUrl) || null;

  if (!employeeId || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'employeeId, email, password, firstName, and lastName are required' });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      `INSERT INTO users (employee_id, email, password_hash, role)
       VALUES ($1, $2, $3, 'Employee')
       RETURNING id, employee_id, email, role, is_verified, created_at`,
      [employeeId, email, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO profiles (user_id, first_name, last_name, phone, address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, firstName, lastName, phone, address]
    );

    await client.query('COMMIT');
    return res.status(201).json({ user });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email or employee ID is already registered' });
    }

    console.error('Sign-up failed:', error);
    return res.status(500).json({ error: 'Unable to create account' });
  } finally {
    client.release();
  }
}

async function signIn(req, res) {
  const body = req.body || {};
  const email = getRequestValue(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, employee_id, email, password_hash, role, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Sign-in failed:', error);
    return res.status(500).json({ error: 'Unable to sign in' });
  }
}

module.exports = { signUp, signIn };
