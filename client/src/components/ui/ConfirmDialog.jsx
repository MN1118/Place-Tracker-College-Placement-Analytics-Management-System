import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <>
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </>
    }>
      <p className="text-sm text-ink-500">{description}</p>
    </Modal>
  );
}
