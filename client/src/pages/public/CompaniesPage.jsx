import { useEffect, useState } from 'react';
import { FiBriefcase, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';
import SearchInput from '../../components/ui/SearchInput';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('loading');

  const load = () => {
    setState('loading');
    api.get('/companies', { params: { search: search || undefined, approval: 'APPROVED', limit: 50 } })
      .then(({ data }) => { setCompanies(data.data); setState('done'); })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Recruiters</span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Companies on the platform</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-500">Approved companies that have posted or are running placement drives this season.</p>

      <div className="mt-8 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by company or industry…" />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {state === 'loading' && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        {state === 'error' && <ErrorState onRetry={load} />}
        {state === 'done' && companies.length === 0 && (
          <div className="col-span-full"><EmptyState icon={FiBriefcase} title="No companies found" description="Try a different search term." /></div>
        )}
        {state === 'done' && companies.map((c) => (
          <div key={c.id} className="card p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 font-display text-sm font-semibold text-brand-700">
              {c.name.charAt(0)}
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-ink-800">{c.name}</h3>
            {c.industry && <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">{c.industry}</p>}
            {c.description && <p className="mt-3 text-sm leading-relaxed text-ink-500 line-clamp-2">{c.description}</p>}
            {c.hq_location && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
                <FiMapPin size={13} /> {c.hq_location}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
