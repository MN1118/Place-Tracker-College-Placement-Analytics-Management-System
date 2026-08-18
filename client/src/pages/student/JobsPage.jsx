import { useEffect, useState } from 'react';
import { FiBriefcase, FiMapPin, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { jobsApi, applicationsApi, departmentsApi } from '../../services/resources.service';
import SearchInput from '../../components/ui/SearchInput';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [state, setState] = useState('loading');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => { departmentsApi.list().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const load = (page = 1) => {
    setState('loading');
    jobsApi.list({ search: search || undefined, department: department || undefined, page, limit: meta.limit })
      .then(({ data }) => { setJobs(data.data); setMeta({ ...meta, ...data.meta }); setState('done'); })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department]);

  const handleApply = async (job) => {
    setApplying(true);
    try {
      await applicationsApi.apply(job.id);
      toast.success('Application submitted!');
      setSelectedJob(null);
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Job drives</h1>
        <p className="mt-1 text-sm text-ink-500">Only drives you're eligible for show an Apply button — others explain why.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-sm flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search by title or company…" /></div>
        <select className="input sm:w-56" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {state === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      )}
      {state === 'error' && <ErrorState onRetry={() => load(meta.page)} />}
      {state === 'done' && jobs.length === 0 && (
        <EmptyState icon={FiBriefcase} title="No job drives found" description="Try adjusting your search or department filter." />
      )}

      {state === 'done' && jobs.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold text-ink-800">{job.title}</p>
                    <p className="text-xs text-ink-400">{job.company_name}</p>
                  </div>
                  {job.eligible ? (
                    <span className="badge bg-success-100 text-success-600 shrink-0">Eligible</span>
                  ) : (
                    <span className="badge bg-ink-100 text-ink-500 shrink-0">Not eligible</span>
                  )}
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-ink-500">
                  <p className="flex items-center gap-1.5"><FiMapPin size={12} /> {job.location || 'Location TBD'}</p>
                  <p className="flex items-center gap-1.5"><FiCalendar size={12} /> Apply by {new Date(job.application_deadline).toLocaleDateString()}</p>
                </div>
                <p className="mt-3 font-mono text-sm font-semibold text-ink-800">₹{job.package_min_lpa}–{job.package_max_lpa} LPA</p>
                <button className="btn-secondary mt-4 w-full" onClick={() => setSelectedJob(job)}>View details</button>
              </div>
            ))}
          </div>
          <div className="card"><Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={load} /></div>
        </>
      )}

      <Modal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        size="lg"
        footer={
          selectedJob?.eligible ? (
            <button className="btn-primary" onClick={() => handleApply(selectedJob)} disabled={applying}>
              {applying ? 'Applying…' : 'Apply now'}
            </button>
          ) : (
            <button className="btn-secondary" disabled>Not eligible to apply</button>
          )
        }
      >
        {selectedJob && (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">{selectedJob.company_name} · {selectedJob.location}</p>
            <p className="text-sm leading-relaxed text-ink-600">{selectedJob.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-ink-400">Package:</span> ₹{selectedJob.package_min_lpa}–{selectedJob.package_max_lpa} LPA</div>
              <div><span className="text-ink-400">Type:</span> {selectedJob.employment_type?.replace('_', ' ')}</div>
              <div><span className="text-ink-400">Deadline:</span> {new Date(selectedJob.application_deadline).toLocaleDateString()}</div>
              <div><span className="text-ink-400">Drive date:</span> {selectedJob.drive_date ? new Date(selectedJob.drive_date).toLocaleDateString() : 'TBD'}</div>
            </div>

            {!selectedJob.eligible && selectedJob.eligibilityReasons?.length > 0 && (
              <div className="rounded-lg bg-danger-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-danger-600"><FiXCircle size={14} /> Why you're not eligible</p>
                <ul className="mt-2 space-y-1 text-xs text-danger-600">
                  {selectedJob.eligibilityReasons.map((r) => <li key={r}>• {r}</li>)}
                </ul>
              </div>
            )}
            {selectedJob.eligible && (
              <div className="flex items-center gap-1.5 rounded-lg bg-success-50 p-4 text-xs font-semibold text-success-600">
                <FiCheckCircle size={14} /> You meet all eligibility criteria for this drive.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
