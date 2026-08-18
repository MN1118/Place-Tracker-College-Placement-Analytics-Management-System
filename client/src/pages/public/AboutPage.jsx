import { FiTarget, FiUsers, FiBriefcase, FiBarChart2 } from 'react-icons/fi';

const ROLES = [
  { title: 'Students', desc: 'Build a profile once, see only jobs you are eligible for, and track every application through a single pipeline.', icon: FiUsers },
  { title: 'Placement Officers', desc: 'Approve companies and drives, monitor the entire funnel, and generate reports without manual data entry.', icon: FiTarget },
  { title: 'Recruiters', desc: 'Post drives with clear eligibility criteria, review applicants, and move candidates through interview rounds.', icon: FiBriefcase },
  { title: 'Faculty Coordinators', desc: 'Track departmental placement performance and support students through the process.', icon: FiBarChart2 },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">About the platform</span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
        A single source of truth for campus placements
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-500">
        CampusPlacements replaces the spreadsheets, forwarded emails and WhatsApp groups that
        placement seasons usually run on. Every student, company, job drive, application and
        interview lives in one normalized database — so eligibility is calculated automatically,
        status is always current, and analytics are generated from real records instead of being
        re-typed by hand.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.title} className="card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <r.icon size={18} />
            </div>
            <h3 className="font-display text-base font-semibold text-ink-800">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 card p-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Why an eligibility engine?</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          Manually checking CGPA, backlog and department requirements against every applicant does
          not scale past a handful of drives. The eligibility engine evaluates every open job drive
          against every student profile as soon as either changes, and — importantly — explains
          exactly which criteria a student does not meet, rather than just hiding the "Apply" button.
        </p>
      </div>
    </div>
  );
}
