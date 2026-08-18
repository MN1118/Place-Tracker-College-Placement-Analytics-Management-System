const { z } = require('zod');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { evaluateEligibility } = require('../utils/eligibility');
const { notifyUser } = require('../services/notificationService');
const { logAction } = require('../services/auditService');

const applySchema = z.object({ jobDriveId: z.string().uuid() });

const applyToJob = asyncHandler(async (req, res) => {
  const { jobDriveId } = applySchema.parse(req.body);

  const studentResult = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
  const student = studentResult.rows[0];
  if (!student) throw new ApiError(404, 'Student profile not found');

  const jobResult = await query('SELECT * FROM job_drives WHERE id = $1', [jobDriveId]);
  const job = jobResult.rows[0];
  if (!job) throw new ApiError(404, 'Job drive not found');
  if (job.status !== 'OPEN') throw new ApiError(400, 'This job drive is not currently accepting applications');
  if (new Date(job.application_deadline) < new Date()) throw new ApiError(400, 'The application deadline has passed');

  const [reqResult, deptResult] = await Promise.all([
    query('SELECT * FROM job_requirements WHERE job_drive_id = $1', [jobDriveId]),
    query('SELECT department_id FROM job_eligible_departments WHERE job_drive_id = $1', [jobDriveId]),
  ]);
  const { eligible, reasons } = evaluateEligibility(student, {
    min_cgpa: reqResult.rows[0]?.min_cgpa ?? 0,
    max_backlogs: reqResult.rows[0]?.max_backlogs ?? 0,
    graduation_year: reqResult.rows[0]?.graduation_year,
    eligible_department_ids: deptResult.rows.map((r) => r.department_id),
  });
  if (!eligible) throw new ApiError(403, 'You are not eligible for this job drive', reasons);

  const existing = await query('SELECT id FROM applications WHERE student_id = $1 AND job_drive_id = $2', [student.id, jobDriveId]);
  if (existing.rows.length) throw new ApiError(409, 'You have already applied to this job drive');

  const { rows } = await query(
    `INSERT INTO applications (student_id, job_drive_id) VALUES ($1,$2) RETURNING *`,
    [student.id, jobDriveId]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

const myApplications = asyncHandler(async (req, res) => {
  const studentResult = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
  if (!studentResult.rows.length) throw new ApiError(404, 'Student profile not found');

  const { rows } = await query(
    `SELECT a.*, jd.title AS job_title, jd.location, jd.package_min_lpa, jd.package_max_lpa, jd.drive_date, c.name AS company_name
     FROM applications a
     JOIN job_drives jd ON jd.id = a.job_drive_id
     JOIN companies c ON c.id = jd.company_id
     WHERE a.student_id = $1 ORDER BY a.applied_at DESC`,
    [studentResult.rows[0].id]
  );
  res.json({ success: true, data: rows });
});

const listApplications = asyncHandler(async (req, res) => {
  const { jobDriveId, status, department, search, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];

  if (jobDriveId) { params.push(jobDriveId); conditions.push(`a.job_drive_id = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`a.status = $${params.length}`); }
  if (department) { params.push(department); conditions.push(`s.department_id = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conditions.push(`(s.full_name ILIKE $${params.length} OR c.name ILIKE $${params.length})`); }

  if (req.user.role === 'COMPANY') {
    const c = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    params.push(c.rows[0]?.id || null);
    conditions.push(`jd.company_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);
  const countResult = await query(
    `SELECT COUNT(*) FROM applications a JOIN students s ON s.id=a.student_id JOIN job_drives jd ON jd.id=a.job_drive_id JOIN companies c ON c.id=jd.company_id ${where}`,
    params
  );
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT a.*, s.full_name AS student_name, s.roll_number, s.cgpa, d.name AS department_name,
            jd.title AS job_title, c.name AS company_name
     FROM applications a
     JOIN students s ON s.id = a.student_id
     JOIN departments d ON d.id = s.department_id
     JOIN job_drives jd ON jd.id = a.job_drive_id
     JOIN companies c ON c.id = jd.company_id
     ${where} ORDER BY a.applied_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  res.json({ success: true, data: rows, meta: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) } });
});

const getApplication = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT a.*, s.full_name AS student_name, s.roll_number, s.cgpa, jd.title AS job_title, c.name AS company_name
     FROM applications a
     JOIN students s ON s.id = a.student_id
     JOIN job_drives jd ON jd.id = a.job_drive_id
     JOIN companies c ON c.id = jd.company_id
     WHERE a.id = $1`,
    [req.params.id]
  );
  if (!rows.length) throw new ApiError(404, 'Application not found');

  const [history, interviews, testResults] = await Promise.all([
    query('SELECT * FROM application_status_history WHERE application_id = $1 ORDER BY changed_at', [req.params.id]),
    query('SELECT * FROM interviews WHERE application_id = $1 ORDER BY scheduled_at', [req.params.id]),
    query('SELECT tr.*, t.name AS test_name FROM test_results tr JOIN tests t ON t.id = tr.test_id WHERE tr.application_id = $1', [req.params.id]),
  ]);

  res.json({ success: true, data: { ...rows[0], history: history.rows, interviews: interviews.rows, testResults: testResults.rows } });
});

const NOTIF_COPY = {
  SHORTLISTED: ['You have been shortlisted', 'Congratulations, you have been shortlisted for the next round.'],
  TECH_INTERVIEW: ['Technical interview scheduled', 'You have moved to the technical interview round.'],
  HR_INTERVIEW: ['HR interview scheduled', 'You have moved to the HR interview round.'],
  SELECTED: ['Congratulations! You have been selected', 'You have received an offer. Check your placements section for details.'],
  REJECTED: ['Application update', 'Thank you for applying. Unfortunately you were not selected for this drive.'],
};

const updateStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'TEST_SCHEDULED', 'TEST_COMPLETED', 'TECH_INTERVIEW', 'HR_INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN']),
  remarks: z.string().optional(),
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = updateStatusSchema.parse(req.body);

  const current = await query('SELECT * FROM applications WHERE id = $1', [id]);
  if (!current.rows.length) throw new ApiError(404, 'Application not found');

  const { rows } = await query('UPDATE applications SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  await query(
    `INSERT INTO application_status_history (application_id, from_status, to_status, changed_by, remarks) VALUES ($1,$2,$3,$4,$5)`,
    [id, current.rows[0].status, status, req.user.id, remarks || null]
  );

  const studentUser = await query('SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1', [current.rows[0].student_id]);
  if (NOTIF_COPY[status] && studentUser.rows.length) {
    const [title, message] = NOTIF_COPY[status];
    const type = status === 'SELECTED' ? 'SELECTED' : status === 'REJECTED' ? 'REJECTED' : status === 'SHORTLISTED' ? 'SHORTLISTED' : 'INTERVIEW_SCHEDULED';
    await notifyUser(studentUser.rows[0].id, type, title, message);
  }

  await logAction(req.user.id, 'UPDATE_APPLICATION_STATUS', 'application', id, { status });
  res.json({ success: true, data: rows[0] });
});

module.exports = { applyToJob, myApplications, listApplications, getApplication, updateApplicationStatus };
