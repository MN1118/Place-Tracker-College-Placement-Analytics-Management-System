const { z } = require('zod');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const listStudents = asyncHandler(async (req, res) => {
  const { search, department, status, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(s.full_name ILIKE $${params.length} OR s.roll_number ILIKE $${params.length})`);
  }
  if (department) {
    params.push(department);
    conditions.push(`s.department_id = $${params.length}`);
  }
  if (status === 'placed') conditions.push('s.is_placed = TRUE');
  if (status === 'unplaced') conditions.push('s.is_placed = FALSE');

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const countResult = await query(`SELECT COUNT(*) FROM students s ${where}`, params);
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT s.*, d.name AS department_name, u.email
     FROM students s
     JOIN departments d ON d.id = s.department_id
     JOIN users u ON u.id = s.user_id
     ${where}
     ORDER BY s.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    success: true,
    data: rows,
    meta: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) },
  });
});

const getStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await query(
    `SELECT s.*, d.name AS department_name, u.email FROM students s
     JOIN departments d ON d.id = s.department_id
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1`,
    [id]
  );
  if (!rows.length) throw new ApiError(404, 'Student not found');

  const [skills, certs, projects, internships, resumes] = await Promise.all([
    query(`SELECT sk.id, sk.name, ss.proficiency FROM student_skills ss JOIN skills sk ON sk.id = ss.skill_id WHERE ss.student_id = $1`, [id]),
    query(`SELECT * FROM student_certifications WHERE student_id = $1 ORDER BY issued_on DESC NULLS LAST`, [id]),
    query(`SELECT * FROM student_projects WHERE student_id = $1`, [id]),
    query(`SELECT * FROM student_internships WHERE student_id = $1 ORDER BY start_date DESC NULLS LAST`, [id]),
    query(`SELECT * FROM resumes WHERE student_id = $1 ORDER BY uploaded_at DESC`, [id]),
  ]);

  res.json({
    success: true,
    data: { ...rows[0], skills: skills.rows, certifications: certs.rows, projects: projects.rows, internships: internships.rows, resumes: resumes.rows },
  });
});

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  backlogs: z.coerce.number().min(0).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

const FIELD_MAP = {
  fullName: 'full_name', phone: 'phone', dateOfBirth: 'date_of_birth', gender: 'gender',
  cgpa: 'cgpa', backlogs: 'backlogs', githubUrl: 'github_url', linkedinUrl: 'linkedin_url',
};

const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Students may only edit their own profile; admins/faculty may edit any.
  if (req.user.role === 'STUDENT') {
    const owner = await query('SELECT id FROM students WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!owner.rows.length) throw new ApiError(403, 'You can only update your own profile');
  }

  const data = updateSchema.parse(req.body);
  const setClauses = [];
  const params = [];
  Object.entries(data).forEach(([key, value]) => {
    params.push(value);
    setClauses.push(`${FIELD_MAP[key]} = $${params.length}`);
  });
  if (!setClauses.length) throw new ApiError(422, 'No valid fields to update');

  params.push(id);
  const { rows } = await query(
    `UPDATE students SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows.length) throw new ApiError(404, 'Student not found');

  // Recalculate a simple profile completion score
  const s = rows[0];
  const fields = [s.full_name, s.phone, s.date_of_birth, s.cgpa, s.github_url, s.linkedin_url];
  const filled = fields.filter(Boolean).length;
  const completion = Math.round((filled / fields.length) * 100);
  await query('UPDATE students SET profile_completion = $1 WHERE id = $2', [completion, id]);

  res.json({ success: true, data: { ...s, profile_completion: completion } });
});

module.exports = { listStudents, getStudent, updateStudent };
