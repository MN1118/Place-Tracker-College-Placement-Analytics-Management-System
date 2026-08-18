export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-ink-50 p-4 text-ink-300">
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-ink-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
