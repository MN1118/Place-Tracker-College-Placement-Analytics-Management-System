import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiPlus } from 'react-icons/fi';
import { jobsApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true); setError(null);
    jobsApi.list({ limit: 100 }).then(({ data }) => setJobs(data.data)).catch(() => setError('Failed to load job drives')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const columns = [
    { key: 'title', header: 'Job Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
    { key: 'employment_type', header: 'Type', render: (r) => r.employment_type?.replace('_', ' ') },
    { key: 'package', header: 'Package', render: (r) => <span className="font-mono">₹{r.package_min_lpa}–{r.package_max_lpa}L</span> },
    { key: 'application_deadline', header: 'Deadline', render: (r) => new Date(r.application_deadline).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Job drives</h1>
          <p className="mt-1 text-sm text-ink-500">Drives require admin approval before going live to students.</p>
        </div>
        <Link to="/company/jobs/create" className="btn-primary"><FiPlus size={16} /> New job drive</Link>
      </div>

      <div className="card">
        <DataTable columns={columns} rows={jobs} loading={loading} error={error} onRetry={load}
          emptyTitle="No job drives yet" emptyDescription="Create your first job drive to start receiving applications." />
      </div>
    </div>
  );
}
