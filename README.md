# CampusPlacements — College Placement & Analytics Management System

A full-stack placement management platform: students, companies, job drives,
eligibility, applications, interviews, placements and live analytics — all
backed by a real PostgreSQL database (no mock data once wired up).

**Status:** backend, database and frontend have been built and verified end-to-end
against a live PostgreSQL instance in the development sandbox (schema applied,
seed data loaded, API calls returned real computed analytics, eligibility engine
confirmed correct). See "What's been tested" below.

---

## 1. Folder structure

```
placement-system/
├── client/                        # React 19 + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # StatCard, DataTable, Modal, StatusBadge, StatusPipeline, etc.
│   │   │   ├── charts/            # ChartCard wrapper for Recharts
│   │   │   └── layout/            # Sidebar, Topbar, PublicNavbar, ProtectedRoute, layouts
│   │   ├── pages/
│   │   │   ├── public/            # Home, About, Companies, Statistics, Contact
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── student/           # Dashboard, Profile, Resume, Jobs, Applications, Interviews...
│   │   │   ├── company/           # Dashboard, Jobs, Create Job, Applicants, Shortlisted, Selected...
│   │   │   ├── admin/             # Dashboard, Students, Companies, Jobs, Analytics, Reports...
│   │   │   └── faculty/           # Dashboard, Students (read-only), Analytics, Reports
│   │   ├── context/AuthContext.jsx
│   │   ├── services/               # axios instance + one service module per resource
│   │   ├── utils/exportReport.js   # CSV / Excel / PDF export helpers
│   │   ├── App.jsx                 # Full route tree
│   │   └── main.jsx
│   ├── tailwind.config.js          # Design tokens (colors, fonts)
│   └── package.json
│
├── server/                         # Node.js + Express REST API
│   └── src/
│       ├── config/                 # env.js, db.js (pg Pool)
│       ├── middleware/             # auth (JWT), validate (Zod), errorHandler, rateLimiter
│       ├── controllers/            # one per resource
│       ├── routes/                 # one per resource
│       ├── services/               # auditService, notificationService
│       ├── utils/                  # ApiError, asyncHandler, eligibility.js (the eligibility engine)
│       ├── app.js
│       └── server.js
│
└── database/
    ├── schema.sql                  # Full normalized PostgreSQL schema
    ├── generate_seed.js            # Generates seed.sql with realistic fictional data
    └── seed.sql                    # Generated output (120 students, 15 companies, 30 drives...)
```

---

## 2. Database schema (summary)

`database/schema.sql` defines a normalized PostgreSQL schema. Key tables:

| Table | Purpose |
|---|---|
| `users` | Central auth table (email, password hash, role) |
| `departments` | BCA, BCS, IT, BBA, ECE |
| `students` / `student_skills` / `student_certifications` / `student_projects` / `student_internships` | Student profile, normalized 1:N and M:N sub-records |
| `resumes` | One or more resumes per student, one marked primary |
| `skills` | Master skill list, joined to students via `student_skills` |
| `companies` | Recruiters, with `approval_status` (PENDING/APPROVED/REJECTED) |
| `job_drives` / `job_requirements` / `job_eligible_departments` | A job posting plus its eligibility rules (min CGPA, max backlogs, grad year, required skills, eligible departments) |
| `applications` / `application_status_history` | One row per student-job application, with a full audit trail of status changes |
| `shortlists` | Explicit shortlist record when a company shortlists an applicant |
| `tests` / `test_results` | Online assessments per job drive and each applicant's result |
| `interviews` | Interview rounds (TECHNICAL / HR / MANAGERIAL / GD) with result and feedback |
| `placements` | Confirmed offers: package, offer date, joining date |
| `notifications` | In-app notifications per user, with `is_read` |
| `audit_logs` | Every significant admin/company action, with actor, entity and JSON details |
| `faculty` | Department coordinators |

All tables use UUID primary keys (except lookup tables), proper foreign keys,
`CHECK` constraints (e.g. CGPA 0–10), enums for status fields, indexes on the
columns actually filtered/joined in the API, and `updated_at` triggers.

