import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { analyticsApi } from '../../services/resources.service';
import ChartCard from '../../components/charts/ChartCard';
import { CardSkeleton } from '../../components/ui/Skeleton';

const COLORS = ['#2B4C7E', '#1F9D6C', '#E2A63B', '#5B84CE', '#D8404A', '#83A2DD'];

export default function AnalyticsPage() {
  const [departments, setDepartments] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [packages, setPackages] = useState(null);
  const [trend, setTrend] = useState(null);
  const [demographics, setDemographics] = useState(null);

  useEffect(() => {
    analyticsApi.departments().then(({ data }) => setDepartments(data.data)).catch(() => setDepartments([]));
    analyticsApi.companies().then(({ data }) => setCompanies(data.data)).catch(() => setCompanies([]));
    analyticsApi.packages().then(({ data }) => setPackages(data.data)).catch(() => setPackages([]));
    analyticsApi.placements().then(({ data }) => setTrend(data.data)).catch(() => setTrend({}));
    analyticsApi.demographics().then(({ data }) => setDemographics(data.data)).catch(() => setDemographics({}));
  }, []);

  const loading = !departments || !companies || !packages || !trend || !demographics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Analytics</h1>
        <p className="mt-1 text-sm text-ink-500">All figures are calculated live from PostgreSQL — nothing here is hardcoded.</p>
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <ChartCard title="1. Department-wise placement %" subtitle="Placed students as a share of department total">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Bar dataKey="placementPercentage" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="2. Year-wise placement trend" subtitle="By graduation-year cohort">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.yearWiseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="placementPercentage" stroke={COLORS[1]} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="3. Company-wise hiring" subtitle="Students selected per company">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companies.slice(0, 8)} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="company" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="selected" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="4. Salary / package distribution" subtitle="Offers grouped by LPA band">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={packages} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90} label>
                  {packages.map((entry, i) => <Cell key={entry.range} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="5. Applications vs. selections" subtitle="Application funnel across all drives">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend.applicationFunnel} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="6. Monthly placement trend" subtitle="Offers made per month">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.monthlyPlacements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="placed" stroke={COLORS[4]} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="7. Gender-wise statistics" subtitle="Total vs. placed, by gender">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.genderWise} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="gender" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" fill="#D3D7DE" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placed" fill={COLORS[0]} name="Placed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="8. Course-wise placement" subtitle="Placement % by course">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.courseWise} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" vertical={false} />
                <XAxis dataKey="course" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Bar dataKey="placementPercentage" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="9. Job role distribution" subtitle="Most common roles among placed students">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.jobRoleDistribution} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="role" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="placed" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="10. Top recruiting companies" subtitle="By number of selections">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companies.slice(0, 6)} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAEE" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="company" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="selected" fill={COLORS[3]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
