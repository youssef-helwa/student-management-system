import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

const EMPTY = {
  fullName: '',
  FatherName: '',
  studentPhone: '',
  FatherPhone: '',
  gradeId: '',
  classId: '',
  address: '',
  feeType: 'full',
  status: 'active',
};

export default function StudentForm({ open, onClose, onSave, grades, classes, initialValue, branchId ,error}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (!initialValue) {
      setForm(EMPTY);
      return;
    }
    // Existing students may only have the old `feeExempted` boolean and no
    // `feeType` yet — derive a sensible feeType so the Edit form shows the
    // right option instead of silently defaulting to Full Fee.
    const feeType = initialValue.feeType || (initialValue.feeExempted ? 'exempted' : 'full');
    setForm({ ...EMPTY, ...initialValue, feeType });
  }, [open, initialValue]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // feeType is the field the backend expects ('full' | 'half' | 'exempted').
    // feeExempted is kept in sync (true only for 'exempted') so the existing
    // exemption-based logic in reports/payments/dashboard keeps working —
    // it doesn't yet know about the 'half' case, that's separate follow-up
    // work if you want half-fee reflected in those calculations too.
    onSave({ ...form, feeExempted: form.feeType === 'exempted', branchId: branchId });
  }

  console.log("StudentForm grades:", grades);
console.log("StudentForm classes:", classes);
console.log("Selected gradeId:", form.gradeId);


  const classOptions = (classes || []).filter(
  (c) => String(c.gradeId) === String(form.gradeId)
);

console.log("========== CLASS FILTER DEBUG ==========");
console.log("FORM GRADE ID:", form.gradeId);
console.log("ALL CLASSES:", classes);
console.log(
  "CLASS GRADE IDS:",
  classes?.map(c => ({
    id: c.id,
    name: c.name,
    gradeId: c.gradeId,
    gradeIdType: typeof c.gradeId
  }))
);
console.log("CLASS OPTIONS:", classOptions);
console.log("========================================");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit Student' : 'Add Student'}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="student-form" type="submit">
            {initialValue ? 'Save Changes' : 'Add Student'}
          </button>
        </>
      }
    >
      <form id="student-form" className="grid-2" onSubmit={handleSubmit}>
        {error && (
    <div
      style={{
        gridColumn: '1 / -1',
        padding: '12px 16px',
        marginBottom: '12px',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        background: '#fef2f2',
        color: '#dc2626',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      {error}
    </div>
  )}
        <div className="field">
          <label className="field-label">Full Name</label>
          <input className="input" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Father's Name</label>
          <input className="input" value={form.FatherName} onChange={(e) => update('FatherName', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Student Phone</label>
          <input className="input" value={form.studentPhone} onChange={(e) => update('studentPhone', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Parent Phone</label>
          <input className="input" value={form.FatherPhone} onChange={(e) => update('FatherPhone', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Grade</label>
          <select className="select" required value={form.gradeId} onChange={(e) => {update('gradeId', e.target.value);update('classId', '')}}>
            <option value="" disabled>Select grade</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Class</label>
          <select className="select" value={form.classId} onChange={(e) => update('classId', e.target.value)} disabled={!form.gradeId}>
            <option value="">Select class</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Address</label>
          <input className="input" value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Profile Picture</label>
          <input className="input" type="file" accept="image/*" disabled />
          <span className="field-hint">Upload will be wired up once file storage is available in the backend.</span>
        </div>
        <div className="field">
  <label className="field-label">Fee Type</label>
  <select
    className="select"
    value={form.feeType}
    onChange={(e) => update('feeType', e.target.value)}
  >
    <option value="full">Full Fee (100%)</option>
    <option value="half">Half Fee (50%)</option>
    <option value="exempted">Exempted (0%)</option>
  </select>
</div>

<div className="field">
  <label className="field-label">Student Status</label>
  <select
    className="select"
    value={form.status}
    onChange={(e) => update('status', e.target.value)}
  >
    <option value="active">Active</option>
    <option value="terminated">inActive</option>
  </select>
</div>

</form>
    </Modal>
  );
}
