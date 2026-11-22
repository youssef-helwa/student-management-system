import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

export default function FollowUpForm({ open, onClose, onSave, studentName }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ note });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Follow-Up Reminder"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="follow-up-form" type="submit">Add Reminder</button>
        </>
      }
    >
      <form id="follow-up-form" onSubmit={handleSubmit}>
        {studentName && (
          <p className="text-secondary mb-3" style={{ fontSize: 'var(--fs-sm)' }}>For {studentName}</p>
        )}
        <div className="field">
          <label className="field-label">Note</label>
          <textarea
            className="input"
            rows={3}
            required
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Call parent back tomorrow about the phone number update"
          />
        </div>
      </form>
    </Modal>
  );
}
