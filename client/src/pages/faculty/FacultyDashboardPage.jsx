import { useEffect, useState } from 'react';
import { FiUsers, FiAward, FiTrendingUp, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../services/resources.service';
import StatCard from '../../components/ui/StatCard';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function FacultyDashboardPage() {
  const { profile } = useAuth();
  const [departments, setDepartments] = useState(null);

  useEffect(() => { analyticsApi.departments().then(({ data }) => setDepartments(data.data)).catch(() => setDepartments([])); }, []);

  const myDept = departments?.find((d) => d.department === profile?.department_name) || departments?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Department overview</h1>
        <p className="mt-1 text-sm text-ink-500">Placement performance for {profile?.department_name || 'your department'}.</p>
      </div>

      {!myDept ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total students" value={myDept.totalStudents} icon={FiUsers} tone="brand" />
          <StatCard label="Placed" value={myDept.placed} icon={FiAward} tone="success" />
          <StatCard label="Placement %" value={`${myDept.placementPercentage}%`} icon={FiTrendingUp} tone="success" />
          <StatCard label="Applications" value={myDept.applications} icon={FiBriefcase} tone="brand" />
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-sm font-semibold text-ink-800">All departments</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="py-2">Department</th><th className="py-2">Placed</th><th className="py-2">Placement %</th><th className="py-2">Avg Package</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {departments?.map((d) => (
                <tr key={d.department}>
                  <td className="py-2.5 font-medium text-ink-800">{d.department}</td>
                  <td className="py-2.5">{d.placed}</td>
                  <td className="py-2.5 font-mono">{d.placementPercentage}%</td>
                  <td className="py-2.5 font-mono">₹{d.averagePackageLpa}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
