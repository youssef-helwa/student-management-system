import { useState } from 'react';
import { AlertCircle, Bell, CalendarClock, Wallet, UserPlus, PhoneOff, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { useAsync } from '../../hooks/useAsync';
import * as notificationService from '../../services/notificationService';
import { EmptyState, LoadingState } from '../../components/common/States';
import { formatDateTime } from '../../utils/formatters';
import { canDeleteNotification } from '../../utils/permissions';

const TYPE_META = {
  absence: { icon: AlertCircle, tone: 'warning' },
  exam: { icon: CalendarClock, tone: 'info' },
  payment: { icon: Wallet, tone: 'danger' },
  new_student: { icon: UserPlus, tone: 'success' },
  phone_update: { icon: PhoneOff, tone: 'warning' },
};

const TONE_STYLE = {
  info: { bg: 'var(--info-100)', fg: 'var(--info-600)' },
  warning: { bg: 'var(--warning-100)', fg: 'var(--warning-600)' },
  danger: { bg: 'var(--danger-100)', fg: 'var(--danger-600)' },
  success: { bg: 'var(--success-100)', fg: 'var(--success-600)' },
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'absence', label: 'Absences' },
  { value: 'exam', label: 'Exams' },
  { value: 'payment', label: 'Payments' },
  { value: 'new_student', label: 'New Students' },
  { value: 'phone_update', label: 'Phone Updates' },
];

export default function Notifications() {
  const { user } = useAuth();
  const { activeBranch } = useBranch();

  const [filter, setFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: notifications, loading } = useAsync(
  () =>
    notificationService.getAllNotifications({
      branchId: activeBranch?.id
    }),
  [refreshKey, activeBranch?.id]
);

const notificationList = Array.isArray(notifications)
  ? notifications
  : notifications?.data || [];

const rows = notificationList.filter(
  (n) => filter === 'all' || n.type === filter
);

const unreadCount = notificationList.filter(
  (n) => !n.read
).length;

async function handleOpen(n) {
  if (!n.read) {
    await notificationService.readNotification(n.id);
    setRefreshKey((k) => k + 1);
  }
}

async function handleDelete(n, e) {
  e.stopPropagation();

  await notificationService.deleteNotification(n.id);

  setRefreshKey((k) => k + 1);
}

  async function handleMarkAllRead() {
  await notificationService.readAllNotifications({
    branchId: activeBranch?.id
  });

  setRefreshKey((k) => k + 1);
}

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Repeated absences, upcoming exams, unpaid fees, and new students
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={handleMarkAllRead}>
              <CheckCheck size={16} /> Mark All as Read
            </button>
          </div>
        )}
      </div>

      <div className="pill-tabs mb-4">
        {FILTERS.map((f) => (
          <button key={f.value} className={`chip ${filter === f.value ? 'active' : ''}`} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 'var(--sp-8) 0' }}><LoadingState label="Loading notifications…" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" message="You're all caught up." />
        ) : (
          <ul>
            {rows.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.exam;
              const style = TONE_STYLE[meta.tone];
              return (
                <li
                  key={n.id}
                  className={`notif-item ${n.read ? '' : 'unread'}`}
                  style={{ padding: 'var(--sp-4)', cursor: 'pointer' }}
                  onClick={() => handleOpen(n)}
                  title={n.read ? '' : 'Click to mark as read'}
                >
                  <span className="notif-dot-icon" style={{ background: style.bg, color: style.fg, width: 36, height: 36 }}>
                    <meta.icon size={16} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: 700 }}>{n.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>{formatDateTime(n.createdAt)}</span>
                        {canDeleteNotification(user) && (
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Delete"
                            onClick={(e) => handleDelete(n, e)}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginTop: 2 }}>{n.message}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
