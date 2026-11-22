import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

const EMPTY = { name: '', order: '' };

export default function GradeForm({ open, onClose, onSave, initialValue, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(initialValue ? { name: initialValue.name, order: initialValue.order ?? '' } : EMPTY);
  }, [open, initialValue]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name: form.name.trim(), order: form.order === '' ? undefined : Number(form.order) });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Grade' : 'Add Grade'}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="grade-form" type="submit">
            {initialValue ? 'Save Changes' : 'Add Grade'}
          </button>
        </>
      }
    >
      <form id="grade-form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Grade Name</label>
          <input
            className="input"
            required
            autoFocus
            placeholder="e.g. Grade 7"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
        <div className="field mt-4">
          <label className="field-label">Display Order</label>
          <input
            className="input"
            type="number"
            placeholder="Used to sort grades in lists"
            value={form.order}
            onChange={(e) => update('order', e.target.value)}
          />
          <span className="field-hint">Optional — lower numbers appear first.</span>
        </div>
        {error && (
          <p className="mt-4" style={{ color: 'var(--danger-500)', fontSize: 'var(--fs-sm)' }}>
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
