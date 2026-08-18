const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/** Builds a WHERE clause fragment for optional academic-year / department filters shared across endpoints. */
function buildFilters(reqQuery, aliasMap) {
  const conditions = [];
  const params = [];
  if (reqQuery.year) { params.push(reqQuery.year); conditions.push(`${aliasMap.year} = $${params.length}`); }
  if (reqQuery.department) { params.push(reqQuery.department); conditions.push(`${aliasMap.department} = $${params.length}`); }
  return { conditions, params };
}

const overview = asyncHandler(async (req, res) => {
  const [
    totalStudents, eligibleStudents, totalCompanies, totalJobs, totalApplications,
    shortlisted, placedStats, packageStats,
  ] = await Promise.all([
    query('SELECT COUNT(*) FROM students'),
    query(`SELECT COUNT(*) FROM students s WHERE EXISTS (
             SELECT 1 FROM job_drives jd JOIN job_requirements jr ON jr.job_drive_id = jd.id
             WHERE jd.status = 'OPEN' AND s.cgpa >= jr.min_cgpa AND s.backlogs <= jr.max_backlogs)`),
    query(`SELECT COUNT(*) FROM companies WHERE approval_status = 'APPROVED'`),
    query(`SELECT COUNT(*) FROM job_drives WHERE status = 'OPEN'`),
    query('SELECT COUNT(*) FROM applications'),
    query(`SELECT COUNT(*) FROM applications WHERE status IN ('SHORTLISTED','TEST_SCHEDULED','TEST_COMPLETED','TECH_INTERVIEW','HR_INTERVIEW','SELECTED')`),
    query(`SELECT COUNT(*) AS placed_count FROM placements`),
    query(`SELECT COALESCE(AVG(package_lpa),0) AS avg_package, COALESCE(MAX(package_lpa),0) AS max_package FROM placements`),
  ]);

  const totalStudentsCount = Number(totalStudents.rows[0].count);
  const placedCount = Number(placedStats.rows[0].placed_count);

  res.json({
    success: true,
    data: {
      totalStudents: totalStudentsCount,
      eligibleStudents: Number(eligibleStudents.rows[0].count),
      registeredStudents: totalStudentsCount,
      totalCompanies: Number(totalCompanies.rows[0].count),
      totalJobDrives: Number(totalJobs.rows[0].count),
      totalApplications: Number(totalApplications.rows[0].count),
      shortlistedStudents: Number(shortlisted.rows[0].count),
      placedStudents: placedCount,
      placementPercentage: totalStudentsCount ? Number(((placedCount / totalStudentsCount) * 100).toFixed(1)) : 0,
      averagePackageLpa: Number(Number(packageStats.rows[0].avg_package).toFixed(2)),
      highestPackageLpa: Number(Number(packageStats.rows[0].max_package).toFixed(2)),
    },
  });
});

const departmentAnalytics = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT
      d.id, d.name,
      COUNT(DISTINCT s.id) AS total_students,
      COUNT(DISTINCT s.id) FILTER (WHERE s.cgpa >= 6.0) AS eligible_students,
      COUNT(DISTINCT a.id) AS applications,
      COUNT(DISTINCT a.id) FILTER (WHERE a.status NOT IN ('APPLIED','REJECTED','WITHDRAWN')) AS shortlisted,
      COUNT(DISTINCT p.id) AS placed,
      COALESCE(AVG(p.package_lpa), 0) AS avg_package,
      COALESCE(MAX(p.package_lpa), 0) AS max_package
    FROM departments d
    LEFT JOIN students s ON s.department_id = d.id
    LEFT JOIN applications a ON a.student_id = s.id
    LEFT JOIN placements p ON p.student_id = s.id
    GROUP BY d.id, d.name
    ORDER BY d.name
  `);

  const data = rows.map((r) => ({
    department: r.name,
    totalStudents: Number(r.total_students),
    eligibleStudents: Number(r.eligible_students),
    applications: Number(r.applications),
    shortlisted: Number(r.shortlisted),
    placed: Number(r.placed),
    placementPercentage: Number(r.total_students) ? Number(((r.placed / r.total_students) * 100).toFixed(1)) : 0,
    averagePackageLpa: Number(Number(r.avg_package).toFixed(2)),
    highestPackageLpa: Number(Number(r.max_package).toFixed(2)),
  }));

  res.json({ success: true, data });
});

const companyAnalytics = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT
      c.id, c.name,
      COUNT(DISTINCT jd.id) AS job_drives,
      COUNT(DISTINCT a.id) AS applications,
      COUNT(DISTINCT a.id) FILTER (WHERE a.status NOT IN ('APPLIED','REJECTED','WITHDRAWN')) AS shortlisted,
      COUNT(DISTINCT i.id) AS interviews,
      COUNT(DISTINCT p.id) AS selected,
      COALESCE(AVG(p.package_lpa), 0) AS avg_package
    FROM companies c
    LEFT JOIN job_drives jd ON jd.company_id = c.id
    LEFT JOIN applications a ON a.job_drive_id = jd.id
    LEFT JOIN interviews i ON i.application_id = a.id
    LEFT JOIN placements p ON p.company_id = c.id
    WHERE c.approval_status = 'APPROVED'
    GROUP BY c.id, c.name
    ORDER BY selected DESC, c.name
  `);

  const data = rows.map((r) => ({
    company: r.name,
    jobDrives: Number(r.job_drives),
    applications: Number(r.applications),
    shortlisted: Number(r.shortlisted),
    interviews: Number(r.interviews),
    selected: Number(r.selected),
    selectionRate: Number(r.applications) ? Number(((r.selected / r.applications) * 100).toFixed(1)) : 0,
    averagePackageLpa: Number(Number(r.avg_package).toFixed(2)),
  }));

  res.json({ success: true, data });
});

