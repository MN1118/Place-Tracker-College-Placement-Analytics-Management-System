import { useEffect, useState } from 'react';
import { studentsApi, departmentsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { departmentsApi.list().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const load = (page = 1) => {
    setLoading(true); setError(null);
    studentsApi.list({ search: search || undefined, department: department || undefined, status: status || undefined, page, limit: meta.limit })
      .then(({ data }) => { setStudents(data.data); setMeta({ ...meta, ...data.meta }); })
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department, status]);

  const columns = [
    { key: 'full_name', header: 'Name', render: (r) => (
      <div><p className="font-medium text-ink-800">{r.full_name}</p><p className="text-xs text-ink-400">{r.roll_number}</p></div>
    )},
    { key: 'department_name', header: 'Department' },
    { key: 'cgpa', header: 'CGPA', render: (r) => <span className="font-mono">{r.cgpa}</span> },
    { key: 'backlogs', header: 'Backlogs' },
    { key: 'graduation_year', header: 'Grad. Year' },
    { key: 'is_placed', header: 'Status', render: (r) => (
      <StatusBadge status={r.is_placed ? 'SELECTED' : 'PENDING'} />
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Students</h1>
        <p className="mt-1 text-sm text-ink-500">All registered students across departments.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="max-w-sm flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search by name or roll number…" /></div>
        <select className="input w-48" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="placed">Placed</option>
          <option value="unplaced">Not placed</option>
        </select>
      </div>

      <div className="card">
        <DataTable columns={columns} rows={students} loading={loading} error={error} onRetry={() => load(meta.page)} emptyTitle="No students found" />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} />
      </div>
    </div>
  );
}
