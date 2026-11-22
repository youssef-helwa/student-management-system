import { useEffect, useState } from 'react';
import { ScanLine, Keyboard, CheckCircle2, AlertTriangle, PhoneCall, Search, ShieldCheck, GraduationCap, BookOpen, PlayCircle, StopCircle, Users } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import * as studentService from '../../services/studentService';
import * as classService from '../../services/classService';
import * as gradeService from '../../services/gradeService';
import * as attendanceService from '../../services/attendanceService';
import * as paymentService from '../../services/paymentService';
// === NEW (Session feature) ===
import * as sessionService from '../../services/sessionService';
import GradeSelector from '../../components/dashboard/GradeSelector';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CallParentDialog from '../../components/attendance/CallParentDialog';
import { formatDate } from '../../utils/formatters';
import { isAbsenceAcknowledged, acknowledgeAbsence } from '../../utils/absenceAck';

const TODAY = new Date().toISOString().slice(0, 10);

// Paid / Unpaid / Fee-Exempt badge for a student, given their payment
// record (spec: Attendance §1). Fee-exempt students never read as unpaid.
function paymentStatusFor(student, payment) {
  if (student?.feeExempted) return 'exempt';
  if (payment?.status === 'paid') return 'paid';
  return 'unpaid';
}

function PaymentStatusBadge({ status }) {
  if (status === 'exempt') return <Badge tone="gold" dot>Fee-Exempt</Badge>;
  if (status === 'paid') return <Badge tone="success" dot>Paid</Badge>;
  return <Badge tone="danger" dot>Unpaid</Badge>;
}

