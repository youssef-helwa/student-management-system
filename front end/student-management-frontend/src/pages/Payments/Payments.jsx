import { useMemo, useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import * as studentService from '../../services/studentService';
import * as gradeService from '../../services/gradeService';
import * as paymentService from '../../services/paymentService';
import GradeSelector from '../../components/dashboard/GradeSelector';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import StatCard from '../../components/common/StatCard';
import { PiggyBank, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { canViewFullHistory, scopeToToday } from '../../utils/dataScope';

const STATUS_TONE = { paid: 'success', partial: 'warning', overdue: 'danger', exempted: 'gold' };

export default function Payments() {
  const { activeBranch } = useBranch();
  const { user } = useAuth();
  const [gradeId, setGradeId] = useState('all');
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingFeeGradeId, setEditingFeeGradeId] = useState(null);
  const [feeDraft, setFeeDraft] = useState('');

  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: allStudents } = useAsync(
    () => studentService.getStudents({ branchId: activeBranch?.id }),
    [activeBranch?.id]
  );
  const { data: students, loading } = useAsync(
    () => studentService.getStudents({ branchId: activeBranch?.id, gradeId }),
    [activeBranch?.id, gradeId]
  );
  const { data: payments } = useAsync(() => paymentService.getPayments(), []);
  const { data: gradeFees } = useAsync(
  () => {
    if (!activeBranch?.id) return Promise.resolve([]);
    return gradeService.getGradeFees({ branchId: activeBranch.id });
  },
  [activeBranch?.id, refreshKey]
);

  const feeByGrade = useMemo(() => {
  const map = {};

  (gradeFees || []).forEach((f) => {
    map[f.id] = Number(f.sessionFee) || 0;
  });

  return map;
}, [gradeFees]);

  const rows = useMemo(() => {
    if (!students || !payments) return [];
    return students.map((s) => {
      const p = payments.find((pm) => pm.studentId === s.id);
      return { id: s.id, student: s, payment: p };
    });
  }, [students, payments]);

  // Standard Session Fee / Expected Income / Amount Collected / Remaining
  // Unpaid Amount (spec: Payments §2). Uses every student in scope (not
  // just the current page of the table) and each student's own grade fee,
  // so it stays correct whether "All Grades" or a single grade is selected.
  const summary = useMemo(() => {
    const scope = (gradeId === 'all' ? allStudents : students) || [];
    let expectedIncome = 0;
    let amountCollected = 0;
    let remainingUnpaid = 0;
    scope.forEach((s) => {
      if (s.feeExempted) return;
      const fee = feeByGrade[s.gradeId] ?? 0;
      expectedIncome += fee;
      const p = payments?.find((pm) => pm.studentId === s.id);
      amountCollected += p?.paidAmount ?? 0;
      remainingUnpaid += p?.remainingBalance ?? 0;
    });
    const standardFee = gradeId !== 'all' ? feeByGrade[gradeId] ?? 0 : null;
    return { expectedIncome, amountCollected, remainingUnpaid, standardFee };
  }, [gradeId, allStudents, students, payments, feeByGrade]);

  function startEditFee(g) {
    setEditingFeeGradeId(g.id);
    setFeeDraft(String(feeByGrade[g.id] ?? 0));
  }

  async function saveFee(g) {
  const value = Number(feeDraft);

  if (Number.isNaN(value) || value < 0) return;

  await gradeService.updateGradeFee(g.id, {
    sessionFee: value,
  });

  setEditingFeeGradeId(null);
  setRefreshKey((k) => k + 1);
}

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.student.fullName} size={30} />
          <span style={{ fontWeight: 600 }}>{r.student.fullName}</span>
        </div>
      ),
    },
    { key: 'totalFee', header: 'Total Fee', render: (r) => (r.payment?.status === 'exempted' ? '—' : formatCurrency(r.payment?.totalFee)) },
    { key: 'paidAmount', header: 'Paid Amount', render: (r) => (r.payment?.status === 'exempted' ? '—' : formatCurrency(r.payment?.paidAmount)) },
    { key: 'remaining', header: 'Remaining Balance', render: (r) => (r.payment?.status === 'exempted' ? '—' : formatCurrency(r.payment?.remainingBalance)) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={STATUS_TONE[r.payment?.status] || 'neutral'} dot>{r.payment?.status === 'exempted' ? 'Exempted' : r.payment?.status}</Badge>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Fee tracking for {activeBranch?.name}</p>
        </div>
      </div>
      <div className="mb-4">
        <GradeSelector grades={grades || []} value={gradeId} onChange={setGradeId} />
      </div>

      <div className="stat-grid mb-4">
        <StatCard
          icon={Banknote}
          label="Standard Session Fee"
          value={gradeId === 'all' ? 'Varies by grade' : formatCurrency(summary.standardFee)}
          tone="brand"
        />
        <StatCard icon={Wallet} label="Expected Income" value={formatCurrency(summary.expectedIncome)} tone="info" />
        <StatCard icon={PiggyBank} label="Amount Collected" value={formatCurrency(summary.amountCollected)} tone="success" />
        <StatCard icon={ShieldCheck} label="Remaining Unpaid Amount" value={formatCurrency(summary.remainingUnpaid)} tone="danger" />
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Standard Session Fee by Grade</span>
        </div>
        <div className="card-body">
          <div className="grid-3">
            {(grades || []).map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between"
                style={{ padding: 'var(--sp-3) var(--sp-4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 600 }}>{g.name}</span>
                {editingFeeGradeId === g.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="input"
                      type="number"
                      min="0"
                      style={{ width: 90 }}
                      value={feeDraft}
                      onChange={(e) => setFeeDraft(e.target.value)}
                      autoFocus
                    />
                    <button className="btn btn-primary btn-sm btn-icon" onClick={() => saveFee(g)} aria-label="Save">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => startEditFee(g)}>
                    {formatCurrency(feeByGrade[g.id] ?? 0)} <Pencil size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} onRowClick={(r) => setSelected(r)} emptyTitle="No payment records" />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.student.fullName} size="sm">
        {selected?.payment?.status === 'exempted' ? (
          <div className="flex justify-between items-center">
            <span className="text-secondary">Fee Status</span>
            <Badge tone="gold">Exempted</Badge>
          </div>
        ) : (
          <>
            <div className="grid-2 mb-4">
              <SummaryField label="Total Fee" value={formatCurrency(selected?.payment?.totalFee)} />
              <SummaryField label="Paid Amount" value={formatCurrency(selected?.payment?.paidAmount)} />
              <SummaryField label="Remaining Balance" value={formatCurrency(selected?.payment?.remainingBalance)} />
              <SummaryField label="Status" value={<Badge tone={STATUS_TONE[selected?.payment?.status]}>{selected?.payment?.status}</Badge>} />
            </div>
            <div className="card-title mb-2" style={{ fontSize: 'var(--fs-sm)' }}>Payment History</div>
            {!canViewFullHistory(user) && (
              <p className="text-secondary mb-2" style={{ fontSize: 'var(--fs-xs)' }}>
                Showing today's entries only. Ask a Manager or Administrator for full history.
              </p>
            )}
            {(() => {
              const visibleHistory = scopeToToday(selected?.payment?.history, 'date', user) || [];
              return visibleHistory.length === 0 ? (
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>No payments recorded yet.</p>
              ) : (
                <ul className="flex-col gap-2" style={{ display: 'flex' }}>
                  {visibleHistory.map((h, i) => (
                    <li key={i} className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-secondary">{formatDate(h.date)} · {h.method}</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(h.amount)}</span>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </>
        )}
      </Modal>
    </div>
  );
}

function SummaryField({ label, value }) {
  return (
    <div>
      <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}
