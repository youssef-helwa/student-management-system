import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Users as UsersIcon, Layers } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import * as studentService from '../../services/studentService';
import * as classService from '../../services/classService';
import * as gradeService from '../../services/gradeService';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Tabs from '../../components/common/Tabs';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import GradeForm from '../../components/gradesClasses/GradeForm';
import ClassForm from '../../components/gradesClasses/ClassForm';
import EnrollmentModal from '../../components/gradesClasses/EnrollmentModal';

export default function GradesClasses() {
  const { activeBranch } = useBranch();

  const [tab, setTab] = useState('grades');
  const [refreshKey, setRefreshKey] = useState(0);

  const [gradeSearch, setGradeSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [classGradeFilter, setClassGradeFilter] = useState('');
  const debouncedGradeSearch = useDebounce(gradeSearch);
  const debouncedClassSearch = useDebounce(classSearch);

  const [gradeFormOpen, setGradeFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeError, setGradeError] = useState('');
  const [deleteGradeTarget, setDeleteGradeTarget] = useState(null);
  const [deleteGradeError, setDeleteGradeError] = useState('');

  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classError, setClassError] = useState('');
  const [deleteClassTarget, setDeleteClassTarget] = useState(null);
  const [deleteClassError, setDeleteClassError] = useState('');

  const [enrollmentTarget, setEnrollmentTarget] = useState(null);

  const { data: grades, loading: gradesLoading } = useAsync(() => gradeService.getGrades({branchId: activeBranch?.id}), [activeBranch?.id,,refreshKey]);
  const { data: classes, loading: classesLoading } = useAsync(
    () => classService.getClasses({ branchId: activeBranch?.id }),
    [activeBranch?.id, refreshKey]
  );
  const { data: allStudents } = useAsync(
    () => studentService.getStudents({ branchId: activeBranch?.id }),
    [activeBranch?.id, refreshKey]
  );

  const classCountByGrade = useMemo(() => {
    const counts = {};
    (classes || []).forEach((c) => {
      counts[c.gradeId] = (counts[c.gradeId] || 0) + 1;
    });
    return counts;
  }, [classes]);

  const studentCountByGrade = useMemo(() => {
    const counts = {};
    (allStudents || []).forEach((s) => {
      counts[s.gradeId] = (counts[s.gradeId] || 0) + 1;
    });
    return counts;
  }, [allStudents]);

  const studentCountByClass = useMemo(() => {
    const counts = {};
    (allStudents || []).forEach((s) => {
      if (s.classId) counts[s.classId] = (counts[s.classId] || 0) + 1;
    });
    return counts;
  }, [allStudents]);

  const gradeMap = useMemo(() => Object.fromEntries((grades || []).map((g) => [g.id, g.name])), [grades]);

  const filteredGrades = useMemo(() => {
    let result = grades || [];
    if (debouncedGradeSearch) {
      const q = debouncedGradeSearch.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q));
    }
    return result;
  }, [grades, debouncedGradeSearch]);

  const filteredClasses = useMemo(() => {
    let result = classes || [];
    if (classGradeFilter) result = result.filter((c) => String(c.gradeId) === String(classGradeFilter));
    if (debouncedClassSearch) {
      const q = debouncedClassSearch.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.teacher || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [classes, classGradeFilter, debouncedClassSearch]);

  // ---- Grade actions ----
  function openAddGrade() {
    setEditingGrade(null);
    setGradeError('');
    setGradeFormOpen(true);
  }
  function openEditGrade(g) {
    setEditingGrade(g);
    setGradeError('');
    setGradeFormOpen(true);
  }
  async function handleSaveGrade(payload) {
    try {
        if (editingGrade) {
            await gradeService.updateGrade(editingGrade.id, payload);
        } else {
            await gradeService.createGrade({
                ...payload,
                branchId: activeBranch?.id,
            });
        }

        setGradeFormOpen(false);
        setRefreshKey((k) => k + 1);
    } catch (err) {
        setGradeError(err?.message || 'Something went wrong. Please try again.');
    }
}
  async function handleDeleteGrade() {
    try {
      await gradeService.deleteGrade(deleteGradeTarget.id);
      setDeleteGradeTarget(null);
      setDeleteGradeError('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setDeleteGradeError(err?.message || 'Could not delete this grade.');
    }
  }

  // ---- Class actions ----
  function openAddClass() {
    setEditingClass(null);
    setClassError('');
    setClassFormOpen(true);
  }
  function openEditClass(c) {
    setEditingClass(c);
    setClassError('');
    setClassFormOpen(true);
  }
  async function handleSaveClass(payload) {
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, payload);
      } else {
        await classService.createClass({ ...payload, branchId: activeBranch?.id });
      }
      setClassFormOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setClassError(err?.message || 'Something went wrong. Please try again.');
    }
  }
  async function handleDeleteClass() {
    try {
      await classService.deleteClass(deleteClassTarget.id);
      setDeleteClassTarget(null);
      setDeleteClassError('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setDeleteClassError(err?.message || 'Could not delete this class.');
    }
  }

  const gradeColumns = [
    { key: 'name', header: 'Grade', render: (g) => <span style={{ fontWeight: 600 }}>{g.name}</span> },
    { key: 'order', header: 'Order', render: (g) => g.order ?? '—' },
    {
      key: 'classes',
      header: 'Classes',
      render: (g) => <Badge tone="neutral">{classCountByGrade[g.id] || 0}</Badge>,
    },
    {
      key: 'students',
      header: 'Students',
      render: (g) => <Badge tone="gold">{studentCountByGrade[g.id] || 0}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      width: 160,
      render: (g) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="View registered students"
            onClick={() => setEnrollmentTarget({ type: 'grade', id: g.id, name: g.name })}
          >
            <UsersIcon size={15} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEditGrade(g)}>
            <Pencil size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="Delete"
            onClick={() => {
              setDeleteGradeError('');
              setDeleteGradeTarget(g);
            }}
          >
            <Trash2 size={15} color="var(--danger-500)" />
          </button>
        </div>
      ),
    },
  ];

  const classColumns = [
    { key: 'name', header: 'Class', render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: 'grade', header: 'Grade', render: (c) => gradeMap[c.gradeId] || '—' },
    { key: 'teacher', header: 'Teacher', render: (c) => c.teacher || '—' },
    {
      key: 'students',
      header: 'Students',
      render: (c) => <Badge tone="gold">{studentCountByClass[c.id] || 0}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      width: 160,
      render: (c) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="View registered students"
            onClick={() => setEnrollmentTarget({ type: 'class', id: c.id, name: c.name })}
          >
            <UsersIcon size={15} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEditClass(c)}>
            <Pencil size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="Delete"
            onClick={() => {
              setDeleteClassError('');
              setDeleteClassTarget(c);
            }}
          >
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
          <h1 className="page-title">Grades & Classes</h1>
          <p className="page-subtitle">
            Manage grades and classes for {activeBranch?.name || 'your branch'}, and check who's registered.
          </p>
        </div>
        <div className="page-actions">
          {tab === 'grades' ? (
            <button className="btn btn-primary" onClick={openAddGrade}>
              <Plus size={16} /> Add Grade
            </button>
          ) : (
            <button className="btn btn-primary" onClick={openAddClass}>
              <Plus size={16} /> Add Class
            </button>
          )}
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'grades', label: 'Grades' },
          { value: 'classes', label: 'Classes' },
        ]}
      />

      {tab === 'grades' && (
        <DataTable
          columns={gradeColumns}
          rows={filteredGrades}
          loading={gradesLoading}
          rowKey="id"
          emptyTitle="No grades found"
          emptyMessage="Try a different search, or add a new grade."
          toolbar={
            <SearchInput value={gradeSearch} onChange={setGradeSearch} placeholder="Search grades…" />
          }
        />
      )}

      {tab === 'classes' && (
        <DataTable
          columns={classColumns}
          rows={filteredClasses}
          loading={classesLoading}
          rowKey="id"
          emptyTitle="No classes found"
          emptyMessage="Try adjusting your search or grade filter, or add a new class."
          toolbar={
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <SearchInput value={classSearch} onChange={setClassSearch} placeholder="Search by class or teacher…" />
              <select
                className="select"
                style={{ width: 160 }}
                value={classGradeFilter}
                onChange={(e) => setClassGradeFilter(e.target.value)}
              >
                <option value="">All Grades</option>
                {(grades || []).map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          }
        />
      )}

      <GradeForm
        open={gradeFormOpen}
        onClose={() => setGradeFormOpen(false)}
        onSave={handleSaveGrade}
        initialValue={editingGrade}
        error={gradeError}
      />
      <ClassForm
        open={classFormOpen}
        onClose={() => setClassFormOpen(false)}
        onSave={handleSaveClass}
        grades={grades || []}
        initialValue={editingClass}
        defaultGradeId={classGradeFilter}
        error={classError}
      />

      <ConfirmDialog
        open={!!deleteGradeTarget}
        onClose={() => setDeleteGradeTarget(null)}
        onConfirm={deleteGradeError ? () => setDeleteGradeTarget(null) : handleDeleteGrade}
        title="Delete grade"
        message={deleteGradeError || `Are you sure you want to delete ${deleteGradeTarget?.name}? This action cannot be undone.`}
        confirmLabel={deleteGradeError ? 'OK' : 'Delete'}
        danger={!deleteGradeError}
      />
      <ConfirmDialog
        open={!!deleteClassTarget}
        onClose={() => setDeleteClassTarget(null)}
        onConfirm={deleteClassError ? () => setDeleteClassTarget(null) : handleDeleteClass}
        title="Delete class"
        message={deleteClassError || `Are you sure you want to delete ${deleteClassTarget?.name}? This action cannot be undone.`}
        confirmLabel={deleteClassError ? 'OK' : 'Delete'}
        danger={!deleteClassError}
      />

      <EnrollmentModal
        open={!!enrollmentTarget}
        onClose={() => setEnrollmentTarget(null)}
        target={enrollmentTarget}
        branchId={activeBranch?.id}
      />
    </div>
  );
}
