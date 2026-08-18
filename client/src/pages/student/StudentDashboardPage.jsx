import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiClipboard, FiCalendar, FiAward, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi, jobsApi, interviewsApi } from '../../services/resources.service';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [interviews, setInterviews] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      applicationsApi.my(),
      jobsApi.list({ limit: 4 }),
      interviewsApi.list({ upcoming: 'true' }),
    ]).then(([a, j, i]) => {
      setApplications(a.data.data);
      setJobs(j.data.data);
      setInterviews(i.data.data);
    }).catch(() => setError(true));
  }, []);

  const shortlisted = applications?.filter((a) => a.status !== 'APPLIED' && a.status !== 'REJECTED').length;
  const placed = applications?.some((a) => a.status === 'SELECTED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}</h1>
        <p className="mt-1 text-sm text-ink-500">Here's where things stand with your placement applications.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile completion" value={profile ? `${profile.profile_completion}%` : '—'} icon={FiClipboard} tone="brand" />
        <StatCard label="CGPA" value={profile?.cgpa ?? '—'} icon={FiAward} tone="success" />
        <StatCard label="Applications" value={applications?.length ?? '—'} icon={FiBriefcase} tone="brand" />
        <StatCard label="Shortlisted" value={shortlisted ?? '—'} icon={FiCalendar} tone="warning" />
      </div>

      {placed && (
        <div className="card border-success-200 bg-success-50 p-5">
          <p className="font-display text-sm font-semibold text-success-700">🎉 Congratulations — you've been placed!</p>
          <p className="mt-1 text-sm text-success-600">Check your applications tab for offer details.</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-ink-800">Recent applications</h2>
            <Link to="/student/applications" className="text-xs font-medium text-brand-600 flex items-center gap-1">View all <FiArrowRight size={12} /></Link>
          </div>
          {applications === null && !error && <div className="p-5 space-y-3"><CardSkeleton /></div>}
          {applications?.length === 0 && (
            <EmptyState icon={FiBriefcase} title="No applications yet" description="Browse open job drives to get started."
              action={<Link to="/student/jobs" className="btn-primary">Browse jobs</Link>} />
          )}
          {applications?.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-ink-50 px-5 py-3.5 last:border-0">
              <div>
                <p className="text-sm font-medium text-ink-800">{a.job_title}</p>
                <p className="text-xs text-ink-400">{a.company_name}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-sm font-semibold text-ink-800">Upcoming interviews</h2>
          </div>
          {interviews === null && !error && <div className="p-5"><CardSkeleton /></div>}
          {interviews?.length === 0 && <EmptyState icon={FiCalendar} title="No interviews scheduled" />}
          {interviews?.slice(0, 4).map((i) => (
            <div key={i.id} className="border-b border-ink-50 px-5 py-3.5 last:border-0">
              <p className="text-sm font-medium text-ink-800">{i.company_name}</p>
              <p className="text-xs text-ink-400">{i.round_type} · {i.scheduled_at ? new Date(i.scheduled_at).toLocaleDateString() : 'TBD'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-ink-800">Recommended for you</h2>
          <Link to="/student/jobs" className="text-xs font-medium text-brand-600 flex items-center gap-1">Browse all <FiArrowRight size={12} /></Link>
        </div>
        {jobs === null && !error && <div className="p-5"><CardSkeleton /></div>}
        {jobs?.length === 0 && <EmptyState icon={FiBriefcase} title="No open job drives right now" />}
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {jobs?.map((j) => (
            <div key={j.id} className="rounded-lg border border-ink-100 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{j.title}</p>
                  <p className="text-xs text-ink-400">{j.company_name}</p>
                </div>
                {j.eligible ? <span className="badge bg-success-100 text-success-600">Eligible</span> : <span className="badge bg-ink-100 text-ink-500">Not eligible</span>}
              </div>
              <p className="mt-2 font-mono text-xs text-ink-500">₹{j.package_min_lpa}–{j.package_max_lpa} LPA</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
