export default function StatCard({ label, value, sublabel, icon: Icon, tone = 'brand' }) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-2 text-2xl font-display font-semibold text-ink-900 tabular-nums">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
      </div>
      {Icon && (
        <div className={`rounded-lg p-2.5 ${toneClasses[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
