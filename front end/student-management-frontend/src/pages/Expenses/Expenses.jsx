import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import * as expenseService from '../../services/expenseService';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { canAddExpense, canDeleteExpense, canEditExpense, canViewAllExpenses } from '../../utils/permissions';

export default function Expenses() {
  const { activeBranch } = useBranch();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const seeAll = canViewAllExpenses(user);

  const { data: expenses, loading } = useAsync(
    () =>
      expenseService.getExpenses({
        branchId: activeBranch?.id,
        category: categoryFilter || undefined,
        createdById: seeAll ? undefined : user?.id,
        search,
      }),
    [activeBranch?.id, categoryFilter, search, seeAll, user?.id, refreshKey]
  );

  function openAdd() {
    setEditingExpense(null);
    setFormOpen(true);
  }
  function openEdit(expense, e) {
    e.stopPropagation();
    setEditingExpense(expense);
    setFormOpen(true);
  }
  async function handleSave(payload) {
    if (editingExpense) {
      await expenseService.updateExpense(editingExpense.id, payload, user);
    } else {
      await expenseService.createExpense({ ...payload, branchId: activeBranch?.id }, user);
    }
    setFormOpen(false);
    setRefreshKey((k) => k + 1);
  }
  async function handleDelete() {
    await expenseService.deleteExpense(deleteTarget.id, user);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }

  const total = (expenses || []).reduce((sum, e) => sum + e.amount, 0);

  const columns = [
    { key: 'createdAt', header: 'Date & Time', render: (r) => formatDateTime(r.createdAt) },
    { key: 'category', header: 'Category' },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'paymentMethod', header: 'Payment Method' },
    {key: 'createdBy',header: 'Created By',render: (r) => r.creator?.fullName || '—'},
    {
      key: 'actions',
      header: '',
      width: 100,
      render: (r) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {canEditExpense(user) && (
            <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={(e) => openEdit(r, e)}>
              <Pencil size={15} />
            </button>
          )}
          {canDeleteExpense(user) && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
            >
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
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            {seeAll ? `Business expenses for ${activeBranch?.name}` : 'Expenses you have recorded'}
            {' · '}
            {formatCurrency(total)} total
          </p>
        </div>
        {canAddExpense(user) && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={expenses || []}
        loading={loading}
        emptyTitle="No expenses found"
        emptyMessage="Try adjusting your filters, or record a new expense."
        toolbar={
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search by description or category…" />
            <select className="select" style={{ width: 170 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      />

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialValue={editingExpense}
        branchName={activeBranch?.name}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete expense"
        message={`Are you sure you want to delete "${deleteTarget?.description}"? This action cannot be undone.`}
      />
    </div>
  );
}
