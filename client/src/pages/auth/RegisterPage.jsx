import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { departmentsApi } from '../../services/resources.service';

const baseSchema = {
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
};

const studentSchema = z.object({
  ...baseSchema,
  role: z.literal('STUDENT'),
  rollNumber: z.string().min(2, 'Roll number is required'),
  departmentId: z.string().min(1, 'Select a department'),
  course: z.string().min(1, 'Course is required'),
  graduationYear: z.coerce.number().min(2024).max(2030),
});

const companySchema = z.object({
  ...baseSchema,
  role: z.literal('COMPANY'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().optional(),
});

const schema = z.discriminatedUnion('role', [studentSchema, companySchema]);

const DASHBOARD_ROUTE = { STUDENT: '/student/dashboard', COMPANY: '/company/dashboard' };

export default function RegisterPage() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('STUDENT');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  });

  useEffect(() => { departmentsApi.list().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);
  useEffect(() => { reset({ role }); }, [role, reset]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values, departmentId: values.departmentId ? Number(values.departmentId) : undefined };
      const user = await doRegister(payload);
      toast.success('Account created!');
      navigate(DASHBOARD_ROUTE[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">CP</span>
          <span className="font-display text-base font-semibold text-ink-900">CampusPlacements</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-xl font-semibold text-ink-900">Create an account</h1>
          <p className="mt-1.5 text-sm text-ink-500">Admin and faculty accounts are provisioned by the placement cell directly.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-1">
            {['STUDENT', 'COMPANY'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}
              >
                {r === 'STUDENT' ? 'I\u2019m a student' : 'I\u2019m a recruiter'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <input type="hidden" {...register('role')} value={role} />
            <div>
              <label className="label">Full name</label>
              <input className="input" {...register('fullName')} placeholder="Full name" />
              {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input className="input" {...register('email')} placeholder="you@example.com" />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" {...register('password')} placeholder="At least 8 characters" />
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>
            </div>

            {role === 'STUDENT' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Roll number</label>
                    <input className="input" {...register('rollNumber')} placeholder="BCA2027001" />
                    {errors.rollNumber && <p className="field-error">{errors.rollNumber.message}</p>}
                  </div>
                  <div>
                    <label className="label">Graduation year</label>
                    <input className="input" type="number" {...register('graduationYear')} placeholder="2027" />
                    {errors.graduationYear && <p className="field-error">{errors.graduationYear.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Department</label>
                    <select className="input" {...register('departmentId')}>
                      <option value="">Select department</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.code}</option>)}
                    </select>
                    {errors.departmentId && <p className="field-error">{errors.departmentId.message}</p>}
                  </div>
                  <div>
                    <label className="label">Course</label>
                    <input className="input" {...register('course')} placeholder="BCA" />
                    {errors.course && <p className="field-error">{errors.course.message}</p>}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company name</label>
                  <input className="input" {...register('companyName')} placeholder="Acme Corp" />
                  {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
                </div>
                <div>
                  <label className="label">Industry</label>
                  <input className="input" {...register('industry')} placeholder="Software & IT Services" />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            Already have an account? <Link to="/login" className="font-medium text-brand-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
