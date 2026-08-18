const { z } = require('zod');
const { query, pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { evaluateEligibility } = require('../utils/eligibility');
const { logAction } = require('../services/auditService');

async function attachRequirements(job) {
  const [req_, depts] = await Promise.all([
    query('SELECT * FROM job_requirements WHERE job_drive_id = $1', [job.id]),
    query('SELECT department_id FROM job_eligible_departments WHERE job_drive_id = $1', [job.id]),
  ]);
  return {
    ...job,
    requirements: req_.rows[0] || null,
    eligible_department_ids: depts.rows.map((r) => r.department_id),
  };
}

const listJobs = asyncHandler(async (req, res) => {
  const { search, department, minPackage, maxPackage, status, company, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(jd.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
  }
  if (company) { params.push(company); conditions.push(`jd.company_id = $${params.length}`); }
  if (minPackage) { params.push(minPackage); conditions.push(`jd.package_max_lpa >= $${params.length}`); }
  if (maxPackage) { params.push(maxPackage); conditions.push(`jd.package_min_lpa <= $${params.length}`); }

  if (status) {
    params.push(status);
    conditions.push(`jd.status = $${params.length}`);
  } else if (req.user?.role === 'STUDENT') {
    conditions.push(`jd.status = 'OPEN'`);
  }

  if (department) {
    params.push(department);
    conditions.push(`EXISTS (SELECT 1 FROM job_eligible_departments jed WHERE jed.job_drive_id = jd.id AND jed.department_id = $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);
  const countResult = await query(`SELECT COUNT(*) FROM job_drives jd JOIN companies c ON c.id = jd.company_id ${where}`, params);
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT jd.*, c.name AS company_name, c.logo_url AS company_logo
     FROM job_drives jd JOIN companies c ON c.id = jd.company_id
     ${where} ORDER BY jd.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  let jobs = rows;

  // If a student is viewing, attach eligibility info to each job.
  if (req.user?.role === 'STUDENT') {
    const studentResult = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    const student = studentResult.rows[0];
    if (student) {
      jobs = await Promise.all(rows.map(async (job) => {
        const full = await attachRequirements(job);
        const { eligible, reasons } = evaluateEligibility(student, {
          min_cgpa: full.requirements?.min_cgpa ?? 0,
          max_backlogs: full.requirements?.max_backlogs ?? 0,
          graduation_year: full.requirements?.graduation_year,
          eligible_department_ids: full.eligible_department_ids,
        });
        return { ...job, eligible, eligibilityReasons: reasons };
      }));
    }
  }

  res.json({ success: true, data: jobs, meta: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) } });
});

const getJob = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT jd.*, c.name AS company_name, c.logo_url AS company_logo, c.description AS company_description
     FROM job_drives jd JOIN companies c ON c.id = jd.company_id WHERE jd.id = $1`,
    [req.params.id]
  );
  if (!rows.length) throw new ApiError(404, 'Job drive not found');
  const full = await attachRequirements(rows[0]);

  let eligibility = null;
  if (req.user?.role === 'STUDENT') {
    const studentResult = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    const student = studentResult.rows[0];
    if (student) {
      eligibility = evaluateEligibility(student, {
        min_cgpa: full.requirements?.min_cgpa ?? 0,
        max_backlogs: full.requirements?.max_backlogs ?? 0,
        graduation_year: full.requirements?.graduation_year,
        eligible_department_ids: full.eligible_department_ids,
      });
    }
  }

  res.json({ success: true, data: { ...full, eligibility } });
});

const jobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'INTERNSHIP', 'INTERN_PPO', 'CONTRACT']).default('FULL_TIME'),
  packageMinLpa: z.coerce.number().min(0),
  packageMaxLpa: z.coerce.number().min(0),
  applicationDeadline: z.string(),
  driveDate: z.string().optional(),
  minCgpa: z.coerce.number().min(0).max(10),
  maxBacklogs: z.coerce.number().min(0),
  graduationYear: z.coerce.number().optional(),
  requiredSkills: z.array(z.string()).default([]),
  eligibleDepartmentIds: z.array(z.coerce.number()).min(1),
});

const createJob = asyncHandler(async (req, res) => {
  const data = jobSchema.parse(req.body);
  let companyId = req.body.companyId;

  if (req.user.role === 'COMPANY') {
    const c = await query('SELECT id, approval_status FROM companies WHERE user_id = $1', [req.user.id]);
    if (!c.rows.length) throw new ApiError(404, 'Company profile not found');
    if (c.rows[0].approval_status !== 'APPROVED') throw new ApiError(403, 'Your company must be approved by admin before posting job drives');
    companyId = c.rows[0].id;
  }
  if (!companyId) throw new ApiError(422, 'companyId is required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const jobResult = await client.query(
      `INSERT INTO job_drives (company_id, title, description, location, employment_type, package_min_lpa, package_max_lpa, application_deadline, drive_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING_APPROVAL') RETURNING *`,
      [companyId, data.title, data.description, data.location || null, data.employmentType,
       data.packageMinLpa, data.packageMaxLpa, data.applicationDeadline, data.driveDate || null]
    );
    const job = jobResult.rows[0];
    await client.query(
      `INSERT INTO job_requirements (job_drive_id, min_cgpa, max_backlogs, graduation_year, required_skills) VALUES ($1,$2,$3,$4,$5)`,
      [job.id, data.minCgpa, data.maxBacklogs, data.graduationYear || null, data.requiredSkills]
    );
    for (const deptId of data.eligibleDepartmentIds) {
      await client.query(`INSERT INTO job_eligible_departments (job_drive_id, department_id) VALUES ($1,$2)`, [job.id, deptId]);
    }
    await client.query('COMMIT');
    await logAction(req.user.id, 'CREATE_JOB_DRIVE', 'job_drive', job.id, { title: data.title });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const updateJobStatusSchema = z.object({ status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'OPEN', 'CLOSED', 'CANCELLED']) });

const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.body.status && Object.keys(req.body).length === 1) {
    const { status } = updateJobStatusSchema.parse(req.body);
    if (status === 'OPEN' && req.user.role !== 'ADMIN') throw new ApiError(403, 'Only admin can approve a job drive to go live');
    const { rows } = await query('UPDATE job_drives SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (!rows.length) throw new ApiError(404, 'Job drive not found');
    await logAction(req.user.id, 'UPDATE_JOB_STATUS', 'job_drive', id, { status });
    return res.json({ success: true, data: rows[0] });
  }

  const data = jobSchema.partial().parse(req.body);
  const map = {
    title: 'title', description: 'description', location: 'location', employmentType: 'employment_type',
    packageMinLpa: 'package_min_lpa', packageMaxLpa: 'package_max_lpa', applicationDeadline: 'application_deadline', driveDate: 'drive_date',
  };
  const setClauses = [];
  const params = [];
  Object.entries(data).forEach(([key, value]) => {
    if (!map[key]) return;
    params.push(value);
    setClauses.push(`${map[key]} = $${params.length}`);
  });
  if (!setClauses.length) throw new ApiError(422, 'No valid fields to update');
  params.push(id);
  const { rows } = await query(`UPDATE job_drives SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
  if (!rows.length) throw new ApiError(404, 'Job drive not found');
  res.json({ success: true, data: rows[0] });
});

const deleteJob = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM job_drives WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows.length) throw new ApiError(404, 'Job drive not found');
  await logAction(req.user.id, 'DELETE_JOB_DRIVE', 'job_drive', req.params.id, {});
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
