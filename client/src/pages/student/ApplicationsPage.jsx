import { useEffect, useState } from 'react';
import { FiClipboard } from 'react-icons/fi';
import { applicationsApi } from '../../services/resources.service';
import StatusPipeline from '../../components/ui/StatusPipeline';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    setApplications(null);
    applicationsApi.my().then(({ data }) => setApplications(data.data)).catch(() => setError(true));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">My applications</h1>
        <p className="mt-1 text-sm text-ink-500">Track every stage of your placement journey.</p>
      </div>

      {applications === null && !error && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorState onRetry={load} />}
      {applications?.length === 0 && (
        <EmptyState icon={FiClipboard} title="No applications yet" description="Once you apply to a job drive, it will show up here." />
      )}

      <div className="space-y-4">
        {applications?.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-ink-800">{a.job_title}</p>
                <p className="text-xs text-ink-400">{a.company_name} · {a.location}</p>
                <p className="mt-1 font-mono text-xs text-ink-500">₹{a.package_min_lpa}–{a.package_max_lpa} LPA</p>
              </div>
              <p className="text-xs text-ink-400">Applied {new Date(a.applied_at).toLocaleDateString()}</p>
            </div>
            <div className="mt-5 overflow-x-auto pb-1">
              <StatusPipeline status={a.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
