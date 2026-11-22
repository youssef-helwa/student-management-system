import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  Wallet,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Receipt,
  Banknote,
  Building2,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useBranch } from '../../context/BranchContext';
import { useAsync } from '../../hooks/useAsync';
import * as studentService from '../../services/studentService';
import * as gradeService from '../../services/gradeService';
import * as attendanceService from '../../services/attendanceService';
import * as examService from '../../services/examService';
import * as paymentService from '../../services/paymentService';
import * as reportService from '../../services/reportService';
import * as financialService from '../../services/financialService';
import StatCard from '../../components/common/StatCard';
import GradeSelector from '../../components/dashboard/GradeSelector';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { EmptyState, LoadingState } from '../../components/common/States';
import { formatCurrency } from '../../utils/formatters';

const TODAY = new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const { activeBranch, branches, loading: branchesLoading } = useBranch();
  const navigate = useNavigate();
  const [gradeId, setGradeId] = useState('all');

  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: students, loading: studentsLoading } = useAsync(
    () => studentService.getStudents({ branchId: activeBranch?.id, gradeId }),
    [activeBranch?.id, gradeId]
  );
  const { data: attendanceToday, loading: attendanceLoading } = useAsync(
    () => attendanceService.getAllAttendance({ branchId: activeBranch?.id, gradeId, date: TODAY }),
    [activeBranch?.id, gradeId]
  );
  const { data: exams } = useAsync(
    () => examService.getExams({ branchId: activeBranch?.id, gradeId }),
    [activeBranch?.id, gradeId]
  );
  const { data: allPayments } = useAsync(() => paymentService.getPayments(), []);
  const { data: attendanceTrend } = useAsync(
    () => reportService.getAttendanceTrend({ branchId: activeBranch?.id }),
    [activeBranch?.id]
  );
  const { data: dailyFinancials, loading: financialsLoading } = useAsync(
    () => financialService.getDailyFinancials({ branchId: activeBranch?.id }),
    [activeBranch?.id]
  );

  const loading = studentsLoading || attendanceLoading;

  const scopedPayments = useMemo(() => {
    if (!students || !allPayments) return [];
    const ids = new Set(students.map((s) => s.id));
    return allPayments.filter((p) => ids.has(p.studentId));
  }, [students, allPayments]);

  const stats = useMemo(() => {
    const totalStudents = students?.length ?? 0;
    const present = (attendanceToday || []).filter((r) => r.status === 'present').length;
    const absent = (attendanceToday || []).filter((r) => r.status === 'absent').length;
    const totalExams = exams?.length ?? 0;
    const expected = scopedPayments.reduce((sum, p) => sum + p.totalFee, 0);
    const collected = scopedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const remaining = expected - collected;
    const exempted = students?.filter((s) => s.feeExempted).length ?? 0;
    const overdue = scopedPayments.filter((p) => p.status === 'overdue' || p.status === 'partial').length;
    return { totalStudents, present, absent, totalExams, expected, collected, remaining, exempted, overdue };
  }, [students, attendanceToday, exams, scopedPayments]);

  const chartData = (Array.isArray(attendanceTrend) ? attendanceTrend : [])
    .slice(-7)
    .map((d) => ({
        date: d.date?.slice(5) ?? '',
        Present: d.present ?? 0,
        Absent: d.absent ?? 0,
    }));

  const paymentsChartData = [
    { name: 'Collected', value: stats.collected },
    { name: 'Remaining', value: stats.remaining },
  ];

  const recentColumns = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => students?.find((s) => s.id === row.studentId)?.fullName || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'present' ? 'success' : row.status === 'absent' ? 'danger' : 'warning'} dot>
          {row.status}
        </Badge>
      ),
    },
    { key: 'checkInTime', header: 'Check-in', render: (row) => row.checkInTime || '—' },
    { key: 'method', header: 'Method', render: (row) => row.method || '—' },
  ];

  if (!activeBranch) {
    if (branchesLoading) return <LoadingState label="Loading branch…" />;
    return (
      <EmptyState
        icon={Building2}
        title={branches.length === 0 ? 'No branches yet' : 'No branch selected'}
        message={
          branches.length === 0
            ? "Create your first branch to start tracking students, attendance, and payments."
            : 'Select a branch from the top bar to see its dashboard.'
        }
        action={
          branches.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/app/branches')}>
              <Plus size={16} /> Create a Branch
            </button>
          )
        }
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview for {activeBranch.name} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="mb-4">
        <GradeSelector grades={Array.isArray(grades) ? grades : []} value={gradeId} onChange={setGradeId}/>
      </div>

      <div className="stat-grid">
        <StatCard icon={Users} label="Total Students" value={loading ? '—' : stats.totalStudents} tone="brand" />
        <StatCard icon={UserCheck} label="Present Today" value={loading ? '—' : stats.present} tone="success" />
        <StatCard icon={UserX} label="Absent Today" value={loading ? '—' : stats.absent} tone="danger" />
        <StatCard icon={FileText} label="Total Exams" value={loading ? '—' : stats.totalExams} tone="info" />
        <StatCard icon={PiggyBank} label="Collected Payments" value={loading ? '—' : formatCurrency(stats.collected)} tone="success" />
        <StatCard icon={ShieldCheck} label="Exempted Students" value={loading ? '—' : stats.exempted} tone="brand" />
        <StatCard icon={AlertTriangle} label="Overdue Payments" value={loading ? '—' : stats.overdue} tone="danger" />
      </div>

      <div className="card-title mb-2" style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-5)' }}>Today's Finances</div>
      <div className="stat-grid mb-4">
        <StatCard
          icon={Banknote}
          label="Today's Income"
          value={financialsLoading ? '—' : formatCurrency(dailyFinancials?.totalIncome)}
          tone="success"
        />
        <StatCard
          icon={Receipt}
          label="Today's Expenses"
          value={financialsLoading ? '—' : formatCurrency(dailyFinancials?.totalExpenses)}
          tone="danger"
        />
        <StatCard
          icon={TrendingUp}
          label="Today's Net Income"
          value={financialsLoading ? '—' : formatCurrency(dailyFinancials?.netIncome)}
          tone="gold"
        />
        <StatCard
          icon={Wallet}
          label="Total Transactions Today"
          value={financialsLoading ? '—' : dailyFinancials?.totalTransactions}
          tone="brand"
        />
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Attendance — last 7 days</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success-500)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--success-500)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--danger-500)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--danger-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Present" stroke="var(--success-500)" fill="url(#presentGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Absent" stroke="var(--danger-500)" fill="url(#absentGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Payments overview</span>
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentsChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="var(--gold-500)" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent attendance — today</span>
        </div>
        <DataTable
          columns={recentColumns}
          rows={attendanceToday || []}
          loading={attendanceLoading}
          rowKey="id"
          pageSize={6}
          emptyTitle="No attendance recorded yet"
          emptyMessage="Attendance for today will appear here once students check in."
        />
      </div>
    </div>
  );
}