export default function Attendance() {
  const { activeBranch } = useBranch();
  // === NEW (Session feature) — need the current user to stamp startedBy/closedBy
  const { user } = useAuth();
  const [method, setMethod] = useState('qr');
  const [manualCode, setManualCode] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [gradeId, setGradeId] = useState('all');
  const [callTarget, setCallTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [absenceNotice, setAbsenceNotice] = useState(null);
  const [dayType, setDayTypeState] = useState(attendanceService.DAY_TYPES.REGULAR);

  // === NEW (Session feature) — the class the "Start Session" flow runs
  // against, plus a dedicated refresh key so starting/finishing a session
  // doesn't have to piggyback on the general attendance refreshKey.
  const [classId, setClassId] = useState('');
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const [sessionError, setSessionError] = useState('');
  const [sessionSummary, setSessionSummary] = useState(null); // set after Finish Session

  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: classes } = useAsync(() => classService.getClasses({ branchId: activeBranch?.id }), [activeBranch?.id]);
  const { data: students } = useAsync(() => studentService.getStudents({ branchId: activeBranch?.id }), [activeBranch?.id]);
  const { data: payments } = useAsync(() => paymentService.getPayments(), [refreshKey]);
  const { data: attendanceToday, loading } = useAsync(
    () => attendanceService.getAttendanceRecords({ branchId: activeBranch?.id, gradeId, date: TODAY }),
    [activeBranch?.id, gradeId, refreshKey]
  );
  console.log("Today's attendance:", attendanceToday);

  // === NEW (Session feature) — the open session (if any) for the selected
  // class, and how many students in that class have scanned present so far.
  const { data: activeSession } = useAsync(
    () => (classId ? sessionService.getActiveSessionForClass(classId) : Promise.resolve(null)),
    [classId, sessionRefreshKey]
  );
  const { data: sessionAttendance } = useAsync(
    () => (activeSession ? sessionService.getSessionAttendance(activeSession.id) : Promise.resolve([])),
    [activeSession?.id, refreshKey]
  );
  const selectedClass = classes?.find((c) => c.id === classId) || null;
  const classStudentCount = (students || []).filter((s) => s.classId === classId).length;
  const presentCount = (sessionAttendance || []).filter((r) => r.status === 'present').length;

  // Load today's Day Type (Regular Day / Exam Day) whenever the branch changes.
  useEffect(() => {
    attendanceService.getDayType({ branchId: activeBranch?.id, date: TODAY }).then(setDayTypeState);
  }, [activeBranch?.id]);

  async function handleDayTypeChange(nextType) {
    setDayTypeState(nextType);
    await attendanceService.setDayType({ branchId: activeBranch?.id, date: TODAY, dayType: nextType });
  }

  function studentFor(record) {
    return students?.find((s) => s.id === record.studentId);
  }

  function paymentFor(studentId) {
    return payments?.find((p) => p.studentId === studentId) || null;
  }

  // === NEW (Session feature) ===
  // Start Session — opens a session for the selected class. Students can
  // only scan once a session is open (see the QR/manual gating below).
  async function handleStartSession() {
    setSessionError('');
    setSessionSummary(null);
    try {
      await sessionService.startSession({
        classId,
        gradeId: selectedClass?.gradeId,
        branchId: activeBranch?.id,
        startedBy: user?.id,
      });
      setSessionRefreshKey((k) => k + 1);
    } catch (err) {
      setSessionError(err?.message || 'Could not start the session.');
    }
  }

  // === NEW (Session feature) ===
  // Finish Session — closes the session, which triggers the backend-side
  // "mark everyone who didn't scan as Absent + notify" flow. The result's
  // absentStudents list is shown to the admin right away.
  async function handleFinishSession() {
    if (!activeSession) return;
    setSessionError('');
    try {
      const result = await sessionService.closeSession(activeSession.id, { closedBy: user?.id });
      setSessionSummary(result);
      setSessionRefreshKey((k) => k + 1);
      setRefreshKey((k) => k + 1);
      console.log("Attendance refreshed");
      console.log("Today's attendance:", attendanceToday);
    } catch (err) {
      setSessionError(err?.message || 'Could not finish the session.');
    }
  }

  async function checkInStudent(student) {
    // === EDIT (Session feature) ===
    // When a session is open for the selected class, tie the scan to it
    // (enforces "present" + no double-scan). Outside of a session, this
    // behaves exactly as it did before this feature.
    try {
      await attendanceService.recordAttendance({
        studentId: student.id,
        method,
        dayType,
        sessionId: activeSession?.id,
        classId: activeSession ? activeSession.classId : undefined,
        gradeId: activeSession ? activeSession.gradeId : undefined,
        branchId: activeBranch?.id,
      });
    } catch (err) {
      // e.g. "already scanned in this session"
      setFeedback({ type: 'error', message: err?.message });
      return;
    }

    const payment = paymentFor(student.id);
    const paymentStatus = paymentStatusFor(student, payment);

    setFeedback({
      student,
      paymentStatus,
      phoneWarning: !!student.phoneNeedsUpdate,
    });

    // Attendance Notifications (spec §5): if the student's most recent
    // prior session was an absence, and they haven't already dismissed
    // this exact absence, surface a popup. Re-checking-in doesn't
    // silently re-trigger it once acknowledged, unless a newer absence
    // is recorded after that.
    const priorRecords = await attendanceService.getAttendanceRecords({ studentId: student.id });
    const lastPrior = priorRecords?.[0];
    if (lastPrior?.status === 'absent' && !isAbsenceAcknowledged(student.id, lastPrior.date)) {
      setAbsenceNotice({ student, absenceDate: lastPrior.date });
    }

    setRefreshKey((k) => k + 1);
  }

  function dismissAbsenceNotice() {
    if (absenceNotice) {
      acknowledgeAbsence(absenceNotice.student.id, absenceNotice.absenceDate);
    }
    setAbsenceNotice(null);
  }

  function handleSimulateScan() {
    // === EDIT (Session feature) — when a session is open, simulate a scan
    // from that class's roster so "Simulate Scan" actually demonstrates the
    // session flow instead of a random student from any class.
    const pool = activeSession ? (students || []).filter((s) => s.classId === activeSession.classId) : students;
    if (!pool || pool.length === 0) return;
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    checkInStudent(candidate);
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    const match = students?.find((s) => s.studentCode.toLowerCase() === manualCode.trim().toLowerCase() || s.id === manualCode.trim());
    if (!match) {
      setFeedback({ type: 'error' });
      return;
    }
    checkInStudent(match);
    setManualCode('');
  }

  const columns = [
    { key: 'name', header: 'Student', render: (r) => studentFor(r)?.fullName || r.studentId },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : 'warning'} dot>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (r) => {
        const student = studentFor(r);
        return <PaymentStatusBadge status={paymentStatusFor(student, paymentFor(r.studentId))} />;
      },
    },
    { key: 'checkInTime', header: 'Check-in', render: (r) => r.checkInTime || '—' },
    { key: 'method', header: 'Method', render: (r) => r.method || '—' },
    {
      key: 'actions',
      header: '',
      width: 140,
      render: (r) =>
        r.status === 'absent' ? (
          <button className="btn btn-secondary btn-sm" onClick={() => setCallTarget(studentFor(r))}>
            <PhoneCall size={13} /> Call Parent
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Record attendance for {activeBranch?.name} · today</p>
        </div>
        <div className="page-actions">
          <div className="pill-tabs">
            <button
              className={`chip ${dayType === attendanceService.DAY_TYPES.REGULAR ? 'active' : ''}`}
              onClick={() => handleDayTypeChange(attendanceService.DAY_TYPES.REGULAR)}
            >
              <BookOpen size={14} /> Regular Day
            </button>
            <button
              className={`chip ${dayType === attendanceService.DAY_TYPES.EXAM ? 'active' : ''}`}
              onClick={() => handleDayTypeChange(attendanceService.DAY_TYPES.EXAM)}
            >
              <GraduationCap size={14} /> Exam Day
            </button>
          </div>
        </div>
      </div>

      {/* === NEW (Session feature) — Start Session / Finish Session card === */}
      <div className="card mb-4">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <span className="card-title">Session</span>
          <select
            className="select"
            style={{ width: 220 }}
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSessionError('');
              setSessionSummary(null);
            }}
          >
            <option value="">Select a class…</option>
            {(classes || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="card-body">
          {!classId ? (
            <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
              Select a class to start this Saturday's attendance session.
            </p>
          ) : (
            <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
              {activeSession ? (
                <>
                  <Badge tone="success" dot>Session Open</Badge>
                  <div className="flex items-center gap-2 text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                    <Users size={14} /> {presentCount} / {classStudentCount} scanned present
                  </div>
                  <button className="btn btn-danger" onClick={handleFinishSession}>
                    <StopCircle size={16} /> Finish Session
                  </button>
                </>
              ) : (
                <>
                  <Badge tone="neutral" dot>No Active Session</Badge>
                  <button className="btn btn-primary" onClick={handleStartSession}>
                    <PlayCircle size={16} /> Start Session
                  </button>
                </>
              )}
            </div>
          )}
          {sessionError && (
            <div className="mt-3">
              <FeedbackBanner tone="danger" icon={AlertTriangle} text={sessionError} />
            </div>
          )}
          {sessionSummary && (
            <div className="mt-3 flex-col gap-2" style={{ display: 'flex' }}>
              <FeedbackBanner
                tone="success"
                icon={CheckCircle2}
                text={`Session closed. ${sessionSummary.absentStudents.length} student(s) marked absent and notified.`}
              />
              {sessionSummary.absentStudents.length > 0 && (
                <ul className="text-secondary" style={{ fontSize: 'var(--fs-sm)', paddingLeft: 'var(--sp-5)' }}>
                  {sessionSummary.absentStudents.map((s) => (
                    <li key={s.id}>{s.fullName}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Record attendance</span>
          <div className="flex items-center gap-3">
            <Badge tone={dayType === attendanceService.DAY_TYPES.EXAM ? 'gold' : 'info'} dot>
              {dayType === attendanceService.DAY_TYPES.EXAM ? 'Exam Day' : 'Regular Day'}
            </Badge>
            <div className="pill-tabs">
              <button className={`chip ${method === 'qr' ? 'active' : ''}`} onClick={() => setMethod('qr')}>
                <ScanLine size={14} /> QR Scanner
              </button>
              <button className={`chip ${method === 'manual' ? 'active' : ''}`} onClick={() => setMethod('manual')}>
                <Keyboard size={14} /> Manual Entry
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* === NEW (Session feature) — shows whether scans below will be tied to the open session === */}
          {classId && (
            <p className="text-secondary mb-3" style={{ fontSize: 'var(--fs-xs)' }}>
              {activeSession
                ? `Scans below register attendance for the open ${selectedClass?.name || ''} session.`
                : 'No session is open for the selected class — start one above to track session attendance.'}
            </p>
          )}
          {method === 'qr' ? (
            <div className="flex-col items-center gap-4" style={{ display: 'flex', padding: 'var(--sp-6) 0' }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 'var(--radius-lg)',
                  border: '2px dashed var(--border-strong)',
                  background: 'var(--bg-sunken)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <ScanLine size={64} />
              </div>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', textAlign: 'center', maxWidth: 320 }}>
                Point the camera at a student's QR code. The scan and lookup logic will be implemented by the backend —
                use the button below to preview the check-in flow.
              </p>
              <button className="btn btn-gold" onClick={handleSimulateScan}>
                Simulate Scan
              </button>
            </div>
          ) : (
            <form className="flex-col gap-3" style={{ display: 'flex', maxWidth: 420, margin: '0 auto', padding: 'var(--sp-6) 0' }} onSubmit={handleManualSubmit}>
              <label className="field-label">Student Code or ID</label>
              <div className="search-input-wrap">
                <Search size={15} />
                <input
                  className="input"
                  placeholder="e.g. STU-0001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <button className="btn btn-primary w-full" type="submit" style={{ justifyContent: 'center' }}>
                Register Attendance
              </button>
            </form>
          )}

          {feedback?.student && (
            <div className="mt-4 flex-col gap-2" style={{ display: 'flex' }}>
              <FeedbackBanner tone="success" icon={CheckCircle2} text={`${feedback.student.fullName} checked in successfully.`} />
              <div className="flex items-center gap-2">
                <span className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Payment status:</span>
                <PaymentStatusBadge status={feedback.paymentStatus} />
              </div>
              {feedback.phoneWarning && (
                <FeedbackBanner
                  tone="warning"
                  icon={AlertTriangle}
                  text="⚠️ Parent phone number needs to be updated for this student."
                />
              )}
              {feedback.paymentStatus === 'unpaid' && (
                <FeedbackBanner tone="danger" icon={AlertTriangle} text="⚠️ This student has an outstanding balance (Unpaid)." />
              )}
              {feedback.paymentStatus === 'exempt' && (
                <FeedbackBanner tone="gold" icon={ShieldCheck} text="This student is Fee-Exempt — no payment warning shown." />
              )}
            </div>
          )}
          {feedback?.type === 'error' && (
            <FeedbackBanner tone="danger" icon={AlertTriangle} text={feedback.message || 'No student found with that code.'} />
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <span className="card-title">Today's attendance</span>
          <GradeSelector grades={grades || []} value={gradeId} onChange={setGradeId} />
        </div>
        <DataTable
          columns={columns}
          rows={attendanceToday || []}
          loading={loading}
          rowKey="id"
          emptyTitle="No attendance yet"
          emptyMessage="Records will appear here as students check in."
        />
      </div>

      <CallParentDialog open={!!callTarget} onClose={() => setCallTarget(null)} student={callTarget} />

      <Modal
        open={!!absenceNotice}
        onClose={dismissAbsenceNotice}
        title="Previously Absent"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={dismissAbsenceNotice}>Dismiss</button>
            <button className="btn btn-primary" onClick={dismissAbsenceNotice}>OK</button>
          </>
        }
      >
        {absenceNotice && (
          <div className="flex-col gap-3" style={{ display: 'flex' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} color="var(--warning-600)" />
              <span style={{ fontWeight: 700 }}>{absenceNotice.student.fullName}</span>
            </div>
            <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
              This student was marked absent in their previous session and is now attending.
            </p>
            <div>
              <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Previous Absence Date</div>
              <div style={{ fontWeight: 600 }}>{formatDate(absenceNotice.absenceDate)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FeedbackBanner({ tone, icon: Icon, text }) {
  const toneStyles = {
    success: { bg: 'var(--success-100)', fg: 'var(--success-600)' },
    warning: { bg: 'var(--warning-100)', fg: 'var(--warning-600)' },
    danger: { bg: 'var(--danger-100)', fg: 'var(--danger-600)' },
    gold: { bg: 'var(--gold-100)', fg: 'var(--gold-700)' },
  };
  const s = toneStyles[tone];
  return (
    <div
      className="flex items-center gap-2"
      style={{ background: s.bg, color: s.fg, padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--fs-sm)' }}
    >
      <Icon size={16} /> {text}
    </div>
  );
}
