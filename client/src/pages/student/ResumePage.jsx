import { useState } from 'react';
import { FiUpload, FiFileText, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ResumePage() {
  const { profile } = useAuth();
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setFileName(file.name);
    toast.success('Resume ready to submit. Actual file storage requires an object-storage backend (S3/Cloud Storage) — wire the upload endpoint in production.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Resume</h1>
        <p className="mt-1 text-sm text-ink-500">Your primary resume is attached automatically when you apply to a job drive.</p>
      </div>

      <div className="card p-8">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl2 border-2 border-dashed border-ink-200 py-12 text-center hover:border-brand-300 hover:bg-brand-50/30">
          <FiUpload size={26} className="text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-700">{fileName || 'Click to upload your resume (PDF)'}</p>
          <p className="mt-1 text-xs text-ink-400">Max size 5MB</p>
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {profile?.resumes?.length > 0 ? (
        <div className="card divide-y divide-ink-100">
          {profile.resumes.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <FiFileText className="text-brand-500" size={18} />
                <div>
                  <p className="text-sm font-medium text-ink-800">{r.file_name}</p>
                  <p className="text-xs text-ink-400">Uploaded {new Date(r.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              {r.is_primary && <span className="badge bg-success-100 text-success-600">Primary</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="card flex items-center gap-3 p-5">
          <FiDownload className="text-ink-300" size={18} />
          <p className="text-sm text-ink-500">No resume on file yet — upload one above.</p>
        </div>
      )}
    </div>
  );
}
