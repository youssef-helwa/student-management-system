import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import * as branchService from '../../services/branchService';
import DataTable from '../../components/common/DataTable';
import BranchDot from '../../components/common/BranchDot';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BranchForm from '../../components/branches/BranchForm';

export default function Branches() {
  const { branches, activeBranch, setActiveBranch, refreshBranches, loading } = useBranch();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  function openAdd() {
    setEditingBranch(null);
    setFormError('');
    setFormOpen(true);
  }
  function openEdit(branch) {
    setEditingBranch(branch);
    setFormError('');
    setFormOpen(true);
  }

  async function handleSave(payload) {
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, payload);
        await refreshBranches();
      } else {
        const wasEmpty = branches.length === 0;
        const created = await branchService.createBranch(payload);
        await refreshBranches();
        // First branch ever created: put the admin straight to work in it
        // instead of sending them back to a branch picker with one option.
        if (wasEmpty) setActiveBranch(created);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err?.message || 'Something went wrong. Please try again.');
    }
  }

  async function handleDelete() {
    try {
      await branchService.deleteBranch(deleteTarget.id);
      await refreshBranches();
      if (activeBranch?.id === deleteTarget.id) setActiveBranch(null);
      setDeleteTarget(null);
      setDeleteError('');
    } catch (err) {
      setDeleteError(err?.message || 'Could not delete this branch.');
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Branch',
      render: (b) => <BranchDot branch={b} />,
    },
    { key: 'code', header: 'Code', render: (b) => b.code || '—' },
    { key: 'address', header: 'Address', render: (b) => b.address || '—' },
    {
      key: 'actions',
      header: '',
      width: 160,
      render: (b) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(b)}>
            <Pencil size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="Delete"
            onClick={() => {
              setDeleteError('');
              setDeleteTarget(b);
            }}
          >
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
          <h1 className="page-title">Branches</h1>
          <p className="page-subtitle">
            {branches.length === 0
              ? "You haven't added any branches yet — add your first one to get started."
              : 'Manage the branches your center operates across.'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {!loading && branches.length > 0 && (
        <div className="card card-pad mb-4 flex items-center justify-between">
          <div>
            <div style={{ fontWeight: 700 }}>Ready to go</div>
            <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
              Head to the dashboard, or set up grades and classes for {activeBranch?.name || 'your branch'}.
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/app/dashboard')}>
            Go to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={branches}
        loading={loading}
        rowKey="id"
        emptyTitle="No branches yet"
        emptyMessage="Add a branch to start tracking students, attendance, and payments for it."
        onRowClick={(b) => setActiveBranch(b)}
      />

      <BranchForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialValue={editingBranch}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteError ? () => setDeleteTarget(null) : handleDelete}
        title="Delete branch"
        message={deleteError || `Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel={deleteError ? 'OK' : 'Delete'}
        danger={!deleteError}
      />
    </div>
  );
}
