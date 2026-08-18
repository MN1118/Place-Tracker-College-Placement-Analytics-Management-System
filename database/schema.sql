-- =====================================================================
-- College Placement & Analytics Management System
-- PostgreSQL Schema
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('ADMIN', 'STUDENT', 'COMPANY', 'FACULTY');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'INTERNSHIP', 'INTERN_PPO', 'CONTRACT');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE application_status AS ENUM (
  'APPLIED', 'SHORTLISTED', 'TEST_SCHEDULED', 'TEST_COMPLETED',
  'TECH_INTERVIEW', 'HR_INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'
);
CREATE TYPE interview_round_type AS ENUM ('TECHNICAL', 'HR', 'MANAGERIAL', 'GROUP_DISCUSSION');
CREATE TYPE interview_result AS ENUM ('PENDING', 'PASS', 'FAIL', 'ON_HOLD');
CREATE TYPE company_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE notification_type AS ENUM (
  'JOB_POSTED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'DEADLINE_REMINDER',
  'SELECTED', 'REJECTED', 'GENERAL'
);

-- ---------------------------------------------------------------------
-- CORE USER TABLE
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  role              user_role NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------
-- DEPARTMENTS
-- ---------------------------------------------------------------------
CREATE TABLE departments (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL UNIQUE,
  code          VARCHAR(20) NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- FACULTY
-- ---------------------------------------------------------------------
CREATE TABLE faculty (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name       VARCHAR(150) NOT NULL,
  department_id   INTEGER REFERENCES departments(id),
  designation     VARCHAR(100),
  phone           VARCHAR(20),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------
CREATE TABLE students (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  roll_number         VARCHAR(30) NOT NULL UNIQUE,
  full_name           VARCHAR(150) NOT NULL,
  phone               VARCHAR(20),
  date_of_birth       DATE,
  gender              gender_type DEFAULT 'PREFER_NOT_TO_SAY',
  department_id       INTEGER NOT NULL REFERENCES departments(id),
  course              VARCHAR(100) NOT NULL,
  graduation_year     INTEGER NOT NULL,
  cgpa                NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (cgpa >= 0 AND cgpa <= 10),
  backlogs            INTEGER NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
  github_url          VARCHAR(255),
  linkedin_url        VARCHAR(255),
  profile_photo_url   VARCHAR(255),
  is_placed           BOOLEAN NOT NULL DEFAULT FALSE,
  profile_completion  INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_grad_year ON students(graduation_year);
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_students_placed ON students(is_placed);

-- Certifications / Projects / Internships (one-to-many, kept normalized)
CREATE TABLE student_certifications (
  id            SERIAL PRIMARY KEY,
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  issuer        VARCHAR(150),
  issued_on     DATE,
  credential_url VARCHAR(255)
);

CREATE TABLE student_projects (
  id            SERIAL PRIMARY KEY,
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  tech_stack    VARCHAR(255),
  project_url   VARCHAR(255)
);

CREATE TABLE student_internships (
  id             SERIAL PRIMARY KEY,
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company_name   VARCHAR(150) NOT NULL,
  role           VARCHAR(150),
  start_date     DATE,
  end_date       DATE,
  description    TEXT
);

-- ---------------------------------------------------------------------
-- SKILLS (many-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE skills (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE student_skills (
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id    INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency VARCHAR(20) DEFAULT 'INTERMEDIATE',
  PRIMARY KEY (student_id, skill_id)
);

-- ---------------------------------------------------------------------
-- RESUMES
-- ---------------------------------------------------------------------
CREATE TABLE resumes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_name     VARCHAR(255) NOT NULL,
  file_url      VARCHAR(255) NOT NULL,
  is_primary    BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resumes_student ON resumes(student_id);

-- ---------------------------------------------------------------------
-- COMPANIES
-- ---------------------------------------------------------------------
CREATE TABLE companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name              VARCHAR(150) NOT NULL,
  industry          VARCHAR(100),
  website           VARCHAR(255),
  logo_url          VARCHAR(255),
  description       TEXT,
  hq_location       VARCHAR(150),
  approval_status   company_approval_status NOT NULL DEFAULT 'PENDING',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_companies_approval ON companies(approval_status);

-- ---------------------------------------------------------------------
-- JOB DRIVES
-- ---------------------------------------------------------------------
CREATE TABLE job_drives (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title                 VARCHAR(200) NOT NULL,
  description           TEXT,
  location              VARCHAR(150),
  employment_type       employment_type NOT NULL DEFAULT 'FULL_TIME',
  package_min_lpa       NUMERIC(6,2),
  package_max_lpa       NUMERIC(6,2),
  application_deadline  TIMESTAMPTZ NOT NULL,
  drive_date            TIMESTAMPTZ,
  status                job_status NOT NULL DEFAULT 'PENDING_APPROVAL',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobdrives_company ON job_drives(company_id);
CREATE INDEX idx_jobdrives_status ON job_drives(status);
CREATE INDEX idx_jobdrives_deadline ON job_drives(application_deadline);

-- Eligibility criteria (1:1 with job drive, kept separate for clarity)
CREATE TABLE job_requirements (
  id                  SERIAL PRIMARY KEY,
  job_drive_id        UUID NOT NULL UNIQUE REFERENCES job_drives(id) ON DELETE CASCADE,
  min_cgpa            NUMERIC(4,2) NOT NULL DEFAULT 0,
  max_backlogs        INTEGER NOT NULL DEFAULT 0,
  graduation_year     INTEGER,
  required_skills     TEXT[] DEFAULT '{}'
);

CREATE TABLE job_eligible_departments (
  job_drive_id   UUID NOT NULL REFERENCES job_drives(id) ON DELETE CASCADE,
  department_id  INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (job_drive_id, department_id)
);

-- ---------------------------------------------------------------------
-- APPLICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  job_drive_id  UUID NOT NULL REFERENCES job_drives(id) ON DELETE CASCADE,
  status        application_status NOT NULL DEFAULT 'APPLIED',
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, job_drive_id)
);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_drive_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE TABLE application_status_history (
  id              SERIAL PRIMARY KEY,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status     application_status,
  to_status       application_status NOT NULL,
  changed_by      UUID REFERENCES users(id),
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  remarks         TEXT
);

-- ---------------------------------------------------------------------
-- SHORTLISTS (explicit table for company review batches)
-- ---------------------------------------------------------------------
CREATE TABLE shortlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  shortlisted_by  UUID REFERENCES users(id),
  shortlisted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  remarks         TEXT
);

-- ---------------------------------------------------------------------
-- TESTS
-- ---------------------------------------------------------------------
CREATE TABLE tests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_drive_id  UUID NOT NULL REFERENCES job_drives(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  test_date     TIMESTAMPTZ,
  duration_mins INTEGER,
  max_score     NUMERIC(6,2) DEFAULT 100,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  score           NUMERIC(6,2),
  passed          BOOLEAN,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (test_id, application_id)
);

-- ---------------------------------------------------------------------
-- INTERVIEWS
-- ---------------------------------------------------------------------
CREATE TABLE interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round_type      interview_round_type NOT NULL,
  scheduled_at    TIMESTAMPTZ,
  mode            VARCHAR(20) DEFAULT 'ONLINE',
  location_or_link VARCHAR(255),
  interviewer     VARCHAR(150),
  result          interview_result NOT NULL DEFAULT 'PENDING',
  feedback        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_interviews_application ON interviews(application_id);

-- ---------------------------------------------------------------------
-- PLACEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE placements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_drive_id    UUID NOT NULL REFERENCES job_drives(id),
  package_lpa     NUMERIC(6,2) NOT NULL,
  offer_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  joining_date    DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_placements_company ON placements(company_id);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          notification_type NOT NULL DEFAULT 'GENERAL',
  title         VARCHAR(200) NOT NULL,
  message       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ---------------------------------------------------------------------
-- AUDIT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  actor_id      UUID REFERENCES users(id),
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(60) NOT NULL,
  entity_id     VARCHAR(60),
  details       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ---------------------------------------------------------------------
-- TRIGGERS: keep updated_at fresh
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobdrives_updated BEFORE UPDATE ON job_drives FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_interviews_updated BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
