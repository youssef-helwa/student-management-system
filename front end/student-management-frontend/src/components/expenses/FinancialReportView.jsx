import DataTable from '../common/DataTable';
import Badge from '../common/Badge';
import StatCard from '../common/StatCard';
import { Wallet, PiggyBank, TrendingUp, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';

const STATUS_TONE = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };

export default function FinancialReportView({ report }) {
  if (!report) return null;

  const { incomeSummary, expenseSummary, financialSummary, paymentMethodBreakdown, dailyActivitySummary, attendanceSummary, studentFeeSummary } = report;

  const expenseColumns = [
    { key: 'category', header: 'Category' },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'createdBy', header: 'Created By' },
    { key: 'time', header: 'Time', render: (r) => formatDateTime(r.time) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]} dot>{r.status}</Badge> },
  ];

  const methodEntries = Object.entries(paymentMethodBreakdown || {});

  return (
    <div>
      <div className="card card-pad mb-4">
        <div className="grid-3">
          <SummaryField label="Date" value={formatDate(report.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
          <SummaryField label="Branch" value={report.branchName} />
          <SummaryField label="Generated" value={`${formatDateTime(report.generatedTime)} · by ${report.generatedBy}`} />
        </div>
      </div>

      <div className="stat-grid mb-4">
        <StatCard icon={PiggyBank} label="Total Payments Collected" value={formatCurrency(financialSummary.totalIncome)} tone="success" />
        <StatCard icon={Wallet} label="Total Expenses" value={formatCurrency(financialSummary.approvedExpenses)} tone="danger" />
        <StatCard icon={TrendingUp} label="Net Total (Payments − Expenses)" value={formatCurrency(financialSummary.netCash)} tone="gold" />
        <StatCard icon={UserCheck} label="Total Students Attended" value={attendanceSummary.totalStudentsAttended} tone="brand" />
        <StatCard icon={ShieldCheck} label="Fee-Exempted Students Attended" value={attendanceSummary.totalFeeExemptedAttended} tone="brand" />
        <StatCard icon={Users} label="Students Who Paid" value={incomeSummary.studentsWhoPaid} tone="brand" />
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title">Income Summary</span></div>
        <div className="card-body">
          <div className="grid-3">
            <SummaryField label="Payment Transactions" value={incomeSummary.transactionCount} />
            <SummaryField label="Students Who Paid" value={incomeSummary.studentsWhoPaid} />
            <SummaryField label="Total Income" value={formatCurrency(incomeSummary.totalIncome)} />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title">Payment Method Breakdown</span></div>
        <div className="card-body">
          {methodEntries.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>No payments recorded for this day.</p>
          ) : (
            <ul className="flex-col gap-2" style={{ display: 'flex' }}>
              {methodEntries.map(([method, amount]) => (
                <li key={method} className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-secondary">{method}</span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Expense Summary</span>
          <span style={{ fontWeight: 700 }}>{formatCurrency(expenseSummary.totalExpenses)}</span>
        </div>
        <DataTable
          columns={expenseColumns}
          rows={expenseSummary.items}
          rowKey="id"
          pageSize={6}
          emptyTitle="No expenses recorded"
          emptyMessage="No expenses were logged for this day."
        />
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title">Financial Summary</span></div>
        <div className="card-body">
          <div className="grid-3">
            <SummaryField label="Total Payments Collected" value={formatCurrency(financialSummary.totalIncome)} />
            <SummaryField label="Total Expenses" value={formatCurrency(financialSummary.approvedExpenses)} />
            <SummaryField label="Net Total (Payments − Expenses)" value={formatCurrency(financialSummary.netCash)} />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title">Attendance Summary</span></div>
        <div className="card-body">
          <div className="grid-3">
            <SummaryField label="Total Students Attended" value={attendanceSummary.totalStudentsAttended} />
            <SummaryField label="Fee-Exempted Students Attended" value={attendanceSummary.totalFeeExemptedAttended} />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title">Student Fee Summary</span></div>
        <div className="card-body">
          <div className="grid-3">
            <SummaryField label="Full Fee Students" value={studentFeeSummary.fullFee} />
            <SummaryField label="Half Fee Students" value={studentFeeSummary.halfFee} />
            <SummaryField label="Exempted Students" value={studentFeeSummary.exempted} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Daily Activity Summary</span></div>
        <div className="card-body">
          <div className="grid-3">
            <SummaryField label="Total Students Paid" value={dailyActivitySummary.totalStudentsPaid} />
            <SummaryField label="Total Payment Transactions" value={dailyActivitySummary.totalPaymentTransactions} />
            <SummaryField label="Total Expenses Logged" value={dailyActivitySummary.totalExpenses} />
            <SummaryField label="Approved Expenses" value={dailyActivitySummary.approvedExpenseCount} />
            <SummaryField label="Rejected Expenses" value={dailyActivitySummary.rejectedExpenseCount} />
            <SummaryField label="Total Students Attended" value={dailyActivitySummary.totalStudentsAttended} />
            <SummaryField label="Fee-Exempted Students Attended" value={dailyActivitySummary.totalFeeExemptedAttended} />
          </div>
        </div>
      </div>
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
