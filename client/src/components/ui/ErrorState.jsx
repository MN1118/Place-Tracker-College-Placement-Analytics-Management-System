import { FiAlertTriangle } from 'react-icons/fi';

export default function ErrorState({ message = "Something went wrong while loading this data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 rounded-full bg-danger-50 p-4 text-danger-500">
        <FiAlertTriangle size={28} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-800">Couldn't load this page</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-5">Retry</button>
      )}
    </div>
  );
}
