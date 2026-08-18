import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';

const NEXT_STATUS = {
  APPLIED: 'SHORTLISTED',
  SHORTLISTED: 'TECH_INTERVIEW',
  TECH_INTERVIEW: 'HR_INTERVIEW',
  HR_INTERVIEW: 'SELECTED',
};

/**
 * Shared applicants view used for /company/applicants, /company/shortlisted, and /company/selected.
 * `statusFilter` narrows the list; `emptyTitle` customizes the empty state per page.
 */
export default function ApplicantsListPage({ statusFilter, title, emptyTitle }) {
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = (page = 1) => {
    setLoading(true); setError(null);
    applicationsApi.list({ status: statusFilter, search: search || undefined, page, limit: meta.limit })
      .then(({ data }) => { setApplications(data.data); setMeta({ ...meta, ...data.meta }); })
      .catch(() => setError('Failed to load applicants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const advance = async (app) => {
    const next = NEXT_STATUS[app.status];
    if (!next) return;
    setUpdatingId(app.id);
    try {
      await applicationsApi.updateStatus(app.id, { status: next });
      toast.success(`Moved to ${next.replace('_', ' ').toLowerCase()}`);
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const reject = async (app) => {
    setUpdatingId(app.id);
    try {
      await applicationsApi.updateStatus(app.id, { status: 'REJECTED' });
      toast.success('Application rejected');
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    { key: 'student_name', header: 'Student', render: (r) => (
      <div>
        <p className="font-medium text-ink-800">{r.student_name}</p>
        <p className="text-xs text-ink-400">{r.roll_number} · {r.department_name}</p>
      </div>
    )},
    { key: 'job_title', header: 'Job Drive' },
    { key: 'cgpa', header: 'CGPA', render: (r) => <span className="font-mono">{r.cgpa}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-2">
        {NEXT_STATUS[r.status] && (
          <button className="btn-secondary px-2.5 py-1 text-xs" disabled={updatingId === r.id} onClick={() => advance(r)}>
            Move to {NEXT_STATUS[r.status].replace('_', ' ').toLowerCase()}
          </button>
        )}
        {!['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(r.status) && (
          <button className="btn-ghost px-2.5 py-1 text-xs text-danger-500" disabled={updatingId === r.id} onClick={() => reject(r)}>
            Reject
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">Move candidates through the pipeline as they clear each round.</p>
      </div>
      <div className="max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="Search by student or job…" /></div>
      <div className="card">
        <DataTable columns={columns} rows={applications} loading={loading} error={error} onRetry={() => load(meta.page)} emptyTitle={emptyTitle} />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} />
      </div>
    </div>
  );
}