---

## 3. Eligibility engine

`server/src/utils/eligibility.js` is the core rules engine. Given a student
and a job's requirements, it checks CGPA, backlogs, graduation year and
eligible departments, and returns:

```js
{ eligible: boolean, reasons: string[] }
```

The reasons array is surfaced directly in the UI (`/student/jobs`) so a
student sees *why* they can't apply, not just a disabled button. This was
tested live against the seeded database and confirmed correct.

---

## 4. REST API documentation

Base URL: `http://localhost:5000/api`. All protected routes require
`Authorization: Bearer <jwt>`.

### Auth
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | Public | `role`: `STUDENT` or `COMPANY` only (admin/faculty are seeded/provisioned) |
| POST | `/auth/login` | Public | Returns `{ token, user }` |
| GET | `/auth/me` | Auth | Returns `{ user, profile }` |

### Students
| Method | Route | Access |
|---|---|---|
| GET | `/students` | Admin, Faculty, Company |
| GET | `/students/:id` | Auth |
| PUT | `/students/:id` | Owner student, Admin, Faculty |

### Companies
| Method | Route | Access |
|---|---|---|
| GET | `/companies` | Public (students only see APPROVED) |
| GET | `/companies/:id` | Public |
| POST | `/companies` | Admin |
| PUT | `/companies/:id` | Owner company, Admin (approval status: Admin only) |

### Jobs
| Method | Route | Access |
|---|---|---|
| GET | `/jobs` | Public (students see eligibility attached) |
| GET | `/jobs/:id` | Public |
| POST | `/jobs` | Company (must be approved), Admin |
| PUT | `/jobs/:id` | Company, Admin (`{status:'OPEN'}` is admin-only — the approval step) |
| DELETE | `/jobs/:id` | Company, Admin |

### Applications
| Method | Route | Access |
|---|---|---|
| POST | `/applications` | Student (enforces eligibility + deadline + no duplicates) |
| GET | `/applications/my` | Student |
| GET | `/applications` | Admin, Company, Faculty |
| GET | `/applications/:id` | Auth |
| PUT | `/applications/:id/status` | Admin, Company (writes history + notifies student) |

### Interviews / Placements
| Method | Route | Access |
|---|---|---|
| POST / GET / PUT | `/interviews` | Admin, Company (create/update); Auth (list, scoped by role) |
| GET / POST / PUT | `/placements` | Public list; Admin/Company create & update |

### Analytics (all computed live from SQL, never hardcoded)
`GET /analytics/overview`, `/departments`, `/companies`, `/packages`, `/placements`, `/demographics`

### Notifications / Departments / Reports
`GET/PUT /notifications`, `GET /departments`, `GET /reports/{overall|departments|companies|salary}`

Every route returns `{ success: boolean, data, meta? }` on success or
`{ success: false, error: { message, details? } }` on failure.

---

## 5. Environment variables

**`server/.env`** (copy from `server/.env.example`):
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/placement_system
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**`client/.env`** (copy from `client/.env.example`):
```
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Installation & local development

Prerequisites: Node.js 18+, PostgreSQL 14+.

```bash
# 1. Create the database
createdb placement_system
# or: psql -U postgres -c "CREATE DATABASE placement_system;"

# 2. Backend
cd server
cp .env.example .env          # then edit DATABASE_URL / JWT_SECRET if needed
npm install
npm run db:schema             # applies database/schema.sql
npm run db:seed               # regenerates + loads database/seed.sql
npm run dev                   # http://localhost:5000

# 3. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

Open `http://localhost:5173` — the public site loads first; sign in with a
demo account below to reach a role dashboard.

---

## 7. Demo / seed credentials

All seeded accounts share the password **`Password@123`**.

| Role | Email |
|---|---|
| Admin | `admin@campusplacements.edu` |
| Student | `student1@campusplacements.edu` (through `student120@...`) |
| Company | `technovasolutions@company.com`, `zenithsoftwarelabs@company.com`, `bluepeaksystems@company.com` |
| Faculty | `bca.faculty@campusplacements.edu` (also `bcs.`, `it.`, `bba.`, `ece.faculty@...`) |

