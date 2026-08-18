import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    // No backend endpoint is specified for contact messages in this project scope;
    // this simulates submission so the form is not a dead end.
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: '', email: '', message: '' });
      toast.success("Message sent — the placement cell will get back to you.");
    }, 700);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Get in touch</span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">Contact the placement cell</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-500">Questions about eligibility, a job drive, or getting your company onboarded — reach out below.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card flex items-start gap-3 p-5">
            <FiMail className="mt-0.5 text-brand-500" size={18} />
            <div>
              <p className="text-sm font-semibold text-ink-800">Email</p>
              <p className="text-sm text-ink-500">placements@campusplacements.edu</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-5">
            <FiPhone className="mt-0.5 text-brand-500" size={18} />
            <div>
              <p className="text-sm font-semibold text-ink-800">Phone</p>
              <p className="text-sm text-ink-500">+91 20 4567 8900</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-5">
            <FiMapPin className="mt-0.5 text-brand-500" size={18} />
            <div>
              <p className="text-sm font-semibold text-ink-800">Placement Cell Office</p>
              <p className="text-sm text-ink-500">Main Academic Block, 2nd Floor, Pune, India</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6 lg:col-span-3">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
          </div>
          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
            {submitting ? 'Sending…' : <>Send message <FiSend size={15} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
