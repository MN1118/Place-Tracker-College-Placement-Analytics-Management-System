import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { companiesApi } from '../../services/resources.service';
import StatusBadge from '../../components/ui/StatusBadge';

export default function CompanyProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '', industry: profile.industry || '', website: profile.website || '',
        description: profile.description || '', hqLocation: profile.hq_location || '',
      });
    }
  }, [profile, reset]);

  if (!profile) return null;

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await companiesApi.update(profile.id, values);
      await refreshProfile();
      toast.success('Company profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Company profile</h1>
          <p className="mt-1 text-sm text-ink-500">Visible to students on approved job drives.</p>
        </div>
        <StatusBadge status={profile.approval_status} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Company name</label>
            <input className="input" {...register('name')} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" {...register('industry')} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" {...register('website')} />
          </div>
          <div>
            <label className="label">HQ location</label>
            <input className="input" {...register('hqLocation')} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={4} {...register('description')} />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : <>Save changes <FiSave size={15} /></>}
        </button>
      </form>
    </div>
  );
}
