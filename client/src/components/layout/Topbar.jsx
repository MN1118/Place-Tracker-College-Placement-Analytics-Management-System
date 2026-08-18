import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiBell, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/resources.service';
import { Link } from 'react-router-dom';

export default function Topbar({ onMenuClick, title }) {
  const { user, profile, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    notificationsApi.list().then(({ data }) => setUnread(data.meta.unreadCount)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = profile?.full_name || profile?.name || user?.email;
  const notifPath = { STUDENT: '/student/notifications', ADMIN: '/admin/notifications', COMPANY: '/company/interviews', FACULTY: '/faculty/dashboard' }[user?.role] || '/';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuClick}><FiMenu size={20} /></button>
        {title && <h1 className="font-display text-base font-semibold text-ink-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <Link to={notifPath} className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-50">
          <FiBell size={18} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-display text-xs font-semibold text-brand-700">
              {(displayName || '?').charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-medium text-ink-700 sm:block">{displayName}</span>
            <FiChevronDown size={14} className="hidden text-ink-400 sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-ink-100 bg-white py-1.5 shadow-card">
              <div className="border-b border-ink-100 px-3.5 py-2">
                <p className="truncate text-sm font-medium text-ink-800">{displayName}</p>
                <p className="truncate text-xs text-ink-400">{user?.email}</p>
              </div>
              <button onClick={logout} className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-danger-500 hover:bg-danger-50">
                <FiLogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
