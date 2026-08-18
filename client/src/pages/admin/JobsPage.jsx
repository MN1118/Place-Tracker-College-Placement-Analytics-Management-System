import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = (page = 1) => {
    setLoading(true); setError(null);
    jobsApi.list({ search: search || undefined, status: status || undefined, page, limit: meta.limit })
      .then(({ data }) => { setJobs(data.data); setMeta({ ...meta, ...data.meta }); })
      .catch(() => setError('Failed to load job drives'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const approve = async (job) => {
    try {
      await jobsApi.update(job.id, { status: 'OPEN' });
      toast.success('Job drive approved and now live');
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not approve job drive');
    }
  };

  const columns = [
    { key: 'title', header: 'Job Title', render: (r) => (
      <div><p className="font-medium text-ink-800">{r.title}</p><p className="text-xs text-ink-400">{r.company_name}</p></div>
    )},
    { key: 'package', header: 'Package', render: (r) => <span className="font-mono">₹{r.package_min_lpa}–{r.package_max_lpa}L</span> },
    { key: 'application_deadline', header: 'Deadline', render: (r) => new Date(r.application_deadline).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => (
      r.status === 'PENDING_APPROVAL' ? (
        <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => approve(r)}>Approve</button>
      ) : null
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Job drives</h1>
        <p className="mt-1 text-sm text-ink-500">Review and approve drives before they go live to students.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="max-w-sm flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search by title or company…" /></div>
        <select className="input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING_APPROVAL">Pending approval</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card">
        <DataTable columns={columns} rows={jobs} loading={loading} error={error} onRetry={() => load(meta.page)} emptyTitle="No job drives found" />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} />
      </div>
    </div>
  );
}
