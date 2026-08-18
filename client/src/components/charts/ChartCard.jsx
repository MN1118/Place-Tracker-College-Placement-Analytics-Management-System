export default function ChartCard({ title, subtitle, action, children, height = 300 }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
