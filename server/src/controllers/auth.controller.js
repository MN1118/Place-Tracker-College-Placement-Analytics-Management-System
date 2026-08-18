const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { query, pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'COMPANY']), // Admin/Faculty accounts are provisioned by admins, not self-registration
  fullName: z.string().min(2),
  // student-only
  rollNumber: z.string().optional(),
  departmentId: z.coerce.number().optional(),
  course: z.string().optional(),
  graduationYear: z.coerce.number().optional(),
  // company-only
  companyName: z.string().optional(),
  industry: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existing.rows.length) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role`,
      [data.email, passwordHash, data.role]
    );
    const user = userResult.rows[0];

    if (data.role === 'STUDENT') {
      if (!data.rollNumber || !data.departmentId || !data.course || !data.graduationYear) {
        throw new ApiError(422, 'Roll number, department, course and graduation year are required for student registration');
      }
      await client.query(
        `INSERT INTO students (user_id, roll_number, full_name, department_id, course, graduation_year)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [user.id, data.rollNumber, data.fullName, data.departmentId, data.course, data.graduationYear]
      );
    } else if (data.role === 'COMPANY') {
      if (!data.companyName) throw new ApiError(422, 'Company name is required for company registration');
      await client.query(
        `INSERT INTO companies (user_id, name, industry, approval_status) VALUES ($1,$2,$3,'PENDING')`,
        [user.id, data.companyName, data.industry || null]
      );
    }

    await client.query('COMMIT');
    const token = signToken(user);
    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !user.is_active) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

  const token = signToken(user);
  res.json({
    success: true,
    data: { token, user: { id: user.id, email: user.email, role: user.role } },
  });
});

const me = asyncHandler(async (req, res) => {
  const { id, role } = req.user;
  const { rows } = await query('SELECT id, email, role, created_at FROM users WHERE id = $1', [id]);
  if (!rows.length) throw new ApiError(404, 'User not found');
  const user = rows[0];

  let profile = null;
  if (role === 'STUDENT') {
    const r = await query('SELECT * FROM students WHERE user_id = $1', [id]);
    profile = r.rows[0] || null;
  } else if (role === 'COMPANY') {
    const r = await query('SELECT * FROM companies WHERE user_id = $1', [id]);
    profile = r.rows[0] || null;
  } else if (role === 'FACULTY') {
    const r = await query('SELECT * FROM faculty WHERE user_id = $1', [id]);
    profile = r.rows[0] || null;
  }

  res.json({ success: true, data: { user, profile } });
});

module.exports = { register, login, me };
