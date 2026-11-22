import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

const DEFAULT_COLOR = '#4A51A8';
const EMPTY = { name: '', code: '', address: '', color: DEFAULT_COLOR };

export default function BranchForm({ open, onClose, onSave, initialValue, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(initialValue ? { ...EMPTY, ...initialValue } : EMPTY);
    }
  }, [open, initialValue]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      address: form.address.trim(),
      color: form.color,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Branch' : 'Add Branch'}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="branch-form" type="submit">
            {initialValue ? 'Save Changes' : 'Add Branch'}
          </button>
        </>
      }
    >
      <form id="branch-form" className="flex-col gap-4" style={{ display: 'flex' }} onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Branch Name</label>
          <input
            className="input"
            required
            autoFocus
            placeholder="e.g. Alexandria"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Code</label>
          <input
            className="input"
            placeholder="e.g. ALX"
            maxLength={6}
            value={form.code}
            onChange={(e) => update('code', e.target.value)}
          />
          <span className="field-hint">Optional — a short code shown in tables and reports.</span>
        </div>
        <div className="field">
          <label className="field-label">Address</label>
          <input
            className="input"
            placeholder="e.g. Downtown, Alexandria"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(e) => update('color', e.target.value)}
              style={{ width: 40, height: 32, padding: 0, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            />
            <span className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Used to tell this branch apart in lists and the branch switcher.</span>
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
      </form>
    </Modal>
  );
}
