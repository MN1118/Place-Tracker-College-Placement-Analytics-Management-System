const { z } = require('zod');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { notifyUser } = require('../services/notificationService');

const createSchema = z.object({
  applicationId: z.string().uuid(),
  roundType: z.enum(['TECHNICAL', 'HR', 'MANAGERIAL', 'GROUP_DISCUSSION']),
  scheduledAt: z.string(),
  mode: z.string().default('ONLINE'),
  locationOrLink: z.string().optional(),
  interviewer: z.string().optional(),
});

const createInterview = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const { rows } = await query(
    `INSERT INTO interviews (application_id, round_type, scheduled_at, mode, location_or_link, interviewer)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.applicationId, data.roundType, data.scheduledAt, data.mode, data.locationOrLink || null, data.interviewer || null]
  );

  const studentUser = await query(
    `SELECT u.id FROM applications a JOIN students s ON s.id = a.student_id JOIN users u ON u.id = s.user_id WHERE a.id = $1`,
    [data.applicationId]
  );
  if (studentUser.rows.length) {
    await notifyUser(studentUser.rows[0].id, 'INTERVIEW_SCHEDULED', 'Interview scheduled',
      `A ${data.roundType.toLowerCase()} interview round has been scheduled for one of your applications.`);
  }

  res.status(201).json({ success: true, data: rows[0] });
});

const listInterviews = asyncHandler(async (req, res) => {
  const { applicationId, upcoming } = req.query;
  const conditions = [];
  const params = [];

  if (applicationId) { params.push(applicationId); conditions.push(`i.application_id = $${params.length}`); }
  if (upcoming === 'true') conditions.push(`i.scheduled_at >= now()`);

  if (req.user.role === 'STUDENT') {
    const s = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    params.push(s.rows[0]?.id || null);
    conditions.push(`a.student_id = $${params.length}`);
  } else if (req.user.role === 'COMPANY') {
    const c = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    params.push(c.rows[0]?.id || null);
    conditions.push(`jd.company_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT i.*, s.full_name AS student_name, jd.title AS job_title, c.name AS company_name
     FROM interviews i
     JOIN applications a ON a.id = i.application_id
     JOIN students s ON s.id = a.student_id
     JOIN job_drives jd ON jd.id = a.job_drive_id
     JOIN companies c ON c.id = jd.company_id
     ${where} ORDER BY i.scheduled_at ASC`,
    params
  );
  res.json({ success: true, data: rows });
});

const updateSchema = z.object({
  result: z.enum(['PENDING', 'PASS', 'FAIL', 'ON_HOLD']).optional(),
  feedback: z.string().optional(),
  scheduledAt: z.string().optional(),
});

const updateInterview = asyncHandler(async (req, res) => {
  const data = updateSchema.parse(req.body);
  const map = { result: 'result', feedback: 'feedback', scheduledAt: 'scheduled_at' };
  const setClauses = [];
  const params = [];
  Object.entries(data).forEach(([key, value]) => {
    params.push(value);
    setClauses.push(`${map[key]} = $${params.length}`);
  });
  if (!setClauses.length) throw new ApiError(422, 'No valid fields to update');
  params.push(req.params.id);
  const { rows } = await query(`UPDATE interviews SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
  if (!rows.length) throw new ApiError(404, 'Interview not found');
  res.json({ success: true, data: rows[0] });
});

module.exports = { createInterview, listInterviews, updateInterview };
