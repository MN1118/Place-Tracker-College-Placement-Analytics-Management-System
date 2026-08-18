import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Account details and preferences.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-sm font-semibold text-ink-800">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Email</label>
            <input className="input bg-ink-50" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input bg-ink-50" value={user?.role || ''} disabled />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-sm font-semibold text-ink-800">Session</h2>
        <p className="mt-1.5 text-sm text-ink-500">Sign out of your account on this device.</p>
        <button onClick={logout} className="btn-danger mt-4">Sign out</button>
      </div>
    </div>
  );
}
