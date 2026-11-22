import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, PhoneCall, AlertTriangle, Printer, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';
import { printStudentQrCode } from '../../utils/printQrCode';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import * as studentService from '../../services/studentService';
import * as gradeService from '../../services/gradeService';
import * as classService from '../../services/classService'
import * as attendanceService from '../../services/attendanceService';
import * as examService from '../../services/examService';
import * as paymentService from '../../services/paymentService';
import * as callHistoryService from '../../services/callHistoryService';
import * as followUpService from '../../services/followUpService';
import { CALL_RESULT_LABELS } from '../../utils/constants';
import { canViewFullHistory, scopeToToday } from '../../utils/dataScope';
import { canDeleteFollowUp } from '../../utils/permissions';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import DataTable from '../../components/common/DataTable';
import QrCodeTile from '../../components/students/QrCodeTile';
import CallParentDialog from '../../components/attendance/CallParentDialog';
import StudentForm from '../../components/students/StudentForm';
import FollowUpForm from '../../components/followUps/FollowUpForm';
import SnoozeDialog from '../../components/followUps/SnoozeDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { LoadingState } from '../../components/common/States';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('attendance');
  const [callOpen, setCallOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [followUpFormOpen, setFollowUpFormOpen] = useState(false);
  const [snoozeTarget, setSnoozeTarget] = useState(null);
  const [deleteFollowUpTarget, setDeleteFollowUpTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: student, loading } = useAsync(() => studentService.getStudentById(id), [id, refreshKey]);
  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: classes } = useAsync(() => classService.getClasses({ branchId: student?.branchId }), [student?.branchId]);
  const { data: attendance } = useAsync(() => attendanceService.getAttendanceRecords({ studentId: id }), [id, refreshKey]);
  const { data: results } = useAsync(() => examService.getStudentResults(id), [id]);
  const { data: exams } = useAsync(() => examService.getExams(), []);
  const { data: payment } = useAsync(() => paymentService.getPaymentByStudent(id), [id]);
  const { data: callHistory } = useAsync(() => callHistoryService.getCallHistoryByStudent(id), [id, refreshKey]);
  const { data: callOptions } = useAsync(() => callHistoryService.getCallOptions(),[]);
  const { data: followUpsResponse } = useAsync(
  () => followUpService.getFollowUps({ studentId: id }),
  [id, refreshKey]
);

const followUps = Array.isArray(followUpsResponse)
  ? followUpsResponse
  : followUpsResponse?.data || [];

  

  if (loading || !student) return <LoadingState label="Loading student…" />;

  const grade = grades?.find((g) => g.id === student.gradeId);
  const klass = classes?.find((c) => c.id === student.classId);

  // Regular Users only ever see today's entries here — once the date
  // rolls over, yesterday's rows are simply gone from their view.
  // Admins and Managers always see the full history.
  const visibleAttendance = scopeToToday(
  Array.isArray(attendance) ? attendance : [],
  'date',
  user
);

const visiblePaymentHistory = scopeToToday(
  Array.isArray(payment?.PaymentHistory)
    ? payment.PaymentHistory
    : [],
  'date',
  user
);

