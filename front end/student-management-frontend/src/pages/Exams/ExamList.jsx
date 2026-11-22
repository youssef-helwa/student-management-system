import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAsync } from '../../hooks/useAsync';
import * as examService from '../../services/examService';
import * as gradeService from "../../services/gradeService";
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import ExamForm from '../../components/exams/ExamForm';
import { formatDate } from '../../utils/formatters';

export default function ExamList() {
  const { activeBranch } = useBranch();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formError, setFormError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: exams, loading } = useAsync(() => examService.getExams({ branchId: activeBranch?.id }), [activeBranch?.id, refreshKey]);

  const gradeMap = Object.fromEntries((grades || []).map((g) => [g.id, g.name]));

  function openAddExam() {
    setEditingExam(null);
    setFormError('');
    setFormOpen(true);
  }

  function openEditExam(exam) {
    setEditingExam(exam);
    setFormError('');
    setFormOpen(true);
  }

  async function handleSave(payload) {
    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, payload);
      } else {
        await examService.createExam({ ...payload, branchId: activeBranch?.id });
      }
      setFormOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFormError(err?.message || 'Something went wrong. Please try again.');
    }
  }

  const columns = [
    { key: 'name', header: 'Exam' },
    { key: 'subject', header: 'Subject' },
    { key: 'grade', header: 'Grade', render: (e) => gradeMap[e.gradeId] || '—' },
    { key: 'date', header: 'Date', render: (e) => formatDate(e.date) },
    { key: 'totalMarks', header: 'Total Marks' },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <Badge tone={e.status === 'completed' ? 'success' : 'info'} dot>{e.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      width: 80,
      render: (e) => (
        <div onClick={(ev) => ev.stopPropagation()}>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEditExam(e)}>
            <Pencil size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">Manage exams for {activeBranch?.name}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddExam}>
            <Plus size={16} /> Add Exam
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={exams || []}
        loading={loading}
        onRowClick={(e) => navigate(`/app/exams/${e.id}`)}
        emptyTitle="No exams yet"
        emptyMessage="Add an exam to start tracking results."
      />

      <ExamForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        grades={grades || []}
        initialValue={editingExam}
        error={formError}
      />
    </div>
  );
}
