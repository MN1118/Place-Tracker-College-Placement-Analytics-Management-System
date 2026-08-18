import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiGithub, FiLinkedin, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../services/resources.service';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        cgpa: profile.cgpa || '',
        backlogs: profile.backlogs || 0,
        githubUrl: profile.github_url || '',
        linkedinUrl: profile.linkedin_url || '',
      });
    }
  }, [profile, reset]);

  if (!profile) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>;

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await studentsApi.update(profile.id, values);
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">My profile</h1>
        <p className="mt-1 text-sm text-ink-500">Keep this current — it drives your eligibility for every job drive.</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-700">Profile completion</p>
          <p className="font-mono text-sm font-semibold text-ink-800">{profile.profile_completion}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${profile.profile_completion}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input className="input" {...register('fullName')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} placeholder="10-digit number" />
          </div>
          <div>
            <label className="label">Roll number</label>
            <input className="input bg-ink-50" value={profile.roll_number} disabled />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input bg-ink-50" value={profile.department_name || ''} disabled />
          </div>
          <div>
            <label className="label">CGPA</label>
            <input className="input" type="number" step="0.01" min="0" max="10" {...register('cgpa')} />
          </div>
          <div>
            <label className="label">Active backlogs</label>
            <input className="input" type="number" min="0" {...register('backlogs')} />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><FiGithub size={14} /> GitHub URL</label>
            <input className="input" {...register('githubUrl')} placeholder="https://github.com/username" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><FiLinkedin size={14} /> LinkedIn URL</label>
            <input className="input" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/username" />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : <>Save changes <FiSave size={15} /></>}
        </button>
      </form>

      {profile.skills?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display text-sm font-semibold text-ink-800">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s.id} className="badge bg-brand-50 text-brand-600">{s.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
