import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, User, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const setupSuccess = location.state?.setupSuccess;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(form);
      navigate('/select-branch');
    } catch {
      // error is surfaced via auth context state
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>Welcome back</h2>
      <p className="text-secondary mb-4">Sign in to manage your center.</p>

      {setupSuccess && (
        <p className="field-success mb-4 flex items-center gap-2">
          <CheckCircle2 size={15} /> Administrator account created. Please sign in.
        </p>
      )}

      <form className="flex-col gap-4" style={{ display: 'flex' }} onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="username">Username</label>
          <div className="search-input-wrap">
            <User size={15} />
            <input
              id="username"
              className="input"
              placeholder="e.g. ahmed.elsayed"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              autoComplete="username"
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
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" className="text-secondary" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
            Forgot password?
          </a>
        </div>

        <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
          <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-tertiary mt-4" style={{ fontSize: 'var(--fs-xs)', textAlign: 'center' }}>
        Authentication will be handled by the backend. Any credentials sign in for this demo.
      </p>
    </AuthLayout>
  );
}
