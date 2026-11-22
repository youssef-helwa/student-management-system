import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Printer, Users as UsersIcon } from 'lucide-react';
import { printStudentQrCode } from '../../utils/printQrCode';
import { useBranch } from '../../context/BranchContext';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import * as studentService from '../../services/studentService';
import * as gradeService from '../../services/gradeService';
import * as classService from '../../services/classService';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StudentForm from '../../components/students/StudentForm';

export default function StudentsList() {
  const { activeBranch } = useBranch();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const handleSearch = (value) => {
  console.log("🔥 STUDENT SEARCH:", value);
  setSearch(value);
};
  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: classes } = useAsync(
  () => classService.getClasses({ branchId: activeBranch?.id }),
  [activeBranch?.id]
);

  const { data: students, loading } = useAsync(
    () =>
      studentService.getStudents({
        branchId: activeBranch?.id,
        gradeId: gradeFilter || undefined,
        classId: classFilter || undefined,
        search: debouncedSearch,
      }),
    [activeBranch?.id, gradeFilter, classFilter, debouncedSearch, refreshKey]
  );

  const gradeMap = useMemo(() => Object.fromEntries((grades || []).map((g) => [g.id, g.name])), [grades]);
  const classMap = useMemo(() => Object.fromEntries((classes || []).map((c) => [c.id, c.name])), [classes]);

  function openAdd() {
    setEditingStudent(null);
    setFormOpen(true);
  }
  function openEdit(student, e) {
    e.stopPropagation();
    setEditingStudent(student);
    setFormOpen(true);
  }
  async function handleSave(payload) {
  try {
    // Clear old error
    setError('');

    if (editingStudent) {
      await studentService.updateStudent(editingStudent.id, payload);
    } else {
      await studentService.createStudent(payload);
    }

    // Only close when request succeeds
    setFormOpen(false);
    setRefreshKey((k) => k + 1);

  } catch (err) {
    console.error("Student save error:", err);

    setError(
      err?.message ||
      err?.response?.data?.message ||
      "Something went wrong while saving the student."
    );

    // IMPORTANT:
    // Don't throw the error again
  }
}
  async function handleDelete() {
    await studentService.deleteStudent(deleteTarget.id);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }

  const columns = [
    {
      key: 'fullName',
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.fullName} src={s.profilePicture} size={32} />
          <div>
            <div style={{ fontWeight: 600 }}>{s.fullName}</div>
            <div className="text-tertiary font-mono" style={{ fontSize: 'var(--fs-xs)' }}>{s.studentCode}</div>
          </div>
        </div>
      ),
    },
    { key: 'FatherName', header: "Father's Name" },
    {
      key: 'grade',
      header: 'Grade / Class',
      render: (s) => (
        <span>
          {gradeMap[s.gradeId] || '—'} <span className="text-tertiary">/ {classMap[s.classId] || '—'}</span>
        </span>
      ),
    },
    { key: 'FatherPhone', header: 'Parent Phone' },
    {
      key: 'fee',
      header: 'Fee Status',
      render: (s) => (s.feeExempted ? <Badge tone="gold">Exempted</Badge> : <Badge tone="neutral">Standard</Badge>),
    },
    {
      key: 'actions',
      header: '',
      width: 160,
      render: (s) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => navigate(`/app/students/${s.id}`)}>
            <Eye size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="Print QR Code"
            onClick={() => printStudentQrCode(s, { gradeName: gradeMap[s.gradeId], className: classMap[s.classId] })}
          >
            <Printer size={15} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={(e) => openEdit(s, e)}>
            <Pencil size={15} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }}>
            <Trash2 size={15} color="var(--danger-500)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students ? students.length : '—'} students in {activeBranch?.name}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={students || []}
        loading={loading}
        onRowClick={(s) => navigate(`/app/students/${s.id}`)}
        emptyTitle="No students found"
        emptyMessage="Try adjusting your search or filters, or add a new student."
        toolbar={
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <SearchInput value={search} onChange={handleSearch} placeholder="Search by name or ID…"/>
            <select className="select" style={{ width: 160 }} value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
              <option value="">All Grades</option>
              {(grades || []).map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <select className="select" style={{ width: 160 }} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {(classes || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        }
      />

      <StudentForm
      open={formOpen}
  onClose={() => {
    setFormOpen(false);
    setError('');
  }}
  onSave={handleSave}
  error={error}
  grades={grades || []}
  classes={classes || []}
  initialValue={editingStudent}
  branchId={activeBranch?.id}
/>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete student"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
}
