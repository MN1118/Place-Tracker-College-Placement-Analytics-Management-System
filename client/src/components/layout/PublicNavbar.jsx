import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiArrowUpRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/companies', label: 'Companies' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { user, dashboardRoute } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">CP</span>
          <span className="font-display text-base font-semibold text-ink-900">CampusPlacements</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-ink-500 hover:text-ink-800'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to={dashboardRoute} className="btn-primary">
              Go to dashboard <FiArrowUpRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-600">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-3">
              {user ? (
                <Link to={dashboardRoute} className="btn-primary flex-1 justify-center">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1 justify-center">Sign in</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center">Get started</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
