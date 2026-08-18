/**
 * Eligibility Engine
 * Determines whether a student is eligible for a given job drive and,
 * if not, returns the specific reasons why.
 */
function evaluateEligibility(student, job) {
  const reasons = [];

  if (student.cgpa < job.min_cgpa) {
    reasons.push(`CGPA ${student.cgpa} is below the required minimum of ${job.min_cgpa}`);
  }
  if (student.backlogs > job.max_backlogs) {
    reasons.push(`${student.backlogs} active backlog(s) exceed the allowed maximum of ${job.max_backlogs}`);
  }
  if (job.graduation_year && student.graduation_year !== job.graduation_year) {
    reasons.push(`Graduation year ${student.graduation_year} does not match required year ${job.graduation_year}`);
  }
  if (job.eligible_department_ids && job.eligible_department_ids.length > 0 &&
      !job.eligible_department_ids.includes(student.department_id)) {
    reasons.push('Your department is not eligible for this drive');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

module.exports = { evaluateEligibility };