The Login page also has one-click buttons that fill these in.

---

## 8. Build commands

```bash
# Frontend production build
cd client && npm run build      # outputs to client/dist
npm run preview                 # serve the production build locally

# Backend
cd server && npm start          # runs the compiled server as-is (plain Node, no build step needed)
```

---

## 9. Deployment notes

- **Database**: provision a managed PostgreSQL instance (RDS, Cloud SQL, Supabase, etc.), run `schema.sql`, then `generate_seed.js` if you want demo data — skip seeding for a real production rollout.
- **Backend**: deploy `server/` to any Node host (Render, Railway, Fly.io, EC2). Set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL` (for CORS) as environment variables. `npm start` runs `server.js`.
- **Frontend**: `npm run build` in `client/` produces static files in `client/dist` — deploy to Vercel, Netlify, or any static host, or serve them behind Nginx. Set `VITE_API_URL` to your deployed backend's `/api` URL at build time.
- **File uploads (resumes)**: the schema and UI are ready for resume uploads, but actual binary storage needs an object store (S3, GCS, or Cloudinary) wired into a small `/api/uploads` endpoint using `multer` (already a backend dependency) — this was intentionally left as the one integration point requiring real cloud credentials rather than being faked.
- **Email/Socket.IO**: `nodemailer` and `Socket.IO` were listed as optional in the spec; the notification system currently works as in-app only (polled on load) and is structured so either can be added without changing the data model.

---

## 10. How each module works

- **Student module**: profile CRUD, resume upload UI (storage endpoint noted above), job browsing with live eligibility checks, one-click apply, a visual pipeline (`StatusPipeline` component) tracking Applied → Selected, interview list, notifications with unread counts.
- **Company module**: profile management, job drive creation with an eligibility-criteria builder (CGPA/backlogs/grad year/skills/departments), an applicants table with one-click "move to next stage" / "reject" actions that write to `application_status_history` and notify the student, dedicated shortlisted/selected views built on the same shared component with a different status filter.
- **Admin module**: full CRUD oversight of students/companies/jobs, a company + job **approval workflow** (jobs go `PENDING_APPROVAL → OPEN` only via admin), the placements ledger, the 10-chart analytics dashboard, and CSV/Excel/PDF report exports generated client-side from live API data (no server-side binary dependency required).
- **Faculty module**: read-only department-scoped dashboard reusing the admin's students/analytics/reports views, so a coordinator sees the same real numbers without edit rights.
- **Eligibility engine**: shared by the job-listing endpoint (attaches `eligible` + `eligibilityReasons` per job when a student is logged in) and the apply endpoint (hard-blocks ineligible applications server-side, not just in the UI).
- **Analytics**: every number comes from a live SQL query in `analytics.controller.js` — placement %, average/highest package, department and company breakdowns, package-band distribution, monthly/year-wise trends, and demographic splits are all `COUNT`/`AVG`/`GROUP BY` over real rows, confirmed correct against the seed data during testing.

---

## What's been tested

During development in this sandbox:
- PostgreSQL was installed, `schema.sql` applied cleanly (no errors).
- `seed.sql` (generated from `generate_seed.js`, ~120 students / 15 companies / 30 drives / applications / interviews / placements / notifications) loaded and committed successfully.
- The Express server was booted against that live database and multiple endpoints were called for real: login (all four roles), `/analytics/overview`, `/analytics/departments`, `/jobs` (with eligibility attached for a logged-in student — a bug where this silently didn't happen on the public route was found and fixed), `/applications/my`, `/notifications`.
- The React frontend (`npm run build`) compiled with zero errors across ~50 components/pages.
- The full stack (Vite dev server + Express + Postgres) was started together and the API/health check confirmed reachable from the frontend's configured `VITE_API_URL`.

What was **not** independently re-verified after the final documentation pass:
manual click-through of every single page in a real browser session (the
environment here doesn't include an interactive browser), and the resume
file-upload storage integration, which is explicitly left as a documented
next step requiring real cloud storage credentials.
