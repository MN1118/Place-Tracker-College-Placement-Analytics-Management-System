import { NavLink } from 'react-router-dom';
import { NAV_CONFIG } from './navConfig';

export default function Sidebar({ role, open, onClose }) {
  const links = NAV_CONFIG[role] || [];

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-ink-100 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-ink-100 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">CP</span>
          <span className="font-display text-sm font-semibold text-ink-900">CampusPlacements</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                }`
              }
            >
              <link.icon size={17} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
