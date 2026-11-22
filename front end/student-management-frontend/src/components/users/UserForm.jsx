import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../common/Modal';
import { ROLES } from '../../utils/constants';

const EMPTY = {
  fullName: '',
  email: '',
  role: ROLES.STAFF,
  branchId: null,
  password: '',
  confirmPassword: '',
};

export default function UserForm({ open, onClose, onSave, branches, initialValue }) {
  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialValue;

  useEffect(() => {
    if (open) {
      setForm(initialValue ? { ...EMPTY, ...initialValue, password: '', confirmPassword: '' } : EMPTY);
      setShowPassword(false);
      setError('');
    }
  }, [open, initialValue]);

 function handleSubmit(e) {
  e.preventDefault();
  setError('');

  // Password validation
  if (!isEditing || form.password || form.confirmPassword) {
    if (!isEditing && !form.password) {
      setError('Please set a password for this user.');
      return;
    }

    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  }

  // Branch validation
  if (form.role !== ROLES.ADMIN && !form.branchId) {
    setError('Please select a branch.');
    return;
  }

  const payload = {
    fullName: form.fullName,
    email: form.email,
    role: form.role,
    password: form.password,
    ConfirmPassword: form.confirmPassword,
    branchId: form.role !== ROLES.ADMIN ? form.branchId : null,
  };

  console.log(
    'USER PAYLOAD:',
    JSON.stringify(payload, null, 2)
  );

  onSave(payload);
}

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Edit User' : 'Add User'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="user-form" type="submit">{initialValue ? 'Save Changes' : 'Add User'}</button>
        </>
      }
    >
      <form id="user-form" className="flex-col gap-4" style={{ display: 'flex' }} onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Full Name</label>
          <input className="input" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        </div>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="field">
          <label className="field-label">{isEditing ? 'New Password' : 'Password'}</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder={isEditing ? 'Leave blank to keep current password' : '••••••••'}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              style={{ position: 'absolute', right: 4 }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="field">
          <label className="field-label">Confirm Password</label>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="field">
          <label className="field-label">Role</label>
          <select className="select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {form.role !== ROLES.ADMIN && (
  <div className="field">
    <label className="field-label">Branch</label>

    <select
      className="select"
      required
      value={form.branchId || ''}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          branchId: e.target.value
            ? Number(e.target.value)
            : null,
        }))
      }
    >
      <option value="">Select Branch</option>

      {branches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  </div>
)}
      </form>
    </Modal>
  );
}
