import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';

const EMPTY = {
  amount: '',
  category: '',
  description: '',
  paymentMethod: 'Cash',
};

export default function ExpenseForm({ open, onClose, onSave, initialValue, branchName }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(initialValue ? { ...EMPTY, ...initialValue } : EMPTY);
  }, [open, initialValue]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, amount: Number(form.amount) });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Expense' : 'Add Expense'}
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="expense-form" type="submit">
            {initialValue ? 'Save Changes' : 'Add Expense'}
          </button>
        </>
      }
    >
      <form id="expense-form" className="grid-2" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Amount (EGP)</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Category</label>
          <select className="select" required value={form.category} onChange={(e) => update('category', e.target.value)}>
            <option value="" disabled>Select category</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Description</label>
          <textarea
            className="textarea"
            required
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What was this expense for?"
          />
        </div>
        <div className="field">
          <label className="field-label">Payment Method</label>
          <select className="select" value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Branch</label>
          <input className="input" value={branchName || ''} disabled />
          <span className="field-hint">Recorded against your currently selected branch.</span>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Receipt / Image</label>
          <input className="input" type="file" accept="image/*" disabled />
          <span className="field-hint">Receipt upload will be wired up once file storage is available in the backend.</span>
        </div>
      </form>
    </Modal>
  );
}
