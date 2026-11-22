import Modal from '../common/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export default function EmailPreviewModal({ open, onClose, report, onSend, sending, canSend }) {
  if (!report) return null;

const paymentMethodBreakdown = report.paymentMethodBreakdown || {};
const studentFeeSummary = report.studentFeeSummary || {};
const expenseSummary = report.expenseSummary || { items: [] };
const financialSummary = report.financialSummary || {};
const incomeSummary = report.incomeSummary || {};
const attendanceSummary = report.attendanceSummary || {};

  const subject = `Daily Financial Report – ${report.branchName} – ${formatDate(report.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Email Preview"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {canSend && (
            <button className="btn btn-primary" onClick={onSend} disabled={sending}>
              {sending ? 'Sending…' : 'Send to Owner & Managers'}
            </button>
          )}
        </>
      }
    >
      <div className="field mb-4">
        <label className="field-label">Subject</label>
        <div className="input" style={{ background: 'var(--bg-hover)' }}>{subject}</div>
      </div>
      <div className="field mb-4">
        <label className="field-label">Recipients</label>
        <div className="input" style={{ background: 'var(--bg-hover)' }}>Center Owner, Branch Managers</div>
      </div>

      <div
        className="card card-pad"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <h3 style={{ marginBottom: 4 }}>Daily Financial Report</h3>
        <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 16 }}>
          {report.branchName} · {formatDate(report.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="grid-2 mb-4">
          <EmailStat label="Total Payments Collected" value={formatCurrency(report.financialSummary.totalIncome)} />
          <EmailStat label="Total Expenses" value={formatCurrency(report.financialSummary.approvedExpenses)} />
          <EmailStat label="Net Total (Payments − Expenses)" value={formatCurrency(report.financialSummary.netCash)} />
          <EmailStat label="Payment Transactions" value={report.incomeSummary.transactionCount} />
          <EmailStat label="Total Students Attended" value={report.attendanceSummary.totalStudentsAttended} />
          <EmailStat label="Fee-Exempted Students Attended" value={report.attendanceSummary.totalFeeExemptedAttended} />
        </div>

        <h4 style={{ fontSize: 'var(--fs-sm)', marginBottom: 8 }}>Student Fee Summary</h4>
        <ul style={{ marginBottom: 16 }}>
          <li style={{ fontSize: 'var(--fs-sm)' }}>Full Fee: <strong>{report.studentFeeSummary.fullFee || 0}</strong></li>
          <li style={{ fontSize: 'var(--fs-sm)' }}>Half Fee: <strong>{report.studentFeeSummary.halfFee || 0}</strong></li>
          <li style={{ fontSize: 'var(--fs-sm)' }}>Exempted: <strong>{report.studentFeeSummary.exempted || 0}</strong></li>
        </ul>

        <h4 style={{ fontSize: 'var(--fs-sm)', marginBottom: 8 }}>Payment Method Breakdown</h4>
        <ul style={{ marginBottom: 16 }}>
          {Object.entries(paymentMethodBreakdown).length === 0 && (
            <li className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>No payments recorded.</li>
          )}
          {Object.entries(paymentMethodBreakdown).map(([method, amount]) => (
            <li key={method} style={{ fontSize: 'var(--fs-sm)' }}>
              {method}: <strong>{formatCurrency(amount)}</strong>
            </li>
          ))}
        </ul>

        <h4 style={{ fontSize: 'var(--fs-sm)', marginBottom: 8 }}>Expense Details</h4>
        {expenseSummary.items.length === 0 ? (
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>No expenses recorded.</p>
        ) : (
          <ul style={{ marginBottom: 16 }}>
            {report.expenseSummary.items.map((item) => (
              <li key={item.id} style={{ fontSize: 'var(--fs-sm)', marginBottom: 4 }}>
                {item.category} — {item.description}: <strong>{formatCurrency(item.amount)}</strong>{' '}
                <span className="text-tertiary">({item.status})</span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>
          Report generated {formatDateTime(report.generatedTime)} by {report.generatedBy}.
        </p>
      </div>
    </Modal>
  );
}

function EmailStat({ label, value }) {
  return (
    <div>
      <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}
