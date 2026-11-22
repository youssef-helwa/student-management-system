import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Trash2, BellRing } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import * as followUpService from '../../services/followUpService';
import * as studentService from '../../services/studentService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnoozeDialog from '../../components/followUps/SnoozeDialog';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { canDeleteFollowUp } from '../../utils/permissions';

const TABS = [
  { value: 'due', label: 'Due' },
  { value: 'active', label: 'Active' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'completed', label: 'Completed' },
];

export default function FollowUps() {
  const { activeBranch } = useBranch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('due');
  const [snoozeTarget, setSnoozeTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: students } = useAsync(() => studentService.getStudents({ branchId: activeBranch?.id }), [activeBranch?.id]);
  const { data: followUps, loading } = useAsync(() =>
    followUpService.getFollowUps({
      branchId: activeBranch?.id,
      status: tab === 'due' ? undefined : tab,
      dueOnly: tab === 'due',
    }),
  [activeBranch?.id, tab, refreshKey]
);

const followUpList = Array.isArray(followUps)
  ? followUps
  : followUps?.data || [];

  const studentMap = Object.fromEntries((students || []).map((s) => [s.id, s]));

  async function handleComplete(f) {
    await followUpService.completeFollowUp(f.id, user);
    setRefreshKey((k) => k + 1);
  }

  async function handleSnoozeConfirm(date) {
    await followUpService.snoozeFollowUp(snoozeTarget.id, date, user);
    setSnoozeTarget(null);
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete() {
    await followUpService.deleteFollowUp(deleteTarget.id, user);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (f) => studentMap[f.studentId]?.fullName || f.studentId,
    },
    { key: 'note', header: 'Note' },
    {
      key: 'status',
      header: 'Status',
      render: (f) => {
        if (f.status === 'completed') return <Badge tone="success" dot>Completed</Badge>;
        if (f.status === 'snoozed') return <Badge tone="warning" dot>Snoozed until {formatDate(f.snoozedUntil)}</Badge>;
        return <Badge tone="info" dot>Active</Badge>;
      },
    },
    { key: 'createdAt', header: 'Created', render: (f) => formatDateTime(f.createdAt) },
    {
      key: 'actions',
      header: '',
      width: 140,
      render: (f) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {f.status !== 'completed' && (
            <>
              <button className="btn btn-ghost btn-icon btn-sm" title="Mark completed" onClick={() => handleComplete(f)}>
                <CheckCircle2 size={15} color="var(--success-600)" />
              </button>
              <button className="btn btn-ghost btn-icon btn-sm" title="Snooze" onClick={() => setSnoozeTarget(f)}>
                <Clock size={15} />
              </button>
            </>
          )}
          {canDeleteFollowUp(user) && (
            <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => setDeleteTarget(f)}>
              <Trash2 size={15} color="var(--danger-500)" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-Up Reminders</h1>
          <p className="page-subtitle">Staff reminders tied to students — call-backs, pending items, and notes for later.</p>
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={TABS} />

      <DataTable
        columns={columns}
        rows={followUpList}
        loading={loading}
        onRowClick={(f) => navigate(`/app/students/${f.studentId}`)}
        emptyTitle={tab === 'due' ? 'Nothing due' : `No ${tab} reminders`}
        emptyMessage={
          tab === 'due'
            ? "You're all caught up — no reminders need attention right now."
            : 'No reminders match this filter.'
        }
        toolbar={
          <div className="flex items-center gap-2 text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            <BellRing size={14} /> Add reminders for a specific student from their student profile page.
          </div>
        }
      />

      <SnoozeDialog open={!!snoozeTarget} onClose={() => setSnoozeTarget(null)} onConfirm={handleSnoozeConfirm} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete reminder"
        message="Are you sure you want to delete this follow-up reminder? This action cannot be undone."
      />
    </div>
  );
}
