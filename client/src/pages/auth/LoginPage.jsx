import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@campusplacements.edu' },
  { label: 'Student', email: 'student1@campusplacements.edu' },
  { label: 'Company', email: 'technovasolutions@company.com' },
  { label: 'Faculty', email: 'bca.faculty@campusplacements.edu' },
];

const DASHBOARD_ROUTE = { ADMIN: '/admin/dashboard', STUDENT: '/student/dashboard', COMPANY: '/company/dashboard', FACULTY: '/faculty/dashboard' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      toast.success('Welcome back!');
      navigate(DASHBOARD_ROUTE[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">CP</span>
          <span className="font-display text-base font-semibold text-ink-900">CampusPlacements</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-xl font-semibold text-ink-900">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-ink-500">Enter your credentials to access your dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" {...register('email')} placeholder="you@campusplacements.edu" />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            Don't have an account? <Link to="/register" className="font-medium text-brand-600">Register</Link>
          </p>
        </div>

        <div className="mt-6 card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Demo accounts (password: Password@123)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setValue('email', acc.email); setValue('password', 'Password@123'); }}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
