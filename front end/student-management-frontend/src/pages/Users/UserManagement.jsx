import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as userService from '../../services/userService';
import * as branchService from '../../services/branchService';
import DataTable from '../../components/common/DataTable';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserForm from '../../components/users/UserForm';
import PermissionMatrix from '../../components/users/PermissionMatrix';
import { formatDateTime } from '../../utils/formatters';

export default function UserManagement() {
  const [tab, setTab] = useState('users');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: users, loading } = useAsync(() => userService.getUsers(), [refreshKey]);
  const { data: branches } = useAsync(() => branchService.getBranches(), []);
  const { data: matrix } = useAsync(
  async () => {
    const response = await userService.getPermissionMatrix();
    console.log("PERMISSION MATRIX RESPONSE:", response);
    return response.data;
  },
  []
);
  async function handleSave(payload) {
    if (editing) {
      await userService.updateUser(editing.id, payload);
    } else {
      await userService.createUser(payload);
    }
    setFormOpen(false);
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete() {
    await userService.deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }

  const branchMap = Object.fromEntries((branches || []).map((b) => [b.id, b.name]));

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.fullName} size={32} />
          <div>
            <div style={{ fontWeight: 600 }}>{u.fullName}</div>
            <div className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <Badge tone="neutral">{u.role}</Badge> },
    {
      key: 'branches',
      header: 'Allowed Branches',
      render: (u) => (u.role === 'Administrator' ? 'All branches' : (u.allowedBranches || []).map((b) => branchMap[b]).join(', ') || '—'),
    },
    { key: 'status', header: 'Status', render: (u) => <Badge tone={u.status === 'active' ? 'success' : 'neutral'} dot>{u.status}</Badge> },
    { key: 'lastLogin', header: 'Last Login', render: (u) => formatDateTime(u.lastLogin) },
    {
      key: 'actions',
      header: '',
      width: 100,
      render: (u) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(u); setFormOpen(true); }}>
            <Pencil size={15} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(u)}>
            <Trash2 size={15} color="var(--danger-500)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage staff accounts, roles, and permissions</p>
        </div>
        {tab === 'users' && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> Add User
            </button>
          </div>
        )}
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'users', label: 'Users' }, { value: 'permissions', label: 'Permissions' }]} />

      {tab === 'users' ? (
        <DataTable columns={columns} rows={users || []} loading={loading} emptyTitle="No users yet" />
      ) : (
        matrix && <PermissionMatrix matrix={matrix} />
      )}

      <UserForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} branches={branches || []} initialValue={editing} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={`Remove ${deleteTarget?.fullName} from the system?`}
      />
    </div>
  );
}
