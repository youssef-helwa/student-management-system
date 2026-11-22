import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  FileText,
  Award,
  Wallet,
  Receipt,
  BarChart3,
  Bell,
  UserCog,
  Settings,
  History,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  CalendarCheck2,
  Layers,
  BellRing,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/branches', label: 'Branches', icon: Building2, roles: [ROLES.ADMIN] },
  { to: '/app/students', label: 'Students', icon: Users },
  { to: '/app/grades-classes', label: 'Grades & Classes', icon: Layers, roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/app/attendance', label: 'Attendance', icon: ScanLine },
  { to: '/app/exams', label: 'Exams', icon: FileText },
  { to: '/app/results', label: 'Results', icon: Award },
  { to: '/app/payments', label: 'Payments', icon: Wallet },
  { to: '/app/expenses', label: 'Expenses', icon: Receipt },
  { to: '/app/reports', label: 'Reports', icon: BarChart3, roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/app/end-of-day', label: 'End-of-Day Summary', icon: CalendarCheck2, roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/follow-ups', label: 'Follow-Ups', icon: BellRing },
  { to: '/app/users', label: 'User Management', icon: UserCog, roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/app/activity-log', label: 'Activity Log', icon: History, roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
        background: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width var(--transition-base)',
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ padding: '18px 20px', height: 'var(--topbar-h)', color: '#fff' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gold-500)',
            color: 'var(--gray-900)',
            flexShrink: 0,
          }}
        >
          <GraduationCap size={18} />
        </div>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-md)' }}>
            EduCenter
          </span>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        <ul className="flex-col gap-1" style={{ display: 'flex' }}>
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                title={item.label}
                className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-item-active)' : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 'var(--fs-base)',
                  transition: 'background var(--transition-fast)',
                  borderLeft: isActive ? '3px solid var(--gold-500)' : '3px solid transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                })}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        className="flex items-center gap-2"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          margin: 12,
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--sidebar-text)',
          cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        {!collapsed && <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>Collapse</span>}
      </button>
    </aside>
  );
}
