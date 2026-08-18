import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiUserCheck, FiBriefcase, FiCheckCircle, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';
import api from '../../services/api';
import StatusPipeline from '../../components/ui/StatusPipeline';

const HOW_IT_WORKS = [
  { title: 'Build your profile', desc: 'Students add CGPA, skills, projects and a resume once — it powers every application after.', icon: FiUserCheck },
  { title: 'Get matched automatically', desc: 'The eligibility engine checks every job drive against each profile and shows only what a student truly qualifies for.', icon: FiZap },
  { title: 'Track every stage', desc: 'Applied, shortlisted, tested, interviewed, selected — one pipeline, visible to student, recruiter and placement cell alike.', icon: FiTrendingUp },
  { title: 'Report with real numbers', desc: 'Department, company and salary analytics are computed live from the database — never hand-typed into a slide.', icon: FiShield },
];

const FEATURES = [
  { title: 'Eligibility engine', desc: 'CGPA, backlog, department and graduation-year rules evaluated automatically, with clear reasons when a student doesn\u2019t qualify.' },
  { title: 'End-to-end workflow', desc: 'From application to offer letter, every status change is logged and visible to the right people.' },
  { title: 'Live analytics', desc: 'Placement rate, average package, and selection rate by department, course and company — always current.' },
  { title: 'Role-based access', desc: 'Students, recruiters, faculty coordinators and admins each see exactly what they need.' },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/analytics/overview').then(({ data }) => setStats(data.data)).catch(() => {});
    api.get('/companies?limit=8').then(({ data }) => setCompanies(data.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
              Placement Cell · 2026-27 Season
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
              One pipeline, from <span className="text-brand-500">eligible</span> to <span className="text-success-500">offer letter</span>.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-500">
              CampusPlacements centralizes every student, company, job drive and interview into a
              single system of record — so eligibility is automatic, status is always current,
              and analytics never need to be re-typed into a spreadsheet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-sm">
                Get started <FiArrowUpRight size={16} />
              </Link>
              <Link to="/statistics" className="btn-secondary text-sm">View placement statistics</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="font-mono text-2xl font-semibold text-ink-900">{stats ? stats.placedStudents : '—'}</p>
                <p className="text-xs text-ink-400">Students placed</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-ink-900">{stats ? `${stats.placementPercentage}%` : '—'}</p>
                <p className="text-xs text-ink-400">Placement rate</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-ink-900">{stats ? stats.totalCompanies : '—'}</p>
                <p className="text-xs text-ink-400">Recruiting companies</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="card w-full max-w-md p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Application pipeline</p>
              <p className="mt-1 text-sm text-ink-500">What every student's dashboard tracks in real time.</p>
              <div className="mt-6 overflow-x-auto pb-2">
                <StatusPipeline status="TECH_INTERVIEW" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-paper p-3">
                  <p className="font-mono text-lg font-semibold text-ink-900">{stats ? `\u20b9${stats.averagePackageLpa}L` : '—'}</p>
                  <p className="text-xs text-ink-400">Average package</p>
                </div>
                <div className="rounded-lg bg-paper p-3">
                  <p className="font-mono text-lg font-semibold text-ink-900">{stats ? `\u20b9${stats.highestPackageLpa}L` : '—'}</p>
                  <p className="text-xs text-ink-400">Highest package</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <h2 className="font-display text-2xl font-semibold text-ink-900">How it works</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-500">Four steps carry every student from registration to a signed offer.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.title} className="card p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <item.icon size={18} />
              </div>
              <h3 className="font-display text-sm font-semibold text-ink-800">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-ink-100 bg-ink-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-12 sm:px-8 md:grid-cols-4">
          {[
            ['Students placed', stats?.placedStudents],
            ['Placement rate', stats ? `${stats.placementPercentage}%` : null],
            ['Job drives open', stats?.totalJobDrives],
            ['Average package', stats ? `\u20b9${stats.averagePackageLpa}L` : null],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-mono text-3xl font-semibold text-white">{value ?? '—'}</p>
              <p className="mt-1 text-xs text-ink-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top recruiting companies */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">Top recruiting companies</h2>
            <p className="mt-2 text-sm text-ink-500">Approved recruiters currently running drives on the platform.</p>
          </div>
          <Link to="/companies" className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block">View all →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {companies.slice(0, 8).map((c) => (
            <div key={c.id} className="card flex h-24 items-center justify-center p-4 text-center">
              <span className="font-display text-sm font-semibold text-ink-700">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Built for the whole placement season</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <FiCheckCircle className="mt-0.5 shrink-0 text-success-500" size={20} />
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink-800">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl2 bg-brand-500 p-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Ready to see your placement status?</h2>
            <p className="mt-2 text-sm text-brand-100">Students, recruiters and coordinators can all get started in minutes.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="btn bg-white text-brand-600 hover:bg-brand-50">Create an account</Link>
            <Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
