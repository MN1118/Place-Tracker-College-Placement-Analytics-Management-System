import { useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reportsApi } from '../../services/resources.service';
import { exportToCsv, exportToExcel, exportToPdf } from '../../utils/exportReport';

const REPORTS = [
  { key: 'overall', title: 'Overall placement report', desc: 'Every student with their department, CGPA and placement outcome.', fetch: reportsApi.overall },
  { key: 'departments', title: 'Department placement report', desc: 'Aggregated placement numbers per department.', fetch: reportsApi.departments },
  { key: 'companies', title: 'Company recruitment report', desc: 'Job drives, applications and selections per company.', fetch: reportsApi.companies },
  { key: 'salary', title: 'Salary / package report', desc: 'Every placement offer sorted by package.', fetch: reportsApi.salary },
];

export default function ReportsPage() {
  const [loadingKey, setLoadingKey] = useState(null);

  const handleExport = async (report, format) => {
    setLoadingKey(`${report.key}-${format}`);
    try {
      const { data } = await report.fetch();
      const rows = data.data;
      if (!rows.length) { toast.error('No data available for this report yet'); return; }
      if (format === 'csv') exportToCsv(report.key, rows);
      if (format === 'excel') exportToExcel(report.key, rows);
      if (format === 'pdf') exportToPdf(report.key, report.title, rows);
      toast.success(`${report.title} exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Could not generate report');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">Export live placement data as CSV, Excel, or PDF.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <div key={r.key} className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiFileText size={18} />
            </div>
            <h3 className="mt-4 font-display text-sm font-semibold text-ink-800">{r.title}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              {['csv', 'excel', 'pdf'].map((fmt) => (
                <button
                  key={fmt}
                  className="btn-secondary px-3 py-1.5 text-xs"
                  disabled={loadingKey === `${r.key}-${fmt}`}
                  onClick={() => handleExport(r, fmt)}
                >
                  <FiDownload size={13} /> {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
