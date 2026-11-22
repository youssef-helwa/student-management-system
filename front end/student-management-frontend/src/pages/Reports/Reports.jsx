import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import * as reportService from '../../services/reportService';
import * as financialService from '../../services/financialService';
import Tabs from '../../components/common/Tabs';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FinancialReportView from '../../components/expenses/FinancialReportView';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Reports() {
  const { activeBranch } = useBranch();
  const [tab, setTab] = useState('attendance');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Insights for {activeBranch?.name}</p>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'attendance', label: 'Attendance Reports' },
          { value: 'absence', label: 'Absence Reports' },
          { value: 'exam', label: 'Exam Reports' },
          { value: 'payment', label: 'Payment Reports' },
          { value: 'financial', label: 'Financial Reports' },
        ]}
      />

      {tab === 'attendance' && <AttendanceReport branchId={activeBranch?.id} />}
      {tab === 'absence' && <AbsenceReport branchId={activeBranch?.id} />}
      {tab === 'exam' && <ExamReport branchId={activeBranch?.id} />}
      {tab === 'payment' && <PaymentReport branchId={activeBranch?.id} />}
      {tab === 'financial' && <FinancialReports branchId={activeBranch?.id} />}
    </div>
  );
}

function AttendanceReport({ branchId }) {
    const { data, loading } = useAsync(
        () => reportService.getAttendanceReport({ branchId }),
        [branchId]
    );

    console.log("========== ATTENDANCE REPORT ==========");
    console.log("Branch ID:", branchId);
    console.log("Loading:", loading);
    console.log("Raw data:", data);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!data) {
        return <div>No attendance data</div>;
    }

    const chartData = [
        {
            name: 'Attendance',
            Present: data.present,
            Absent: data.absent,
            Excused: data.excused,
        }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">
                    Daily attendance breakdown
                </span>
            </div>

            <div className="card-body" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Bar
                            dataKey="Present"
                            fill="var(--success-500)"
                        />

                        <Bar
                            dataKey="Absent"
                            fill="var(--danger-500)"
                        />

                        <Bar
                            dataKey="Excused"
                            fill="var(--warning-500)"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function AbsenceReport({ branchId }) {
  const { data, loading } = useAsync(
    () => reportService.getAbsenceReport({ branchId }),
    [branchId]
  );

  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: detail, loading: detailLoading } = useAsync(
    () =>
      selectedStudent
        ? reportService.getStudentAbsenceDetail(
            selectedStudent.studentId,
            { branchId }
          )
        : Promise.resolve(null),
    [selectedStudent, branchId]
  );

  const columns = [
    { key: 'name', header: 'Student', render: (r) => r.student?.fullName || r.studentId },
    { key: 'code', header: 'ID', render: (r) => r.student?.studentCode || '—' },
    {
      key: 'absences',
      header: 'Absences (last 10 days)',
      render: (r) => <Badge tone={r.absences >= 3 ? 'danger' : 'warning'}>{r.absences}</Badge>,
    },
    { key: 'lastAbsenceDate', header: 'Last Absence', render: (r) => (r.lastAbsenceDate ? formatDate(r.lastAbsenceDate) : '—') },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={data || []}
        loading={loading}
        rowKey="studentId"
        onRowClick={(r) => setSelectedStudent(r)}
        emptyTitle="No absences recorded"
      />

      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.student?.fullName || 'Absence Details'}
        size="sm"
      >
        {detailLoading || !detail ? null : (
          <div className="flex-col gap-4" style={{ display: 'flex' }}>
            <div className="grid-2">
              <div>
                <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Total Absences</div>
                <div style={{ fontWeight: 700 }}>{detail.totalAbsences}</div>
              </div>
              <div>
                <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Last Absence Date</div>
                <div style={{ fontWeight: 700 }}>{detail.lastAbsenceDate ? formatDate(detail.lastAbsenceDate) : '—'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Attendance Percentage</div>
                <Badge tone={detail.attendancePercentage >= 80 ? 'success' : detail.attendancePercentage >= 60 ? 'warning' : 'danger'}>
                  {detail.attendancePercentage}%
                </Badge>
              </div>
            </div>
            <div>
              <div className="card-title mb-2" style={{ fontSize: 'var(--fs-sm)' }}>All Absence Dates</div>
              {(detail.absenceDates || []).length === 0 ? (
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>No absences recorded.</p>
              ) : (
                <ul className="flex-col gap-2" style={{ display: 'flex' }}>
                  {(detail.absenceDates || []).map((d) => (
                    <li key={d} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      {formatDate(d)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function ExamReport({ branchId }) {
  const { data, loading } = useAsync(() => reportService.getExamReports({ branchId }), [branchId]);
  const columns = [
    { key: 'examName', header: 'Exam' },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'participants', header: 'Participants' },
    { key: 'average', header: 'Average', render: (r) => `${r.average} / ${r.totalMarks}` },
    { key: 'highest', header: 'Highest' },
    { key: 'lowest', header: 'Lowest' },
  ];
  return <DataTable columns={columns} rows={data || []} loading={loading} rowKey="examId" emptyTitle="No completed exams" />;
}

function PaymentReport({ branchId }) {
  const { data, loading } = useAsync(() => reportService.getPaymentReport({ branchId }), [branchId]);
  const columns = [
    { key: 'studentName', header: 'Student' },
    { key: 'totalFee', header: 'Total Fee', render: (r) => formatCurrency(r.totalFee) },
    { key: 'paidAmount', header: 'Paid', render: (r) => formatCurrency(r.paidAmount) },
    { key: 'remainingBalance', header: 'Remaining', render: (r) => formatCurrency(r.remainingBalance) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={r.status === 'paid' ? 'success' : r.status === 'exempted' ? 'gold' : r.status === 'overdue' ? 'danger' : 'warning'}>{r.status}</Badge>,
    },
  ];
  return <DataTable columns={columns} rows={data || []} loading={loading} rowKey="studentId" emptyTitle="No payment data" />;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, delta) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function startOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sunday
  return addDays(dateStr, -day);
}

function startOfMonth(dateStr) {
  return `${dateStr.slice(0, 7)}-01`;
}

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Date Range' },
];

function FinancialReports({ branchId }) {
  const { user } = useAuth();
  const [range, setRange] = useState('week');
  const [customFrom, setCustomFrom] = useState(todayStr());
  const [customTo, setCustomTo] = useState(todayStr());
  const [selectedDate, setSelectedDate] = useState(null);

  const { from, to } = useMemo(() => {
    const today = todayStr();
    switch (range) {
      case 'today':
        return { from: today, to: today };
      case 'yesterday': {
        const y = addDays(today, -1);
        return { from: y, to: y };
      }
      case 'month':
        return { from: startOfMonth(today), to: today };
      case 'custom':
        return { from: customFrom, to: customTo };
      case 'week':
      default:
        return { from: startOfWeek(today), to: today };
    }
  }, [range, customFrom, customTo]);

  const { data: rows, loading } = useAsync(
    () => financialService.getFinancialReportsList({ branchId, from, to }),
    [branchId, from, to]
  );

  const { data: detailReport, loading: detailLoading } = useAsync(
    () =>
      selectedDate
        ? financialService.getFinancialReport({ branchId, date: selectedDate, generatedBy: user?.fullName })
        : Promise.resolve(null),
    [branchId, selectedDate]
  );

  const columns = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'totalIncome', header: 'Income', render: (r) => formatCurrency(r.totalIncome) },
    { key: 'totalExpenses', header: 'Expenses', render: (r) => formatCurrency(r.totalExpenses) },
    { key: 'netIncome', header: 'Net Cash', render: (r) => formatCurrency(r.netIncome) },
    { key: 'totalTransactions', header: 'Transactions' },
  ];
  console.log("REPORT DATA:", detailReport);
console.log("STUDENT FEE SUMMARY:", detailReport?.studentFeeSummary);
console.log("DAILY ACTIVITY:", detailReport?.dailyActivitySummary);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <select className="select" style={{ width: 200 }} value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {range === 'custom' && (
          <>
            <input className="input" type="date" style={{ width: 160 }} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <span className="text-secondary">to</span>
            <input className="input" type="date" style={{ width: 160 }} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows || []}
        loading={loading}
        rowKey="date"
        onRowClick={(r) => setSelectedDate(r.date)}
        emptyTitle="No financial activity in this range"
        emptyMessage="Income and expenses recorded in this date range will appear here."
      />

      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Financial Report — ${formatDate(selectedDate)}` : ''}
        size="lg"
      >
        {detailLoading || !detailReport ? null : <FinancialReportView report={detailReport} />}
      </Modal>
    </div>
  );
}
