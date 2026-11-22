import { DatabaseBackup, DatabaseZap, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Profile, appearance, and application preferences</p>
        </div>
      </div>

      <div className="card card-pad mb-4">
        <span className="card-title">User Profile</span>
        <div className="flex items-center gap-4 mt-4">
          <Avatar name={user?.fullName} size={64} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>{user?.fullName}</div>
            <div className="text-secondary">{user?.email}</div>
            <div className="mt-2"><Badge tone="neutral">{user?.role}</Badge></div>
          </div>
        </div>
        <div className="grid-2 mt-4">
          <div className="field">
            <label className="field-label">Full Name</label>
            <input className="input" defaultValue={user?.fullName} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" defaultValue={user?.email} />
          </div>
        </div>
        <button className="btn btn-primary mt-4">Save Profile</button>
      </div>

      <div className="card card-pad mb-4">
        <span className="card-title">Appearance</span>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            <div>
              <div style={{ fontWeight: 600 }}>Dark Mode</div>
              <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Switch between light and dark themes.</div>
            </div>
          </div>
          <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </div>

      <div className="card card-pad mb-4">
        <span className="card-title">Data</span>
        <p className="text-secondary mt-1" style={{ fontSize: 'var(--fs-sm)' }}>
          Backup and restore will be implemented against your Node.js backend.
        </p>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-secondary">
            <DatabaseBackup size={16} /> Backup Now
          </button>
          <button className="btn btn-secondary">
            <DatabaseZap size={16} /> Restore from Backup
          </button>
        </div>
      </div>

      <div className="card card-pad">
        <span className="card-title">Application Settings</span>
        <div className="grid-2 mt-4">
          <div className="field">
            <label className="field-label">Language</label>
            <select className="select" defaultValue="en">
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Date Format</label>
            <select className="select" defaultValue="dmy">
              <option value="dmy">DD/MM/YYYY</option>
              <option value="mdy">MM/DD/YYYY</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      style={{
        width: 44,
        height: 24,
        borderRadius: 'var(--radius-full)',
        border: 'none',
        background: checked ? 'var(--brand-700)' : 'var(--gray-300)',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background var(--transition-fast)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left var(--transition-fast)',
        }}
      />
    </button>
  );
}