const visibleCallHistory = scopeToToday(
  Array.isArray(callHistory) ? callHistory : [],
  'date',
  user
);

  async function handleSave(payload) {
    await studentService.updateStudent(student.id, payload);
    setEditOpen(false);
    setRefreshKey((k) => k + 1);
  }

  async function handleClearWarning() {
    await studentService.updateStudent(student.id, { phoneNeedsUpdate: false });
    setRefreshKey((k) => k + 1);
  }

  async function handleAddFollowUp({ note }) {
    await followUpService.createFollowUp({ note, studentId: student.id, branchId: student.branchId }, user);
    setFollowUpFormOpen(false);
    setRefreshKey((k) => k + 1);
  }

  async function handleCompleteFollowUp(f) {
    await followUpService.completeFollowUp(f.id, user);
    setRefreshKey((k) => k + 1);
  }

  async function handleSnoozeConfirm(date) {
    await followUpService.snoozeFollowUp(snoozeTarget.id, date, user);
    setSnoozeTarget(null);
    setRefreshKey((k) => k + 1);
  }

  async function handleDeleteFollowUp() {
    await followUpService.deleteFollowUp(deleteFollowUpTarget.id, user);
    setDeleteFollowUpTarget(null);
    setRefreshKey((k) => k + 1);
  }

  const attendanceColumns = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : 'warning'} dot>
          {r.status}
        </Badge>
      ),
    },
    { key: 'checkInTime', header: 'Check-in', render: (r) => r.checkInTime || '—' },
    { key: 'method', header: 'Method', render: (r) => r.method || '—' },
  ];

  // Complete exam history (spec: Results §3): Exam Name, Date, Score,
  // Percentage — joined against the exam catalog for name/date/totalMarks.
  const examRows = (results || []).map((r) => {
    const exam = exams?.find((e) => e.id === r.examId);
    const pct = !r.absent && exam?.totalMarks ? Math.round((r.score / exam.totalMarks) * 100) : null;
    return { ...r, exam, percentage: pct };
  });
  const gradedRows = examRows.filter((r) => r.percentage !== null);
  const overallAverage = gradedRows.length
    ? Math.round(gradedRows.reduce((sum, r) => sum + r.percentage, 0) / gradedRows.length)
    : null;

  const examColumns = [
    { key: 'examName', header: 'Exam Name', render: (r) => r.exam?.name || r.examId },
    { key: 'date', header: 'Date', render: (r) => (r.exam?.date ? formatDate(r.exam.date) : '—') },
    { key: 'score', header: 'Score', render: (r) => (r.absent ? <Badge tone="danger">Absent</Badge> : `${r.score} / ${r.exam?.totalMarks ?? '—'}`) },
    { key: 'percentage', header: 'Percentage', render: (r) => (r.percentage !== null ? `${r.percentage}%` : '—') },
  ];

  const callColumns = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'time', header: 'Time' },
    { key: 'staff', header: 'Staff' },
    { key: 'result', header: 'Result', render: (r) => CALL_RESULT_LABELS[r.result] || r.result },
    { key: 'reason', header: "Parent's Reason", render: (r) => r.reason || '—' },
  ];

  const followUpColumns = [
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
        <div className="flex gap-2">
          {f.status !== 'completed' && (
            <>
              <button className="btn btn-ghost btn-icon btn-sm" title="Mark completed" onClick={() => handleCompleteFollowUp(f)}>
                <CheckCircle2 size={15} color="var(--success-600)" />
              </button>
              <button className="btn btn-ghost btn-icon btn-sm" title="Snooze" onClick={() => setSnoozeTarget(f)}>
                <Clock size={15} />
              </button>
            </>
          )}
          {canDeleteFollowUp(user) && (
            <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => setDeleteFollowUpTarget(f)}>
              <Trash2 size={15} color="var(--danger-500)" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/app/students')}>
        <ArrowLeft size={15} /> Back to Students
      </button>

      <div className="card card-pad mb-4">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div className="flex items-center gap-4">
            <Avatar name={student.fullName} src={student.profilePicture} size={60} />
            <div>
              <h2 style={{ fontSize: 'var(--fs-xl)' }}>{student.fullName}</h2>
              <div className="text-secondary font-mono" style={{ fontSize: 'var(--fs-sm)' }}>{student.studentCode}</div>
              <div className="flex gap-2 mt-2">
              <Badge tone="neutral">{grade?.name}</Badge>
              <Badge tone="neutral">{klass?.name}</Badge>

              {student.feeExempted && <Badge tone="gold">Exempted</Badge>}

              <Badge tone={student.status === 'active' ? 'success' : 'danger'}>
              {student.status === 'active' ? 'Active' : 'Terminated'}
              </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setCallOpen(true)}>
              <PhoneCall size={15} /> Call Parent
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => printStudentQrCode(student, { gradeName: grade?.name, className: klass?.name })}
            >
              <Printer size={15} /> Print QR Code
            </button>
            <button className="btn btn-primary" onClick={() => setEditOpen(true)}>
              <Pencil size={15} /> Edit
            </button>
          </div>
        </div>

        {student.phoneNeedsUpdate && (
          <div
            className="flex items-center justify-between gap-2 mt-4"
            style={{ background: 'var(--warning-100)', color: 'var(--warning-600)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--fs-sm)' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} /> Parent phone number needs to be updated for this student.
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleClearWarning}>
              Clear Warning
            </button>
          </div>
        )}

        <div className="grid-3 mt-4">
          <InfoField label="Father's Name" value={student.FatherName} />
          <InfoField label="Student Phone" value={student.studentPhone} />
          <InfoField label="Parent Phone" value={student.FatherPhone} />
          <InfoField label="Address" value={student.address} />
          <InfoField label="Branch" value={student.branchId} />
          <div>
            <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 6 }}>QR Code</div>
            <QrCodeTile code={student.qrCode} size={72} />
          </div>
        </div>
      </div>

      {payment && (
  <div className="card card-pad mb-4">
    <div className="flex items-center justify-between mb-3">
      <span className="card-title">Payment Summary</span>

      <Badge
        tone={
          payment.status === 'paid'
            ? 'success'
            : payment.status === 'exempted'
              ? 'gold'
              : 'warning'
        }
      >
        {payment.status}
      </Badge>
    </div>

    {payment.status === 'exempted' ? (
      <div className="mt-2">
        <Badge tone="gold">Exempted</Badge>
      </div>
    ) : (
      <div className="grid-3 mt-2">
        <InfoField
          label="Total Fee"
          value={formatCurrency(payment.totalFee)}
        />

        <InfoField
          label="Paid Amount"
          value={formatCurrency(payment.paidAmount)}
        />

        <InfoField
          label="Remaining Balance"
          value={formatCurrency(payment.remainingBalance)}
        />
      </div>
    )}
  </div>
)}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'attendance', label: 'Attendance History' },
          { value: 'exams', label: 'Exam History' },
          { value: 'payments', label: 'Payment History' },
          { value: 'calls', label: 'Call History' },
          { value: 'follow-ups', label: `Follow-Ups${followUps?.length ? ` (${followUps.length})` : ''}` },
        ]}
      />
      {!canViewFullHistory(user) && (
        <p className="text-secondary mt-2" style={{ fontSize: 'var(--fs-xs)' }}>
          Showing today's entries only. Ask a Manager or Administrator for full history.
        </p>
      )}

      {tab === 'attendance' && <DataTable columns={attendanceColumns} rows={visibleAttendance || []} rowKey="id" />}
      {tab === 'exams' && (
        <>
          {overallAverage !== null && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Overall Average:</span>
              <Badge tone={overallAverage >= 50 ? 'success' : 'danger'}>{overallAverage}%</Badge>
            </div>
          )}
          <DataTable columns={examColumns} rows={examRows} rowKey="id" emptyTitle="No exam results yet" />
        </>
      )}
      {tab === 'payments' && (
        <DataTable
          columns={[
            { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
            { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'method', header: 'Method' },
          ]}
          rows={visiblePaymentHistory || []}
          rowKey="date"
        />
      )}
      {tab === 'calls' && <DataTable columns={callColumns} rows={visibleCallHistory || []} rowKey="id" />}
      {tab === 'follow-ups' && (
        <>
          <div className="flex justify-end mb-3">
            <button className="btn btn-primary btn-sm" onClick={() => setFollowUpFormOpen(true)}>
              <Plus size={14} /> Add Reminder
            </button>
          </div>
          <DataTable
            columns={followUpColumns}
            rows={Array.isArray(followUps) ? followUps : []}
            rowKey="id"
            emptyTitle="No follow-up reminders"
            emptyMessage="Add a reminder to follow up with this student's parent later."
          />
        </>
      )}

      <CallParentDialog
  open={callOpen}
  onClose={() => setCallOpen(false)}
  student={student}
  options={callOptions}
  onLogged={() => setRefreshKey((k) => k + 1)}
/>
      <StudentForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        grades={grades || []}
        classes={classes || []}
        initialValue={student}
        branchId={student.branchId}
      />
      <FollowUpForm
        open={followUpFormOpen}
        onClose={() => setFollowUpFormOpen(false)}
        onSave={handleAddFollowUp}
        studentName={student.fullName}
      />
      <SnoozeDialog open={!!snoozeTarget} onClose={() => setSnoozeTarget(null)} onConfirm={handleSnoozeConfirm} />
      <ConfirmDialog
        open={!!deleteFollowUpTarget}
        onClose={() => setDeleteFollowUpTarget(null)}
        onConfirm={handleDeleteFollowUp}
        title="Delete reminder"
        message="Are you sure you want to delete this follow-up reminder? This action cannot be undone."
      />
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || '—'}</div>
    </div>
  );
}
