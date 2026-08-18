import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/charts/ChartCard';
import { FiUsers, FiAward, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

const COLORS = ['#2B4C7E', '#1F9D6C', '#E2A63B', '#5B84CE', '#D8404A'];

export default function StatisticsPage() {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    api.get('/analytics/overview').then(({ data }) => setOverview(data.data)).catch(() => {});
    api.get('/analytics/departments').then(({ data }) => setDepartments(data.data)).catch(() => {});
    api.get('/analytics/packages').then(({ data }) => setPackages(data.data)).catch(() => {});
    api.get('/analytics/placements').then(({ data }) => setTrend(data.data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Live data</span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Placement statistics</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-500">Computed directly from placement records — updated as students are placed.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students placed" value={overview?.placedStudents ?? '—'} icon={FiUsers} tone="brand" />
        <StatCard label="Placement rate" value={overview ? `${overview.placementPercentage}%` : '—'} icon={FiTrendingUp} tone="success" />
        <StatCard label="Average package" value={overview ? `\u20b9${overview.averagePackageLpa}L` : '—'} icon={FiDollarSign} tone="warning" />
        <StatCard label="Highest package" value={overview ? `\u20b9${overview.highestPackageLpa}L` : '—'} icon={FiAward} tone="brand" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Department-wise placement %" subtitle="Placed students as a share of total students per department">
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

        <ChartCard title="Package distribution" subtitle="Number of offers per salary band">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={packages} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90} label>
                {packages.map((entry, i) => <Cell key={entry.range} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Year-wise placement trend" subtitle="Placement % by graduation year cohort">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend?.yearWiseTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="placementPercentage" stroke="#1F9D6C" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly placements" subtitle="Offers made per month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend?.monthlyPlacements || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="placed" fill="#E2A63B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
