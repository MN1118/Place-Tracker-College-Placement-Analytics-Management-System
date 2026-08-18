import { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/resources.service';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(null);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false); setDepartments(null);
    analyticsApi.departments().then(({ data }) => setDepartments(data.data)).catch(() => setError(true));
  };
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Departments</h1>
        <p className="mt-1 text-sm text-ink-500">Placement performance by academic department.</p>
      </div>

      <div className="card overflow-x-auto">
        {departments === null && !error && <div className="p-5"><TableSkeleton /></div>}
        {error && <ErrorState onRetry={load} />}
        {departments && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">Department</th><th className="px-5 py-3">Total Students</th>
                <th className="px-5 py-3">Eligible</th><th className="px-5 py-3">Applications</th>
                <th className="px-5 py-3">Shortlisted</th><th className="px-5 py-3">Placed</th>
                <th className="px-5 py-3">Placement %</th><th className="px-5 py-3">Avg Package</th><th className="px-5 py-3">Highest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {departments.map((d) => (
                <tr key={d.department}>
                  <td className="px-5 py-3.5 font-medium text-ink-800">{d.department}</td>
                  <td className="px-5 py-3.5">{d.totalStudents}</td>
                  <td className="px-5 py-3.5">{d.eligibleStudents}</td>
                  <td className="px-5 py-3.5">{d.applications}</td>
                  <td className="px-5 py-3.5">{d.shortlisted}</td>
                  <td className="px-5 py-3.5">{d.placed}</td>
                  <td className="px-5 py-3.5 font-mono">{d.placementPercentage}%</td>
                  <td className="px-5 py-3.5 font-mono">₹{d.averagePackageLpa}L</td>
                  <td className="px-5 py-3.5 font-mono">₹{d.highestPackageLpa}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
