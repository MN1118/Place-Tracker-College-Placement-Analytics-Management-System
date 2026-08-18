import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { jobsApi, departmentsApi } from '../../services/resources.service';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Add a short description'),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'INTERNSHIP', 'INTERN_PPO', 'CONTRACT']),
  packageMinLpa: z.coerce.number().min(0),
  packageMaxLpa: z.coerce.number().min(0),
  applicationDeadline: z.string().min(1, 'Deadline is required'),
  driveDate: z.string().optional(),
  minCgpa: z.coerce.number().min(0).max(10),
  maxBacklogs: z.coerce.number().min(0),
  graduationYear: z.coerce.number().optional(),
  requiredSkillsText: z.string().optional(),
  eligibleDepartmentIds: z.array(z.string()).min(1, 'Select at least one department'),
});

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { employmentType: 'FULL_TIME', eligibleDepartmentIds: [] },
  });

  useEffect(() => { departmentsApi.list().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await jobsApi.create({
        ...values,
        eligibleDepartmentIds: values.eligibleDepartmentIds.map(Number),
        requiredSkills: values.requiredSkillsText ? values.requiredSkillsText.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success('Job drive created — pending admin approval');
      navigate('/company/jobs');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not create job drive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Create a job drive</h1>
        <p className="mt-1 text-sm text-ink-500">Define eligibility criteria — the platform will automatically match students.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
        <div>
          <label className="label">Job title</label>
          <input className="input" {...register('title')} placeholder="Software Engineer Trainee" />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={4} {...register('description')} placeholder="Role responsibilities, expectations…" />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Location</label>
            <input className="input" {...register('location')} placeholder="Pune, India" />
          </div>
          <div>
            <label className="label">Employment type</label>
            <select className="input" {...register('employmentType')}>
              <option value="FULL_TIME">Full time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="INTERN_PPO">Internship + PPO</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>
          <div>
            <label className="label">Minimum package (LPA)</label>
            <input className="input" type="number" step="0.1" {...register('packageMinLpa')} />
            {errors.packageMinLpa && <p className="field-error">{errors.packageMinLpa.message}</p>}
          </div>
          <div>
            <label className="label">Maximum package (LPA)</label>
            <input className="input" type="number" step="0.1" {...register('packageMaxLpa')} />
            {errors.packageMaxLpa && <p className="field-error">{errors.packageMaxLpa.message}</p>}
          </div>
          <div>
            <label className="label">Application deadline</label>
            <input className="input" type="datetime-local" {...register('applicationDeadline')} />
            {errors.applicationDeadline && <p className="field-error">{errors.applicationDeadline.message}</p>}
          </div>
          <div>
            <label className="label">Drive date</label>
            <input className="input" type="datetime-local" {...register('driveDate')} />
          </div>
        </div>

        <div className="border-t border-ink-100 pt-5">
          <h3 className="font-display text-sm font-semibold text-ink-800">Eligibility criteria</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Minimum CGPA</label>
              <input className="input" type="number" step="0.1" min="0" max="10" {...register('minCgpa')} />
              {errors.minCgpa && <p className="field-error">{errors.minCgpa.message}</p>}
            </div>
            <div>
              <label className="label">Max backlogs</label>
              <input className="input" type="number" min="0" {...register('maxBacklogs')} />
            </div>
            <div>
              <label className="label">Graduation year</label>
              <input className="input" type="number" placeholder="2027" {...register('graduationYear')} />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Required skills (comma-separated)</label>
            <input className="input" {...register('requiredSkillsText')} placeholder="React, Node.js, SQL" />
          </div>
          <div className="mt-4">
            <label className="label">Eligible departments</label>
            <Controller
              control={control}
              name="eligibleDepartmentIds"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {departments.map((d) => {
                    const checked = field.value.includes(String(d.id));
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => field.onChange(checked ? field.value.filter((v) => v !== String(d.id)) : [...field.value, String(d.id)])}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                          checked ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-500 hover:bg-ink-50'
                        }`}
                      >
                        {d.code}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.eligibleDepartmentIds && <p className="field-error">{errors.eligibleDepartmentIds.message}</p>}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create job drive'}
        </button>
      </form>
    </div>
  );
}
