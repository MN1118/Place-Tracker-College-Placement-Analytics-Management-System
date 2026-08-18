import { FiX } from 'react-icons/fi';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" onClick={onClose}>
      <div className={`w-full ${sizeClass} rounded-xl2 bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700">
            <FiX size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
