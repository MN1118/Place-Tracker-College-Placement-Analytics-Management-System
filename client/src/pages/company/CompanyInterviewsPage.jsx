import { useEffect, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { interviewsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';

export default function CompanyInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true); setError(null);
    interviewsApi.list().then(({ data }) => setInterviews(data.data)).catch(() => setError('Failed to load interviews')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const columns = [
    { key: 'student_name', header: 'Student' },
    { key: 'job_title', header: 'Job Drive' },
    { key: 'round_type', header: 'Round' },
    { key: 'scheduled_at', header: 'Scheduled', render: (r) => r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : 'TBD' },
    { key: 'result', header: 'Result', render: (r) => <StatusBadge status={r.result} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Interviews</h1>
        <p className="mt-1 text-sm text-ink-500">All interview rounds scheduled across your job drives.</p>
      </div>
      <div className="card">
        <DataTable columns={columns} rows={interviews} loading={loading} error={error} onRetry={load}
          emptyTitle="No interviews scheduled" emptyDescription="Schedule interviews from the Applicants tab as candidates progress." />
      </div>
    </div>
  );
}
