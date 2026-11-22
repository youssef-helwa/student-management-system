import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

function tomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function SnoozeDialog({ open, onClose, onConfirm }) {
  const [date, setDate] = useState(tomorrowString());

  useEffect(() => {
    if (open) setDate(tomorrowString());
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Snooze Reminder"
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onConfirm(date)}>Snooze</button>
        </>
      }
    >
      <div className="field">
        <label className="field-label">Remind me again on</label>
        <input
          className="input"
          type="date"
          min={tomorrowString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}
