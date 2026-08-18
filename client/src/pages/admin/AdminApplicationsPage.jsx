import { useEffect, useState } from 'react';
import { applicationsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = (page = 1) => {
    setLoading(true); setError(null);
    applicationsApi.list({ search: search || undefined, status: status || undefined, page, limit: meta.limit })
      .then(({ data }) => { setApplications(data.data); setMeta({ ...meta, ...data.meta }); })
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const columns = [
    { key: 'student_name', header: 'Student', render: (r) => (
      <div><p className="font-medium text-ink-800">{r.student_name}</p><p className="text-xs text-ink-400">{r.roll_number}</p></div>
    )},
    { key: 'company_name', header: 'Company' },
    { key: 'job_title', header: 'Job Drive' },
    { key: 'applied_at', header: 'Applied', render: (r) => new Date(r.applied_at).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Applications</h1>
        <p className="mt-1 text-sm text-ink-500">Monitor the entire application workflow across all companies.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="max-w-sm flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search by student or company…" /></div>
        <select className="input w-52" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['APPLIED', 'SHORTLISTED', 'TECH_INTERVIEW', 'HR_INTERVIEW', 'SELECTED', 'REJECTED'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <DataTable columns={columns} rows={applications} loading={loading} error={error} onRetry={() => load(meta.page)} emptyTitle="No applications found" />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} />
      </div>
    </div>
  );
}
