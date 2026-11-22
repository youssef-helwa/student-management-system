import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { setupAdministrator } from '../../services/authService';
import { PATHS } from '../../router/paths';

const EMPTY = { fullName: '', email: '', password: '', confirmPassword: '' };

// First-run screen: creates the one and only administrator account the
// backend needs to bootstrap itself. The backend assigns
// role = Administrator, branch = null, status = active — none of that is
// asked for here.
export default function CreateAdministrator() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      return 'Please fill in every field.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setLoading(true);
    try {
      await setupAdministrator(form);
      navigate(PATHS.setupWizard, { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not create the administrator account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>Welcome to EduCenter</h2>
      <p className="text-secondary mb-4">
        Let&apos;s get your center set up. Create the first administrator account to continue.
      </p>

      <form className="flex-col gap-4" style={{ display: 'flex' }} onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="fullName">Full Name</label>
          <div className="search-input-wrap">
            <User size={15} />
            <input
              id="fullName"
              className="input"
              placeholder="e.g. Ahmed El-Sayed"
              value={form.fullName}
              onChange={update('fullName')}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <div className="search-input-wrap">
            <Mail size={15} />
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <div className="search-input-wrap">
            <Lock size={15} />
            <input
              id="password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="search-input-wrap">
            <Lock size={15} />
            <input
              id="confirmPassword"
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
          <ShieldCheck size={16} /> {loading ? 'Creating…' : 'Create Administrator'}
        </button>
      </form>

      <p className="text-tertiary mt-4" style={{ fontSize: 'var(--fs-xs)', textAlign: 'center' }}>
        This account is created with full Administrator access.
      </p>
    </AuthLayout>
  );
}
