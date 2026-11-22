import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

const EMPTY = { name: '', subject: '', gradeId: '', date: '', totalMarks: 50 };

export default function ExamForm({ open, onClose, onSave, grades, initialValue, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        initialValue
          ? {
              name: initialValue.name,
              subject: initialValue.subject,
              gradeId: initialValue.gradeId,
              date: initialValue.date,
              totalMarks: initialValue.totalMarks,
            }
          : EMPTY
      );
    }
  }, [open, initialValue]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, totalMarks: Number(form.totalMarks) });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Exam' : 'Add Exam'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="exam-form" type="submit">
            {initialValue ? 'Save Changes' : 'Create Exam'}
          </button>
        </>
      }
    >
      <form id="exam-form" className="flex-col gap-4" style={{ display: 'flex' }} onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Exam Name</label>
          <input className="input" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Midterm - Mathematics" />
        </div>
        <div className="field">
          <label className="field-label">Subject</label>
          <input className="input" required value={form.subject} onChange={(e) => update('subject', e.target.value)} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Grade</label>
            <select className="select" required value={form.gradeId} onChange={(e) => update('gradeId', e.target.value)}>
              <option value="" disabled>Select grade</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Total Marks</label>
            <input className="input" type="number" min="1" required value={form.totalMarks} onChange={(e) => update('totalMarks', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label">Date</label>
          <input className="input" type="date" required value={form.date} onChange={(e) => update('date', e.target.value)} />
        </div>
        {error && (
          <p style={{ color: 'var(--danger-500)', fontSize: 'var(--fs-sm)' }}>{error}</p>
        )}
      </form>
    </Modal>
  );
}
