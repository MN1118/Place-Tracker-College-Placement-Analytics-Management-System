import { TableSkeleton } from './Skeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { FiInbox } from 'react-icons/fi';

/**
 * columns: [{ key, header, render? }]
 */
export default function DataTable({ columns, rows, loading, error, onRetry, emptyTitle = 'No records found', emptyDescription, rowKey = 'id' }) {
  if (loading) {
    return <div className="p-5"><TableSkeleton cols={columns.length} /></div>;
  }
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }
  if (!rows || rows.length === 0) {
    return <EmptyState icon={FiInbox} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/50">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-ink-50/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-ink-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
