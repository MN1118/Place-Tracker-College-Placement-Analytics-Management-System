import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiCheckSquare, FiAward, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { jobsApi, applicationsApi } from '../../services/resources.service';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function CompanyDashboardPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [applications, setApplications] = useState(null);

  useEffect(() => {
    jobsApi.list({ limit: 100 }).then(({ data }) => setJobs(data.data)).catch(() => setJobs([]));
    applicationsApi.list({ limit: 6 }).then(({ data }) => setApplications(data.data)).catch(() => setApplications([]));
  }, []);

  const openJobs = jobs?.filter((j) => j.status === 'OPEN').length;
  const selected = applications?.filter((a) => a.status === 'SELECTED').length;

  if (profile?.approval_status === 'PENDING') {
    return (
      <div className="card p-8 text-center">
        <h1 className="font-display text-lg font-semibold text-ink-900">Your company profile is pending approval</h1>
        <p className="mt-2 text-sm text-ink-500">Once the placement cell approves your account, you'll be able to post job drives.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">{profile?.name || 'Company'} Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your job drives and review candidates.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Job drives" value={jobs?.length ?? '—'} icon={FiBriefcase} tone="brand" />
        <StatCard label="Open drives" value={openJobs ?? '—'} icon={FiCheckSquare} tone="success" />
        <StatCard label="Applicants" value={applications?.length ?? '—'} icon={FiUsers} tone="brand" />
        <StatCard label="Selected" value={selected ?? '—'} icon={FiAward} tone="warning" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-ink-800">Recent applicants</h2>
          <Link to="/company/applicants" className="text-xs font-medium text-brand-600 flex items-center gap-1">View all <FiArrowRight size={12} /></Link>
        </div>
        {applications === null && <div className="p-5"><CardSkeleton /></div>}
        {applications?.length === 0 && <EmptyState icon={FiUsers} title="No applicants yet" />}
        {applications?.map((a) => (
          <div key={a.id} className="flex items-center justify-between border-b border-ink-50 px-5 py-3.5 last:border-0">
            <div>
              <p className="text-sm font-medium text-ink-800">{a.student_name}</p>
              <p className="text-xs text-ink-400">{a.job_title} · CGPA {a.cgpa}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
