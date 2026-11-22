
import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

import * as classService from '../../services/classService';
import * as gradeService from '../../services/gradeService';

import { useBranch } from '../../context/BranchContext';

const EMPTY = {
  name: '',
  gradeId: '',
  branchId: '',
  teacher: '',
};

export default function ClassesStep({ onNext, onBack }) {
  const {
    activeBranch,
    accessibleBranches,
    loading: branchLoading,
  } = useBranch();

  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Grades belonging to the selected branch.
  const availableGrades = grades.filter(
    (g) =>
      !g.branchId ||
      String(g.branchId) === String(form.branchId)
  );

  async function load() {
    try {
      setLoading(true);
      setError('');

      const [classesData, gradesData] = await Promise.all([
        classService.getClasses(),
        gradeService.getGrades(),
      ]);

      setClasses(Array.isArray(classesData) ? classesData : []);
      setGrades(Array.isArray(gradesData) ? gradesData : []);

      setForm((f) => ({
        ...f,
        branchId: f.branchId || String(activeBranch?.id || ''),
        gradeId: f.gradeId || String(gradesData?.[0]?.id || ''),
      }));
    } catch (err) {
      console.error('LOAD CLASSES STEP ERROR:', err);
      setError(err?.message || 'Could not load classes or grades.');
    } finally {
      setLoading(false);
    }
  }

  // Wait until BranchContext finishes selecting the default branch.
  useEffect(() => {
    if (branchLoading) return;

    setForm((f) => ({
      ...f,
      branchId: String(activeBranch?.id || ''),
    }));

    load();
  }, [branchLoading, activeBranch?.id]);

  // Keep a valid grade selected when changing branches.
  useEffect(() => {
    if (!availableGrades.length) {
      setForm((f) => ({ ...f, gradeId: '' }));
      return;
    }

    const gradeExists = availableGrades.some(
      (g) => String(g.id) === String(form.gradeId)
    );

    if (!gradeExists) {
      setForm((f) => ({
        ...f,
        gradeId: String(availableGrades[0].id),
      }));
    }
  }, [form.branchId, grades]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Class name is required.');
      return;
    }

    if (!form.gradeId) {
      setError('Please select a grade.');
      return;
    }

    if (!form.branchId) {
      setError('Please select a branch.');
      return;
    }

    setSaving(true);

    try {
      await classService.createClass({
        name: form.name.trim(),
        gradeId: form.gradeId,
        branchId: form.branchId,
        teacher: form.teacher.trim(),
      });

      setForm((f) => ({
        ...f,
        name: '',
        teacher: '',
      }));

      await load();
    } catch (err) {
      console.error('CREATE CLASS ERROR:', err);
      setError(err?.message || 'Could not add this class.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await classService.deleteClass(id);
      await load();
    } catch (err) {
      console.error('DELETE CLASS ERROR:', err);
      setError(err?.message || 'Could not remove this class.');
    }
  }

  const gradeMap = Object.fromEntries(
    grades.map((g) => [String(g.id), g.name])
  );

  const branchMap = Object.fromEntries(
    accessibleBranches.map((b) => [String(b.id), b.name])
  );

  return (
    <div>
      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>
        Add your classes
      </h2>

      <p className="text-secondary mb-4">
        Classes belong to a grade and a branch. This step is optional —
        you can always add classes later from Grades & Classes.
      </p>

      {activeBranch && (
        <p className="text-secondary mb-3">
          Selected Branch: <strong>{activeBranch.name}</strong>
        </p>
      )}

      <form
        className="grid-2"
        style={{ gap: 'var(--sp-3)', alignItems: 'end' }}
        onSubmit={handleAdd}
      >
        <div className="field">
          <label className="field-label">Class Name</label>
          <input
            className="input"
            placeholder="e.g. Class A"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </div>

        <div className="field">
          <label className="field-label">Teacher</label>
          <input
            className="input"
            placeholder="Optional"
            value={form.teacher}
            onChange={(e) =>
              setForm((f) => ({ ...f, teacher: e.target.value }))
            }
          />
        </div>

        <div className="field">
          <label className="field-label">Grade</label>
          <select
            className="select"
            value={form.gradeId}
            onChange={(e) =>
              setForm((f) => ({ ...f, gradeId: e.target.value }))
            }
            disabled={loading || availableGrades.length === 0}
          >
            <option value="">Select Grade</option>

            {availableGrades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Branch</label>
          <select
            className="select"
            value={form.branchId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                branchId: e.target.value,
                gradeId: '',
              }))
            }
            disabled={branchLoading || accessibleBranches.length === 0}
          >
            <option value="">Select Branch</option>

            {accessibleBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="field-error" style={{ gridColumn: '1 / -1' }}>
            {error}
          </p>
        )}

        <button
          className="btn btn-secondary"
          type="submit"
          disabled={
            saving ||
            loading ||
            !form.gradeId ||
            !form.branchId
          }
          style={{
            gridColumn: '1 / -1',
            justifyContent: 'center',
          }}
        >
          <Plus size={16} />
          {saving ? 'Adding…' : 'Add Class'}
        </button>
      </form>

      {!loading && classes.length > 0 && (
        <div
          className="mt-4 flex-col gap-2"
          style={{ display: 'flex' }}
        >
          {classes.map((c) => (
            <div
              key={c.id}
              className="card card-pad flex items-center justify-between"
              style={{ padding: 'var(--sp-3) var(--sp-4)' }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>

                <div
                  className="text-tertiary"
                  style={{ fontSize: 'var(--fs-xs)' }}
                >
                  {gradeMap[String(c.gradeId)] || '—'} ·{' '}
                  {branchMap[String(c.branchId)] || '—'}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                title="Remove"
                onClick={() => handleDelete(c.id)}
              >
                <Trash2 size={15} color="var(--danger-500)" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          style={{ justifyContent: 'center' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {classes.length === 0 ? 'Skip for now' : 'Continue'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
