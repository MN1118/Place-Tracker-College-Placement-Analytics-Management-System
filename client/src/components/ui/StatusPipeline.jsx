/**
 * Signature component: a horizontal stepper that visualizes the placement
 * workflow (Applied -> Shortlisted -> Test -> Tech -> HR -> Selected).
 * Reused on the homepage, student application cards, and admin views —
 * this is the product's recurring visual motif.
 */
const STAGES = ['APPLIED', 'SHORTLISTED', 'TEST_COMPLETED', 'TECH_INTERVIEW', 'HR_INTERVIEW', 'SELECTED'];
const STAGE_LABELS = {
  APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', TEST_COMPLETED: 'Test',
  TECH_INTERVIEW: 'Technical', HR_INTERVIEW: 'HR', SELECTED: 'Selected',
};

export default function StatusPipeline({ status }) {
  const isRejected = status === 'REJECTED' || status === 'WITHDRAWN';
  const currentIndex = STAGES.indexOf(status);
  const activeIndex = currentIndex === -1 ? (isRejected ? STAGES.length - 1 : 0) : currentIndex;

  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => {
        const reached = i <= activeIndex && !isRejected;
        const isCurrent = i === activeIndex && !isRejected;
        return (
          <div key={stage} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ring-4 transition-colors ${
                  reached ? 'bg-brand-500 ring-brand-100' : 'bg-ink-200 ring-transparent'
                } ${isCurrent ? 'bg-success-500 ring-success-100' : ''}`}
              />
              <span className={`text-[10px] font-medium whitespace-nowrap ${reached ? 'text-ink-700' : 'text-ink-300'}`}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-px w-8 sm:w-12 ${i < activeIndex && !isRejected ? 'bg-brand-300' : 'bg-ink-150 bg-ink-200'}`} />
            )}
          </div>
        );
      })}
      {isRejected && <span className="badge bg-danger-100 text-danger-600 ml-3">Rejected</span>}
    </div>
  );
}
