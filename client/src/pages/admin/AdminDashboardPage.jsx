import { useEffect, useState } from 'react';
import { FiUsers, FiHome, FiBriefcase, FiClipboard, FiAward, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services/resources.service';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/charts/ChartCard';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    analyticsApi.overview().then(({ data }) => setOverview(data.data)).catch(() => {});
    analyticsApi.departments().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Placement overview</h1>
        <p className="mt-1 text-sm text-ink-500">Live figures computed from the placement database.</p>
      </div>

      {!overview ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total students" value={overview.totalStudents} icon={FiUsers} tone="brand" />
          <StatCard label="Eligible students" value={overview.eligibleStudents} icon={FiUsers} tone="brand" />
          <StatCard label="Companies" value={overview.totalCompanies} icon={FiHome} tone="brand" />
          <StatCard label="Open job drives" value={overview.totalJobDrives} icon={FiBriefcase} tone="brand" />
          <StatCard label="Applications" value={overview.totalApplications} icon={FiClipboard} tone="warning" />
          <StatCard label="Shortlisted" value={overview.shortlistedStudents} icon={FiClipboard} tone="warning" />
          <StatCard label="Placed students" value={overview.placedStudents} icon={FiAward} tone="success" />
          <StatCard label="Placement rate" value={`${overview.placementPercentage}%`} icon={FiTrendingUp} tone="success" />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Department-wise placement %" subtitle="Placed vs. total students">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Bar dataKey="placementPercentage" fill="#2B4C7E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Average package by department" subtitle="In LPA">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="averagePackageLpa" fill="#1F9D6C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="card overflow-x-auto">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-ink-800">Department breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3">Department</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Eligible</th>
              <th className="px-5 py-3">Applications</th><th className="px-5 py-3">Shortlisted</th><th className="px-5 py-3">Placed</th>
              <th className="px-5 py-3">Placement %</th><th className="px-5 py-3">Avg Package</th><th className="px-5 py-3">Highest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {departments.map((d) => (
              <tr key={d.department}>
                <td className="px-5 py-3 font-medium text-ink-800">{d.department}</td>
                <td className="px-5 py-3">{d.totalStudents}</td>
                <td className="px-5 py-3">{d.eligibleStudents}</td>
                <td className="px-5 py-3">{d.applications}</td>
                <td className="px-5 py-3">{d.shortlisted}</td>
                <td className="px-5 py-3">{d.placed}</td>
                <td className="px-5 py-3 font-mono">{d.placementPercentage}%</td>
                <td className="px-5 py-3 font-mono">₹{d.averagePackageLpa}L</td>
                <td className="px-5 py-3 font-mono">₹{d.highestPackageLpa}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
