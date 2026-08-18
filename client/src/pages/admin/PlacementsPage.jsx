import { useEffect, useState } from 'react';
import { placementsApi } from '../../services/resources.service';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

export default function PlacementsPage() {
  const [placements, setPlacements] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = (page = 1) => {
    setLoading(true); setError(null);
    placementsApi.list({ page, limit: meta.limit })
      .then(({ data }) => { setPlacements(data.data); setMeta({ ...meta, ...data.meta }); })
      .catch(() => setError('Failed to load placements'))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  const columns = [
    { key: 'student_name', header: 'Student', render: (r) => (
      <div><p className="font-medium text-ink-800">{r.student_name}</p><p className="text-xs text-ink-400">{r.roll_number} · {r.department_name}</p></div>
    )},
    { key: 'company_name', header: 'Company' },
    { key: 'job_title', header: 'Role' },
    { key: 'package_lpa', header: 'Package', render: (r) => <span className="font-mono font-semibold text-success-600">₹{r.package_lpa}L</span> },
    { key: 'offer_date', header: 'Offer Date', render: (r) => new Date(r.offer_date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Placements</h1>
        <p className="mt-1 text-sm text-ink-500">Confirmed offers across all departments and companies.</p>
      </div>
      <div className="card">
        <DataTable columns={columns} rows={placements} loading={loading} error={error} onRetry={() => load(meta.page)} emptyTitle="No placements recorded yet" />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} />
      </div>
    </div>
  );
}
