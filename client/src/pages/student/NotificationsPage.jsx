import { useEffect, useState } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { notificationsApi } from '../../services/resources.service';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false); setNotifications(null);
    notificationsApi.list().then(({ data }) => setNotifications(data.data)).catch(() => setError(true));
  };
  useEffect(load, []);

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAll = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">Updates on your applications, interviews and offers.</p>
        </div>
        {notifications?.some((n) => !n.is_read) && (
          <button onClick={markAll} className="btn-secondary text-xs">Mark all as read</button>
        )}
      </div>

      {notifications === null && !error && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorState onRetry={load} />}
      {notifications?.length === 0 && <EmptyState icon={FiBell} title="No notifications" description="You're all caught up." />}

      <div className="card divide-y divide-ink-100">
        {notifications?.map((n) => (
          <div key={n.id} className={`flex items-start justify-between gap-4 px-5 py-4 ${!n.is_read ? 'bg-brand-50/30' : ''}`}>
            <div>
              <p className="text-sm font-medium text-ink-800">{n.title}</p>
              <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
              <p className="mt-1.5 text-xs text-ink-400">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            {!n.is_read && (
              <button onClick={() => markRead(n.id)} className="shrink-0 rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-brand-600" title="Mark as read">
                <FiCheck size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
