/**
 * Generates database/seed.sql with realistic (fictional) demo data:
 * 5 departments, 100+ students, 15 companies, 30 job drives,
 * applications, interviews, placements, notifications.
 *
 * Run: node generate_seed.js > seed.sql   (already wired via npm script)
 */
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
faker.seed(42);

const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password@123', 10);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (a) => `ARRAY[${a.map(q).join(',')}]`;
const uuid = () => faker.string.uuid();

const out = [];
const p = (s) => out.push(s);

p('-- Auto-generated seed data. Do not edit by hand; edit generate_seed.js instead.');
p('BEGIN;');
p('TRUNCATE TABLE audit_logs, notifications, placements, interviews, test_results, tests, shortlists, application_status_history, applications, job_eligible_departments, job_requirements, job_drives, companies, resumes, student_skills, skills, student_internships, student_projects, student_certifications, students, faculty, departments, users RESTART IDENTITY CASCADE;');
p('');

// ---------------- Departments ----------------
const departments = [
  { name: 'Bachelor of Computer Applications', code: 'BCA' },
  { name: 'Bachelor of Computer Science', code: 'BCS' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Bachelor of Business Administration', code: 'BBA' },
  { name: 'Electronics & Communication', code: 'ECE' },
];
p('-- Departments');
departments.forEach((d, i) => {
  p(`INSERT INTO departments (id, name, code) VALUES (${i + 1}, ${q(d.name)}, ${q(d.code)});`);
});
p('');

// ---------------- Skills ----------------
const skillNames = ['JavaScript','TypeScript','React','Node.js','Express','PostgreSQL','MongoDB','Python','Django','Java','Spring Boot','C++','DSA','AWS','Docker','Kubernetes','Git','REST APIs','GraphQL','Tailwind CSS','Next.js','Machine Learning','Data Analysis','SQL','Linux','Figma','Communication','Leadership','Excel','PHP'];
p('-- Skills');
skillNames.forEach((s, i) => p(`INSERT INTO skills (id, name) VALUES (${i + 1}, ${q(s)});`));
p('');

// ---------------- Admin + Faculty ----------------
p('-- Admin account (demo login: admin@campusplacements.edu / Password@123)');
const adminUserId = uuid();
p(`INSERT INTO users (id, email, password_hash, role) VALUES (${q(adminUserId)}, 'admin@campusplacements.edu', ${q(DEMO_PASSWORD_HASH)}, 'ADMIN');`);
p('');

p('-- Faculty coordinators (one per department, demo login: <dept-code-lowercase>.faculty@campusplacements.edu)');
const facultyIds = [];
departments.forEach((d, i) => {
  const userId = uuid();
  const facId = uuid();
  facultyIds.push(facId);
  const email = `${d.code.toLowerCase()}.faculty@campusplacements.edu`;
  p(`INSERT INTO users (id, email, password_hash, role) VALUES (${q(userId)}, ${q(email)}, ${q(DEMO_PASSWORD_HASH)}, 'FACULTY');`);
  p(`INSERT INTO faculty (id, user_id, full_name, department_id, designation, phone) VALUES (${q(facId)}, ${q(userId)}, ${q(faker.person.fullName())}, ${i + 1}, 'Placement Coordinator', ${q(faker.phone.number('##########'))});`);
});
p('');

// ---------------- Companies ----------------
const industries = ['Software & IT Services','Product / SaaS','FinTech','E-Commerce','Consulting','Core Engineering','EdTech','Analytics & Data'];
const companyNames = ['TechNova Solutions','Zenith Software Labs','BluePeak Systems','Orbitel Technologies','Vertex Analytics','Nimbus Cloud Works','CodeCrafters Pvt Ltd','Skyline FinTech','Quantum Byte Systems','Pinnacle Consulting Group','InfraCore Engineering','Lumen Data Systems','NextGen EdTech','Pioneer E-Commerce','Meridian Software'];
p('-- Companies (demo recruiter login for first 3: <slug>@company.com)');
const companies = [];
companyNames.forEach((name, i) => {
  const id = uuid();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  let userId = null;
  if (i < 3) {
    userId = uuid();
    p(`INSERT INTO users (id, email, password_hash, role) VALUES (${q(userId)}, ${q(slug + '@company.com')}, ${q(DEMO_PASSWORD_HASH)}, 'COMPANY');`);
  }
  const approval = i < 13 ? 'APPROVED' : (i === 13 ? 'PENDING' : 'REJECTED');
  companies.push({ id, name, approval });
  p(`INSERT INTO companies (id, user_id, name, industry, website, description, hq_location, approval_status) VALUES (${q(id)}, ${userId ? q(userId) : 'NULL'}, ${q(name)}, ${q(faker.helpers.arrayElement(industries))}, ${q('https://www.' + slug + '.com')}, ${q(faker.company.catchPhrase())}, ${q(faker.location.city() + ', India')}, ${q(approval)});`);
});
p('');

// ---------------- Students ----------------
const courses = { BCA: 'BCA', BCS: 'B.Sc Computer Science', IT: 'B.Tech IT', BBA: 'BBA', ECE: 'B.Tech ECE' };
p('-- Students (demo login for first student: student1@campusplacements.edu / Password@123)');
const students = [];
const STUDENT_COUNT = 120;
for (let i = 1; i <= STUDENT_COUNT; i++) {
  const userId = uuid();
  const studentId = uuid();
  const deptIdx = i % departments.length;
  const dept = departments[deptIdx];
  const gradYear = faker.helpers.arrayElement([2025, 2026, 2027]);
  const cgpa = (Math.random() * (9.6 - 5.5) + 5.5).toFixed(2);
  const backlogs = faker.helpers.weightedArrayElement([
    { weight: 70, value: 0 }, { weight: 20, value: 1 }, { weight: 7, value: 2 }, { weight: 3, value: 3 },
  ]);
  const gender = faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']);
  const fullName = faker.person.fullName();
  const rollNumber = `${dept.code}${gradYear}${String(i).padStart(3, '0')}`;
  const email = `student${i}@campusplacements.edu`;
  const profileCompletion = faker.number.int({ min: 55, max: 100 });

  p(`INSERT INTO users (id, email, password_hash, role) VALUES (${q(userId)}, ${q(email)}, ${q(DEMO_PASSWORD_HASH)}, 'STUDENT');`);
  p(`INSERT INTO students (id, user_id, roll_number, full_name, phone, date_of_birth, gender, department_id, course, graduation_year, cgpa, backlogs, github_url, linkedin_url, profile_completion) VALUES (${q(studentId)}, ${q(userId)}, ${q(rollNumber)}, ${q(fullName)}, ${q(faker.phone.number('##########'))}, ${q(faker.date.birthdate({ min: 20, max: 23, mode: 'age' }).toISOString().slice(0, 10))}, ${q(gender)}, ${deptIdx + 1}, ${q(courses[dept.code])}, ${gradYear}, ${cgpa}, ${backlogs}, ${q('https://github.com/' + faker.internet.userName())}, ${q('https://linkedin.com/in/' + faker.internet.userName())}, ${profileCompletion});`);

  // 2-5 random skills
  const skillIds = faker.helpers.arrayElements(
    Array.from({ length: skillNames.length }, (_, idx) => idx + 1),
    faker.number.int({ min: 3, max: 6 })
  );
  skillIds.forEach((sid) => p(`INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (${q(studentId)}, ${sid}, ${q(faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']))});`));

  // 1 resume
  p(`INSERT INTO resumes (student_id, file_name, file_url, is_primary) VALUES (${q(studentId)}, ${q(fullName.replace(/\s+/g, '_') + '_Resume.pdf')}, ${q('/uploads/resumes/' + studentId + '.pdf')}, TRUE);`);

  students.push({ id: studentId, deptId: deptIdx + 1, gradYear, cgpa: parseFloat(cgpa), backlogs, gender });
}
p('');

// ---------------- Job Drives ----------------
p('-- Job Drives');
const jobTitles = ['Software Engineer Trainee','Backend Developer','Frontend Developer','Full Stack Developer','Data Analyst','QA Engineer','DevOps Engineer','Business Analyst','Associate Software Engineer','Product Support Engineer','ML Engineer Intern','UI/UX Designer','Systems Engineer','Cloud Support Associate','Java Developer'];
const jobDrives = [];
const approvedCompanies = companies.filter((c) => c.approval === 'APPROVED');
for (let i = 0; i < 30; i++) {
  const company = approvedCompanies[i % approvedCompanies.length];
  const id = uuid();
  const title = faker.helpers.arrayElement(jobTitles);
  const empType = faker.helpers.weightedArrayElement([
    { weight: 65, value: 'FULL_TIME' }, { weight: 20, value: 'INTERNSHIP' },
    { weight: 10, value: 'INTERN_PPO' }, { weight: 5, value: 'CONTRACT' },
  ]);
  const packageMin = faker.number.float({ min: 3.5, max: 12, fractionDigits: 1 });
  const packageMax = packageMin + faker.number.float({ min: 0.5, max: 8, fractionDigits: 1 });
  const deadline = faker.date.soon({ days: 45 });
  const driveDate = new Date(deadline.getTime() + 7 * 24 * 3600 * 1000);
  const status = i < 26 ? 'OPEN' : (i < 28 ? 'CLOSED' : 'PENDING_APPROVAL');
  const minCgpa = faker.helpers.arrayElement([6.0, 6.5, 7.0, 7.5]);
  const maxBacklogs = faker.helpers.arrayElement([0, 1, 2]);
  const gradYearReq = faker.helpers.arrayElement([2026, 2027]);
  const reqSkills = faker.helpers.arrayElements(skillNames, faker.number.int({ min: 3, max: 5 }));
  const eligibleDeptIds = faker.helpers.arrayElements([1, 2, 3, 4, 5], faker.number.int({ min: 2, max: 4 }));

  p(`INSERT INTO job_drives (id, company_id, title, description, location, employment_type, package_min_lpa, package_max_lpa, application_deadline, drive_date, status) VALUES (${q(id)}, ${q(company.id)}, ${q(title)}, ${q(faker.lorem.paragraph())}, ${q(faker.location.city() + ', India')}, ${q(empType)}, ${packageMin}, ${packageMax.toFixed(1)}, ${q(deadline.toISOString())}, ${q(driveDate.toISOString())}, ${q(status)});`);
  p(`INSERT INTO job_requirements (job_drive_id, min_cgpa, max_backlogs, graduation_year, required_skills) VALUES (${q(id)}, ${minCgpa}, ${maxBacklogs}, ${gradYearReq}, ${arr(reqSkills)});`);
  eligibleDeptIds.forEach((did) => p(`INSERT INTO job_eligible_departments (job_drive_id, department_id) VALUES (${q(id)}, ${did});`));

  jobDrives.push({ id, companyId: company.id, companyName: company.name, minCgpa, maxBacklogs, gradYearReq, eligibleDeptIds, packageMin, packageMax, status });
}
p('');

// ---------------- Applications, Tests, Interviews, Placements ----------------
p('-- Applications / Tests / Interviews / Placements');
const placedStudentIds = new Set();
const notifications = [];

jobDrives.filter((j) => j.status === 'OPEN' || j.status === 'CLOSED').forEach((job) => {
  const eligibleStudents = students.filter(
    (s) => s.cgpa >= job.minCgpa && s.backlogs <= job.maxBacklogs &&
      job.eligibleDeptIds.includes(s.deptId) && s.gradYear === job.gradYearReq
  );
  const applicants = faker.helpers.arrayElements(eligibleStudents, Math.min(eligibleStudents.length, faker.number.int({ min: 5, max: 25 })));

  const testId = uuid();
  p(`INSERT INTO tests (id, job_drive_id, name, test_date, duration_mins, max_score) VALUES (${q(testId)}, ${q(job.id)}, ${q(job.companyName + ' Online Assessment')}, ${q(faker.date.recent({ days: 20 }).toISOString())}, 90, 100);`);

  applicants.forEach((student) => {
    if (placedStudentIds.has(student.id)) return; // already placed elsewhere
    const appId = uuid();
    const outcomeRoll = Math.random();
    let status = 'APPLIED';
    p(`INSERT INTO applications (id, student_id, job_drive_id, status, applied_at) VALUES (${q(appId)}, ${q(student.id)}, ${q(job.id)}, 'APPLIED', ${q(faker.date.recent({ days: 30 }).toISOString())});`);

    if (outcomeRoll > 0.35) {
      status = 'SHORTLISTED';
      p(`INSERT INTO shortlists (application_id, remarks) VALUES (${q(appId)}, 'Meets criteria after resume review');`);
      const score = faker.number.float({ min: 40, max: 98, fractionDigits: 1 });
      p(`INSERT INTO test_results (test_id, application_id, score, passed) VALUES (${q(testId)}, ${q(appId)}, ${score}, ${score >= 50});`);

      if (score >= 50 && outcomeRoll > 0.55) {
        status = 'TECH_INTERVIEW';
        const techResult = faker.helpers.arrayElement(['PASS', 'PASS', 'FAIL']);
        p(`INSERT INTO interviews (application_id, round_type, scheduled_at, mode, interviewer, result, feedback) VALUES (${q(appId)}, 'TECHNICAL', ${q(faker.date.recent({ days: 10 }).toISOString())}, 'ONLINE', ${q(faker.person.fullName())}, ${q(techResult)}, ${q(faker.lorem.sentence())});`);

        if (techResult === 'PASS' && outcomeRoll > 0.7) {
          status = 'HR_INTERVIEW';
          const hrResult = faker.helpers.arrayElement(['PASS', 'PASS', 'PASS', 'FAIL']);
          p(`INSERT INTO interviews (application_id, round_type, scheduled_at, mode, interviewer, result, feedback) VALUES (${q(appId)}, 'HR', ${q(faker.date.recent({ days: 5 }).toISOString())}, 'ONLINE', ${q(faker.person.fullName())}, ${q(hrResult)}, ${q(faker.lorem.sentence())});`);

          if (hrResult === 'PASS' && outcomeRoll > 0.82) {
            status = 'SELECTED';
            const pkg = faker.number.float({ min: job.packageMin, max: job.packageMax, fractionDigits: 1 });
            p(`INSERT INTO placements (student_id, application_id, company_id, job_drive_id, package_lpa, offer_date) VALUES (${q(student.id)}, ${q(appId)}, ${q(job.companyId)}, ${q(job.id)}, ${pkg}, ${q(faker.date.recent({ days: 3 }).toISOString().slice(0, 10))});`);
            p(`UPDATE students SET is_placed = TRUE WHERE id = ${q(student.id)};`);
            placedStudentIds.add(student.id);
          } else if (hrResult === 'FAIL') {
            status = 'REJECTED';
          }
        } else if (techResult === 'FAIL') {
          status = 'REJECTED';
        }
      }
    } else {
      status = 'REJECTED';
    }

    if (status !== 'APPLIED') {
      p(`UPDATE applications SET status = ${q(status)} WHERE id = ${q(appId)};`);
    }
    p(`INSERT INTO application_status_history (application_id, from_status, to_status, remarks) VALUES (${q(appId)}, 'APPLIED', ${q(status)}, 'Seed-generated workflow progression');`);
  });
});
p('');

// ---------------- Notifications ----------------
p('-- Sample notifications for first 30 students');
const sampleNotifs = [
  ['JOB_POSTED', 'New job opportunity available', 'A new job drive matching your profile has been posted.'],
  ['SHORTLISTED', 'You have been shortlisted', 'Congratulations, you have been shortlisted for the next round.'],
  ['INTERVIEW_SCHEDULED', 'Interview scheduled', 'Your interview has been scheduled. Check the details in your dashboard.'],
  ['DEADLINE_REMINDER', 'Application deadline tomorrow', 'The application deadline for a job you viewed is tomorrow.'],
  ['SELECTED', 'Congratulations! You have been selected', 'You have received an offer. View details in your placements section.'],
];
students.slice(0, 30).forEach((s) => {
  const n = faker.helpers.arrayElement(sampleNotifs);
  p(`INSERT INTO notifications (user_id, type, title, message, is_read) SELECT user_id, ${q(n[0])}, ${q(n[1])}, ${q(n[2])}, ${faker.datatype.boolean()} FROM students WHERE id = ${q(s.id)};`);
});
p('');

p('COMMIT;');

console.log(out.join('\n'));
