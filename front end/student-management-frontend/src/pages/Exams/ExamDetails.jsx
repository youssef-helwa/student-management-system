import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as examService from '../../services/examService';
import * as studentService from '../../services/studentService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { LoadingState } from '../../components/common/States';
import { formatDate } from '../../utils/formatters';

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: exam, loading } = useAsync(() => examService.getExamById(id), [id]);
  const { data: results } = useAsync(() => examService.getResultsByExam(id), [id, refreshKey]);
  const { data: students } = useAsync(
    () => (exam ? studentService.getStudents({ branchId: exam.branchId, gradeId: exam.gradeId }) : Promise.resolve([])),
    [exam?.id]
  );

  if (loading || !exam) return <LoadingState label="Loading exam…" />;

  async function handleMarkAbsent(studentId) {
    await examService.markStudentAbsent(exam.id, studentId);
    setRefreshKey((k) => k + 1);
  }

  const rows = (students || []).map((s) => {
    const result = results?.find((r) => r.studentId === s.id);
    return { id: s.id, student: s, result };
  });

  const columns = [
    { key: 'name', header: 'Student', render: (row) => row.student.fullName },
    { key: 'code', header: 'ID', render: (row) => row.student.studentCode },
    {
      key: 'score',
      header: 'Score',
      render: (row) =>
        row.result?.absent ? <Badge tone="danger">Absent</Badge> : row.result ? `${row.result.score} / ${exam.totalMarks}` : '—',
    },
    {
      key: 'actions',
      header: '',
      width: 140,
      render: (row) =>
        !row.result?.absent ? (
          <button className="btn btn-ghost btn-sm" onClick={() => handleMarkAbsent(row.student.id)}>
            <UserX size={14} /> Mark Absent
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/app/exams')}>
        <ArrowLeft size={15} /> Back to Exams
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{exam.name}</h1>
          <p className="page-subtitle">
            {exam.subject} · {formatDate(exam.date)} · Total Marks: {exam.totalMarks}
          </p>
        </div>
        <Badge tone={exam.status === 'completed' ? 'success' : 'info'} dot>{exam.status}</Badge>
      </div>

      <DataTable columns={columns} rows={rows} emptyTitle="No students in this cohort" />
    </div>
  );
}
