import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { companiesApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [approval, setApproval] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', hqLocation: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = (page = 1) => {
    setLoading(true); setError(null);
    companiesApi.list({ search: search || undefined, approval: approval || undefined, page, limit: meta.limit })
      .then(({ data }) => { setCompanies(data.data); setMeta({ ...meta, ...data.meta }); })
      .catch(() => setError('Failed to load companies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, approval]);

  const setApprovalStatus = async (company, status) => {
    try {
      await companiesApi.update(company.id, { approvalStatus: status });
      toast.success(`Company ${status.toLowerCase()}`);
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update company');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await companiesApi.create(form);
      toast.success('Company added');
      setCreateOpen(false);
      setForm({ name: '', industry: '', website: '', hqLocation: '' });
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not create company');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Company', render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
    { key: 'industry', header: 'Industry' },
    { key: 'hq_location', header: 'Location' },
    { key: 'approval_status', header: 'Status', render: (r) => <StatusBadge status={r.approval_status} /> },
    { key: 'actions', header: '', render: (r) => (
      r.approval_status === 'PENDING' ? (
        <div className="flex gap-2">
          <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => setApprovalStatus(r, 'APPROVED')}>Approve</button>
          <button className="btn-ghost px-2.5 py-1 text-xs text-danger-500" onClick={() => setApprovalStatus(r, 'REJECTED')}>Reject</button>
        </div>
      ) : null
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Companies</h1>
          <p className="mt-1 text-sm text-ink-500">Approve recruiters before their job drives become visible to students.</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}><FiPlus size={16} /> Add company</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="max-w-sm flex-1 min-w-[200px]"><SearchInput value={search} onChange={setSearch} placeholder="Search companies…" /></div>
        <select className="input w-48" value={approval} onChange={(e) => setApproval(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="card">
        <DataTable columns={columns} rows={companies} loading={loading} error={error} onRetry={() => load(meta.page)} emptyTitle="No companies found" />
        <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} />
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add company" footer={
        <>
          <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={submitting}>{submitting ? 'Saving…' : 'Add company'}</button>
        </>
      }>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="label">Company name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div>
            <label className="label">HQ location</label>
            <input className="input" value={form.hqLocation} onChange={(e) => setForm({ ...form, hqLocation: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
