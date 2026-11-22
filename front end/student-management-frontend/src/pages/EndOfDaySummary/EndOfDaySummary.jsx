import { useState } from 'react';
import { Users, UserX, PiggyBank, Wallet, ShieldCheck, FileText, Mail, Send, UserCheck, UserMinus } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import * as reportService from '../../services/reportService';
import * as financialService from '../../services/financialService';
import StatCard from '../../components/common/StatCard';
import Tabs from '../../components/common/Tabs';
import { LoadingState } from '../../components/common/States';
import FinancialReportView from '../../components/expenses/FinancialReportView';
import EmailPreviewModal from '../../components/expenses/EmailPreviewModal';
import { formatCurrency } from '../../utils/formatters';
import { canSendReportsManually } from '../../utils/permissions';

export default function EndOfDaySummary() {
  const { activeBranch } = useBranch();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [emailOpen, setEmailOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const { data: summary, loading } = useAsync(
    () => reportService.getEndOfDaySummary({ branchId: activeBranch?.id }),
    [activeBranch?.id]
  );
  const { data: report, loading: reportLoading } = useAsync(
    () => financialService.getFinancialReport({ branchId: activeBranch?.id, generatedBy: user?.fullName }),
    [activeBranch?.id]
  );

  async function handleSend() {
    setSending(true);
    await financialService.sendDailyReport({ branchId: activeBranch?.id, actor: user });
    setSending(false);
    setSentNotice(true);
    setEmailOpen(false);
  }

  if (loading || !summary) return <LoadingState label="Building today's summary…" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">End-of-Day Summary</h1>
          <p className="page-subtitle">{activeBranch?.name} · {new Date(summary.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        {tab === 'financial' && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => setEmailOpen(true)} disabled={!report}>
              <Mail size={16} /> Preview Email
            </button>
            {canSendReportsManually(user) && (
              <button className="btn btn-primary" onClick={() => setEmailOpen(true)} disabled={!report}>
                <Send size={16} /> Send Report
              </button>
            )}
          </div>
        )}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: 'Academic Overview' },
          { value: 'financial', label: 'Financial Report' },
        ]}
      />

      {sentNotice && tab === 'financial' && (
        <div className="card card-pad mb-4" style={{ borderColor: 'var(--success-500)' }}>
          <p style={{ fontSize: 'var(--fs-sm)' }}>
            The Daily Financial Report was sent to the center owner and managers.
          </p>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="stat-grid">
            <StatCard icon={Users} label="Total Students Attended" value={summary.totalAttended} tone="success" />
            <StatCard icon={UserX} label="Total Absent Students" value={summary.totalAbsent} tone="danger" />
            <StatCard icon={PiggyBank} label="Total Collected Money" value={formatCurrency(summary.totalCollected)} tone="gold" />
            <StatCard icon={Wallet} label="Total Expected Money" value={formatCurrency(summary.totalExpected)} tone="brand" />
            <StatCard icon={Wallet} label="Remaining Balance" value={formatCurrency(summary.remainingBalance)} tone="danger" />
            <StatCard icon={UserCheck} label="Students Paid" value={summary.paidStudents} tone="success" />
            <StatCard icon={UserMinus} label="Unpaid Students" value={summary.unpaidStudents} tone="danger" />
            <StatCard icon={ShieldCheck} label="Fee-Exempt Students" value={summary.exemptedStudents} tone="brand" />
            <StatCard icon={FileText} label="Exams Conducted" value={summary.examsConducted} tone="info" />
          </div>

          <div className="card card-pad">
            <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
              This report is generated as a UI preview only. Your backend will handle scheduling and emailing this
              summary automatically at the end of each day.
            </p>
          </div>
        </>
      )}

      {tab === 'financial' && (
        reportLoading || !report ? (
          <LoadingState label="Building today's financial report…" />
        ) : (
          <>
            <FinancialReportView report={report} />
            <div className="card card-pad mt-4">
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                This report is normally emailed automatically at the configured end-of-day time (e.g. 11:59 PM).
                Your backend will own that schedule — the button above triggers the same email manually for review.
              </p>
            </div>
          </>
        )
      )}

      <EmailPreviewModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        report={report}
        onSend={handleSend}
        sending={sending}
        canSend={canSendReportsManually(user)}
      />
    </div>
  );
}
