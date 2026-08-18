const { z } = require('zod');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../services/auditService');

const listCompanies = asyncHandler(async (req, res) => {
  const { search, approval, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR industry ILIKE $${params.length})`);
  }
  if (approval) {
    params.push(approval);
    conditions.push(`approval_status = $${params.length}`);
  } else if (req.user?.role === 'STUDENT') {
    conditions.push(`approval_status = 'APPROVED'`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);
  const countResult = await query(`SELECT COUNT(*) FROM companies ${where}`, params);
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT * FROM companies ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ success: true, data: rows, meta: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) } });
});

const getCompany = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
  if (!rows.length) throw new ApiError(404, 'Company not found');
  const jobs = await query('SELECT * FROM job_drives WHERE company_id = $1 ORDER BY created_at DESC', [req.params.id]);
  res.json({ success: true, data: { ...rows[0], jobDrives: jobs.rows } });
});

const createCompanySchema = z.object({
  name: z.string().min(2),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  hqLocation: z.string().optional(),
});

const createCompany = asyncHandler(async (req, res) => {
  const data = createCompanySchema.parse(req.body);
  const { rows } = await query(
    `INSERT INTO companies (name, industry, website, description, hq_location, approval_status)
     VALUES ($1,$2,$3,$4,$5, $6) RETURNING *`,
    [data.name, data.industry || null, data.website || null, data.description || null, data.hqLocation || null,
     req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING']
  );
  await logAction(req.user.id, 'CREATE_COMPANY', 'company', rows[0].id, { name: data.name });
  res.status(201).json({ success: true, data: rows[0] });
});

const updateCompanySchema = createCompanySchema.partial().extend({
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

const updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role === 'COMPANY') {
    const owner = await query('SELECT id FROM companies WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!owner.rows.length) throw new ApiError(403, 'You can only update your own company profile');
  }
  const data = updateCompanySchema.parse(req.body);
  if (data.approvalStatus && req.user.role !== 'ADMIN') throw new ApiError(403, 'Only admins can change approval status');

  const map = { name: 'name', industry: 'industry', website: 'website', description: 'description', hqLocation: 'hq_location', approvalStatus: 'approval_status' };
  const setClauses = [];
  const params = [];
  Object.entries(data).forEach(([key, value]) => {
    params.push(value);
    setClauses.push(`${map[key]} = $${params.length}`);
  });
  if (!setClauses.length) throw new ApiError(422, 'No valid fields to update');
  params.push(id);

  const { rows } = await query(`UPDATE companies SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
  if (!rows.length) throw new ApiError(404, 'Company not found');

  if (data.approvalStatus) await logAction(req.user.id, 'UPDATE_COMPANY_APPROVAL', 'company', id, { approvalStatus: data.approvalStatus });
  res.json({ success: true, data: rows[0] });
});

module.exports = { listCompanies, getCompany, createCompany, updateCompany };
