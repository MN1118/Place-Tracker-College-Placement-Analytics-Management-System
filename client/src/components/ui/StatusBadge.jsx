const STYLES = {
  APPLIED: 'bg-ink-100 text-ink-600',
  SHORTLISTED: 'bg-brand-100 text-brand-700',
  TEST_SCHEDULED: 'bg-brand-100 text-brand-700',
  TEST_COMPLETED: 'bg-brand-100 text-brand-700',
  TECH_INTERVIEW: 'bg-warning-100 text-warning-600',
  HR_INTERVIEW: 'bg-warning-100 text-warning-600',
  SELECTED: 'bg-success-100 text-success-600',
  REJECTED: 'bg-danger-100 text-danger-600',
  WITHDRAWN: 'bg-ink-100 text-ink-500',
  OPEN: 'bg-success-100 text-success-600',
  CLOSED: 'bg-ink-100 text-ink-500',
  PENDING_APPROVAL: 'bg-warning-100 text-warning-600',
  DRAFT: 'bg-ink-100 text-ink-500',
  CANCELLED: 'bg-danger-100 text-danger-600',
  PENDING: 'bg-warning-100 text-warning-600',
  APPROVED: 'bg-success-100 text-success-600',
  PASS: 'bg-success-100 text-success-600',
  FAIL: 'bg-danger-100 text-danger-600',
  ON_HOLD: 'bg-warning-100 text-warning-600',
};

const LABELS = {
  TECH_INTERVIEW: 'Technical Interview',
  HR_INTERVIEW: 'HR Interview',
  TEST_SCHEDULED: 'Test Scheduled',
  TEST_COMPLETED: 'Test Completed',
  PENDING_APPROVAL: 'Pending Approval',
  ON_HOLD: 'On Hold',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const label = LABELS[status] || status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
  return <span className={`badge ${STYLES[status] || 'bg-ink-100 text-ink-600'}`}>{label}</span>;
}
