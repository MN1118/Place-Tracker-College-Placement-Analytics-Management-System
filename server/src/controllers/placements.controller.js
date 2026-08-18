const { z } = require('zod');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { notifyUser } = require('../services/notificationService');
const { logAction } = require('../services/auditService');

const listPlacements = asyncHandler(async (req, res) => {
  const { department, company, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];
  if (department) { params.push(department); conditions.push(`s.department_id = $${params.length}`); }
  if (company) { params.push(company); conditions.push(`p.company_id = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);
  const countResult = await query(`SELECT COUNT(*) FROM placements p JOIN students s ON s.id = p.student_id ${where}`, params);
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT p.*, s.full_name AS student_name, s.roll_number, d.name AS department_name, c.name AS company_name, jd.title AS job_title
     FROM placements p
     JOIN students s ON s.id = p.student_id
     JOIN departments d ON d.id = s.department_id
     JOIN companies c ON c.id = p.company_id
     JOIN job_drives jd ON jd.id = p.job_drive_id
     ${where} ORDER BY p.offer_date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  res.json({ success: true, data: rows, meta: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) } });
});

const createSchema = z.object({
  applicationId: z.string().uuid(),
  packageLpa: z.coerce.number().min(0),
  joiningDate: z.string().optional(),
});

const createPlacement = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const appResult = await query(
    `SELECT a.*, jd.company_id FROM applications a JOIN job_drives jd ON jd.id = a.job_drive_id WHERE a.id = $1`,
    [data.applicationId]
  );
  if (!appResult.rows.length) throw new ApiError(404, 'Application not found');
  const application = appResult.rows[0];

  const { rows } = await query(
    `INSERT INTO placements (student_id, application_id, company_id, job_drive_id, package_lpa, joining_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [application.student_id, application.id, application.company_id, application.job_drive_id, data.packageLpa, data.joiningDate || null]
  );
  await query(`UPDATE students SET is_placed = TRUE WHERE id = $1`, [application.student_id]);
  await query(`UPDATE applications SET status = 'SELECTED' WHERE id = $1`, [application.id]);

  const studentUser = await query('SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1', [application.student_id]);
  if (studentUser.rows.length) {
    await notifyUser(studentUser.rows[0].id, 'SELECTED', 'Congratulations! You have been selected',
      `You have received an offer of ${data.packageLpa} LPA. View details in your placements section.`);
  }

  await logAction(req.user.id, 'CREATE_PLACEMENT', 'placement', rows[0].id, { packageLpa: data.packageLpa });
  res.status(201).json({ success: true, data: rows[0] });
});

const updateSchema = z.object({ packageLpa: z.coerce.number().min(0).optional(), joiningDate: z.string().optional() });

const updatePlacement = asyncHandler(async (req, res) => {
  const data = updateSchema.parse(req.body);
  const map = { packageLpa: 'package_lpa', joiningDate: 'joining_date' };
  const setClauses = [];
  const params = [];
  Object.entries(data).forEach(([key, value]) => { params.push(value); setClauses.push(`${map[key]} = $${params.length}`); });
  if (!setClauses.length) throw new ApiError(422, 'No valid fields to update');
  params.push(req.params.id);
  const { rows } = await query(`UPDATE placements SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
  if (!rows.length) throw new ApiError(404, 'Placement not found');
  res.json({ success: true, data: rows[0] });
});

module.exports = { listPlacements, createPlacement, updatePlacement };
