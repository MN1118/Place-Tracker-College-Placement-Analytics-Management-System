const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Reports are returned as structured JSON; the client library (see
 * client/src/utils/exportReport.js) turns this into CSV / Excel / PDF
 * so no server-side binary generation dependency is required.
 */
const overallReport = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT s.roll_number, s.full_name, d.name AS department, s.course, s.graduation_year, s.cgpa,
           s.is_placed, c.name AS company, p.package_lpa, p.offer_date
    FROM students s
    JOIN departments d ON d.id = s.department_id
    LEFT JOIN placements p ON p.student_id = s.id
    LEFT JOIN companies c ON c.id = p.company_id
    ORDER BY d.name, s.full_name
  `);
  res.json({ success: true, data: rows });
});

const departmentReport = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT d.name AS department, COUNT(DISTINCT s.id) AS total_students,
           COUNT(DISTINCT p.id) AS placed_students, COALESCE(AVG(p.package_lpa), 0) AS avg_package
    FROM departments d
    LEFT JOIN students s ON s.department_id = d.id
    LEFT JOIN placements p ON p.student_id = s.id
    GROUP BY d.name ORDER BY d.name
  `);
  res.json({ success: true, data: rows });
});

const companyReport = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT c.name AS company, COUNT(DISTINCT jd.id) AS job_drives, COUNT(DISTINCT a.id) AS applications,
           COUNT(DISTINCT p.id) AS selected, COALESCE(AVG(p.package_lpa), 0) AS avg_package
    FROM companies c
    LEFT JOIN job_drives jd ON jd.company_id = c.id
    LEFT JOIN applications a ON a.job_drive_id = jd.id
    LEFT JOIN placements p ON p.company_id = c.id
    WHERE c.approval_status = 'APPROVED'
    GROUP BY c.name ORDER BY c.name
  `);
  res.json({ success: true, data: rows });
});

const salaryReport = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT s.full_name, s.roll_number, d.name AS department, c.name AS company, p.package_lpa, p.offer_date
    FROM placements p
    JOIN students s ON s.id = p.student_id
    JOIN departments d ON d.id = s.department_id
    JOIN companies c ON c.id = p.company_id
    ORDER BY p.package_lpa DESC
  `);
  res.json({ success: true, data: rows });
});

module.exports = { overallReport, departmentReport, companyReport, salaryReport };
