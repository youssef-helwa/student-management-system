import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3" style={{ alignItems: 'flex-start' }}>
        <div
          className="stat-icon"
          style={{ '--icon-bg': 'var(--danger-100)', '--icon-fg': 'var(--danger-600)', flexShrink: 0 }}
        >
          <AlertTriangle size={18} />
        </div>
        <p className="text-secondary">{message}</p>
      </div>
    </Modal>
  );
}
