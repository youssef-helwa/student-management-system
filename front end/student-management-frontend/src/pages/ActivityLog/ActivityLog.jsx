import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as activityLogService from '../../services/activityLogService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import { formatDateTime } from '../../utils/formatters';

const ACTION_TONE = {
  login: 'success',
  logout: 'neutral',
  student_added: 'success',
  student_updated: 'info',
  student_deleted: 'danger',
  attendance_recorded: 'info',
  payment_updated: 'gold',
  exam_updated: 'info',
  expense_created: 'info',
  expense_edited: 'info',
  expense_deleted: 'danger',
  expense_approved: 'success',
  expense_rejected: 'danger',
  daily_report_generated: 'gold',
  daily_report_sent: 'gold',
  'create-user': 'success',
};

export default function ActivityLog() {
  const [search, setSearch] = useState('');

  const { data: response, loading } = useAsync(
    () => activityLogService.getAllLogs(),
    []
  );

  // Backend response -> Frontend format
  const log = Array.isArray(response)
    ? response.map((entry) => ({
        ...entry,
        timestamp: entry.createdAt,
        actor: entry.user?.fullName || 'System',
        action: entry.action || '',
        detail: entry.detail || '',
      }))
    : [];

  const rows = log.filter((entry) => {
    if (!search) return true;

    const q = search.toLowerCase();

    return (
      entry.actor.toLowerCase().includes(q) ||
      entry.detail.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (r) => formatDateTime(r.timestamp),
    },

    {
      key: 'actor',
      header: 'Staff Member',
      render: (r) => r.actor || 'System',
    },

    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <Badge tone={ACTION_TONE[r.action] || 'neutral'}>
          {(r.action || 'unknown').replaceAll('_', ' ')}
        </Badge>
      ),
    },

    {
      key: 'detail',
      header: 'Detail',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">
            A record of actions taken across the system
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        pageSize={10}
        toolbar={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by staff member or action…"
          />
        }
        emptyTitle="No activity yet"
      />
    </div>
  );
}