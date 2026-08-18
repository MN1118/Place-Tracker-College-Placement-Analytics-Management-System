export default function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3.5">
      <p className="text-xs text-ink-400">
        Showing <span className="font-medium text-ink-600">{Math.min((page - 1) * limit + 1, total)}</span>–
        <span className="font-medium text-ink-600">{Math.min(page * limit, total)}</span> of{' '}
        <span className="font-medium text-ink-600">{total}</span>
      </p>
      <div className="flex gap-2">
        <button className="btn-secondary px-3 py-1.5 text-xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <button className="btn-secondary px-3 py-1.5 text-xs" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
