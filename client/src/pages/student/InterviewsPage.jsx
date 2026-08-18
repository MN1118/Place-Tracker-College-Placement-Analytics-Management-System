import { useEffect, useState } from 'react';
import { FiCalendar, FiMapPin, FiUser } from 'react-icons/fi';
import { interviewsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(null);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false); setInterviews(null);
    interviewsApi.list().then(({ data }) => setInterviews(data.data)).catch(() => setError(true));
  };
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Interviews</h1>
        <p className="mt-1 text-sm text-ink-500">All scheduled and completed interview rounds across your applications.</p>
      </div>

      {interviews === null && !error && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorState onRetry={load} />}
      {interviews?.length === 0 && <EmptyState icon={FiCalendar} title="No interviews yet" description="They'll appear here once a recruiter schedules one." />}

      <div className="space-y-3">
        {interviews?.map((i) => (
          <div key={i.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-semibold text-ink-800">{i.job_title} · {i.company_name}</p>
              <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-ink-400">
                <span className="flex items-center gap-1.5"><FiCalendar size={12} /> {i.scheduled_at ? new Date(i.scheduled_at).toLocaleString() : 'TBD'}</span>
                <span className="flex items-center gap-1.5"><FiMapPin size={12} /> {i.mode}{i.location_or_link ? ` · ${i.location_or_link}` : ''}</span>
                {i.interviewer && <span className="flex items-center gap-1.5"><FiUser size={12} /> {i.interviewer}</span>}
              </div>
            </div>
            <StatusBadge status={i.result} />
          </div>
        ))}
      </div>
    </div>
  );
}
