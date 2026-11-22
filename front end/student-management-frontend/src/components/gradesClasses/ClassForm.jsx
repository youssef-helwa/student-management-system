import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

const EMPTY = { name: '', gradeId: '', teacher: '' };

export default function ClassForm({ open, onClose, onSave, grades, initialValue, defaultGradeId, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        initialValue
          ? { name: initialValue.name, gradeId: initialValue.gradeId, teacher: initialValue.teacher || '' }
          : { ...EMPTY, gradeId: defaultGradeId || '' }
      );
    }
  }, [open, initialValue, defaultGradeId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name: form.name.trim(), gradeId: form.gradeId, teacher: form.teacher.trim() });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Class' : 'Add Class'}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="class-form" type="submit">
            {initialValue ? 'Save Changes' : 'Add Class'}
          </button>
        </>
      }
    >
      <form id="class-form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Grade</label>
          <select className="select" required value={form.gradeId} onChange={(e) => update('gradeId', e.target.value)}>
            <option value="" disabled>Select grade</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="field mt-4">
          <label className="field-label">Class Name</label>
          <input
            className="input"
            required
            autoFocus
            placeholder="e.g. Grade 7 - A"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
        <div className="field mt-4">
          <label className="field-label">Teacher</label>
          <input
            className="input"
            placeholder="e.g. Mona Fathy"
            value={form.teacher}
            onChange={(e) => update('teacher', e.target.value)}
          />
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
