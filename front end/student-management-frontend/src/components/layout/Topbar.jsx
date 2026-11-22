import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Moon, Sun, LogOut, Settings, UserCircle, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { useTheme } from '../../context/ThemeContext';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useAsync } from '../../hooks/useAsync';
import * as notificationService from '../../services/notificationService';
import Avatar from '../common/Avatar';
import BranchDot from '../common/BranchDot';
import { formatDateTime } from '../../utils/formatters';

const SEVERITY_ICON_STYLE = {
  info: { bg: 'var(--info-100)', fg: 'var(--info-600)' },
  warning: { bg: 'var(--warning-100)', fg: 'var(--warning-600)' },
  danger: { bg: 'var(--danger-100)', fg: 'var(--danger-600)' },
  success: { bg: 'var(--success-100)', fg: 'var(--success-600)' },
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { activeBranch, accessibleBranches, setActiveBranch } = useBranch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [branchOpen, setBranchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const branchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  useOnClickOutside(branchRef, () => setBranchOpen(false));
  useOnClickOutside(notifRef, () => setNotifOpen(false));
  useOnClickOutside(userRef, () => setUserOpen(false));

  const { data: notifications } = useAsync(() => notificationService.getAllNotifications(), [notifOpen]);
  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const canSwitchBranch = accessibleBranches.length > 1;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="dropdown-anchor" ref={branchRef}>
        <button
          className="btn btn-secondary"
          onClick={() => canSwitchBranch && setBranchOpen((o) => !o)}
          style={{ cursor: canSwitchBranch ? 'pointer' : 'default' }}
        >
          <BranchDot branch={activeBranch} />
          {canSwitchBranch && <ChevronDown size={14} />}
        </button>
        {branchOpen && (
          <div className="dropdown-panel">
            <div className="dropdown-header">Switch branch</div>
            {accessibleBranches.map((branch) => (
              <button
                key={branch.id}
                className="dropdown-item"
                onClick={() => {
                  setActiveBranch(branch);
                  setBranchOpen(false);
                }}
              >
                <BranchDot branch={branch} />
                {activeBranch?.id === branch.id && <Check size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <div className="dropdown-anchor" ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
            <Bell size={17} />
            {unreadCount > 0 && <span className="icon-btn-dot" />}
          </button>
          {notifOpen && (
            <div className="dropdown-panel dropdown-panel-lg">
              <div className="dropdown-header">Notifications</div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {(notifications || []).slice(0, 5).map((n) => {
                  const style = SEVERITY_ICON_STYLE[n.severity] || SEVERITY_ICON_STYLE.info;
                  return (
                    <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                      <span className="notif-dot-icon" style={{ background: style.bg, color: style.fg }}>
                        <AlertCircle size={14} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{n.title}</div>
                        <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>
                          {n.message}
                        </div>
                        <div className="text-tertiary" style={{ fontSize: 'var(--fs-xs)', marginTop: 2 }}>
                          {formatDateTime(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="dropdown-item"
                style={{ justifyContent: 'center', fontWeight: 600, color: 'var(--brand-700)' }}
                onClick={() => {
                  setNotifOpen(false);
                  navigate('/app/notifications');
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="dropdown-anchor" ref={userRef}>
          <button className="flex items-center gap-2" onClick={() => setUserOpen((o) => !o)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Avatar name={user?.fullName} size={32} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{user?.fullName}</div>
              <div className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>
                {user?.role}
              </div>
            </div>
            <ChevronDown size={14} className="text-tertiary" />
          </button>
          {userOpen && (
            <div className="dropdown-panel">
              <button className="dropdown-item" onClick={() => { setUserOpen(false); navigate('/app/settings'); }}>
                <UserCircle size={16} /> Profile
              </button>
              <button className="dropdown-item" onClick={() => { setUserOpen(false); navigate('/app/settings'); }}>
                <Settings size={16} /> Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" style={{ color: 'var(--danger-600)' }} onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