const packageAnalytics = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT
      CASE
        WHEN package_lpa < 5 THEN '0-5 LPA'
        WHEN package_lpa < 8 THEN '5-8 LPA'
        WHEN package_lpa < 12 THEN '8-12 LPA'
        WHEN package_lpa < 18 THEN '12-18 LPA'
        ELSE '18+ LPA'
      END AS bucket,
      COUNT(*) AS count
    FROM placements
    GROUP BY bucket
    ORDER BY MIN(package_lpa)
  `);
  res.json({ success: true, data: rows.map((r) => ({ range: r.bucket, count: Number(r.count) })) });
});

const placementTrend = asyncHandler(async (req, res) => {
  const [monthly, yearly, funnel] = await Promise.all([
    query(`
      SELECT to_char(date_trunc('month', offer_date), 'Mon YYYY') AS month, COUNT(*) AS placed
      FROM placements GROUP BY date_trunc('month', offer_date) ORDER BY date_trunc('month', offer_date)
    `),
    query(`
      SELECT s.graduation_year AS year, COUNT(DISTINCT p.id) AS placed, COUNT(DISTINCT s.id) AS total
      FROM students s LEFT JOIN placements p ON p.student_id = s.id
      GROUP BY s.graduation_year ORDER BY s.graduation_year
    `),
    query(`SELECT status, COUNT(*) AS count FROM applications GROUP BY status`),
  ]);

  res.json({
    success: true,
    data: {
      monthlyPlacements: monthly.rows.map((r) => ({ month: r.month, placed: Number(r.placed) })),
      yearWiseTrend: yearly.rows.map((r) => ({
        year: r.year,
        placed: Number(r.placed),
        total: Number(r.total),
        placementPercentage: Number(r.total) ? Number(((r.placed / r.total) * 100).toFixed(1)) : 0,
      })),
      applicationFunnel: funnel.rows.map((r) => ({ status: r.status, count: Number(r.count) })),
    },
  });
});

const genderAndCourse = asyncHandler(async (req, res) => {
  const [gender, course, roles] = await Promise.all([
    query(`
      SELECT s.gender, COUNT(DISTINCT s.id) AS total, COUNT(DISTINCT p.id) AS placed
      FROM students s LEFT JOIN placements p ON p.student_id = s.id GROUP BY s.gender
    `),
    query(`
      SELECT s.course, COUNT(DISTINCT s.id) AS total, COUNT(DISTINCT p.id) AS placed
      FROM students s LEFT JOIN placements p ON p.student_id = s.id GROUP BY s.course ORDER BY s.course
    `),
    query(`
      SELECT jd.title AS role, COUNT(DISTINCT p.id) AS placed
      FROM placements p JOIN job_drives jd ON jd.id = p.job_drive_id GROUP BY jd.title ORDER BY placed DESC LIMIT 10
    `),
  ]);

  res.json({
    success: true,
    data: {
      genderWise: gender.rows.map((r) => ({ gender: r.gender, total: Number(r.total), placed: Number(r.placed) })),
      courseWise: course.rows.map((r) => ({
        course: r.course, total: Number(r.total), placed: Number(r.placed),
        placementPercentage: Number(r.total) ? Number(((r.placed / r.total) * 100).toFixed(1)) : 0,
      })),
      jobRoleDistribution: roles.rows.map((r) => ({ role: r.role, placed: Number(r.placed) })),
    },
  });
});

module.exports = { overview, departmentAnalytics, companyAnalytics, packageAnalytics, placementTrend, genderAndCourse };
