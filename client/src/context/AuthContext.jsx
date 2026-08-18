import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

const DASHBOARD_ROUTE = {
  ADMIN: '/admin/dashboard',
  STUDENT: '/student/dashboard',
  COMPANY: '/company/dashboard',
  FACULTY: '/faculty/dashboard',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authService.me();
      setUser(data.data.user);
      setProfile(data.data.profile);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    await loadProfile();
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    await loadProfile();
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile: loadProfile, dashboardRoute: user ? DASHBOARD_ROUTE[user.role] : '/login' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
