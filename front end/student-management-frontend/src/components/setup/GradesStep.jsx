import { useEffect, useState } from 'react';
import { useBranch } from '../../context/BranchContext';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
// import * as studentService from '../../services/studentService';
import * as gradeService from '../../services/gradeService';


const EMPTY = { name: '', order: '' };

export default function GradesStep({ onNext, onBack }) {
  const {
  activeBranch,
  loading: branchLoading
} = useBranch();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
  const data = await gradeService.getGrades();
  setGrades(Array.isArray(data) ? data : []);
}

  
useEffect(() => {
  if (branchLoading) return;

  if (!activeBranch?.id) {
    setLoading(false);
    return;
  }

  setLoading(true);

  load()
    .catch(err => {
      console.error('GET GRADES ERROR:', err);
      setError(err?.message || 'Could not load grades.');
    })
    .finally(() => {
      setLoading(false);
    });
}, [activeBranch?.id, branchLoading]);


  // async function handleAdd(e) {
  //   e.preventDefault();
  //   setError('');
  //   if (!form.name.trim()) {
  //     setError('Grade name is required.');
  //     return;
  //   }
  //   setSaving(true);
  //   try {
  //     await gradeService.createGrade({
  //       name: form.name.trim(),
  //       order: form.order === '' ? undefined : Number(form.order),
  //     });
  //     setForm(EMPTY);
  //     await load();
  //   } catch (err) {
  //     setError(err?.message || 'Could not add this grade.');
  //   } finally {
  //     setSaving(false);
  //   }
  // }
 async function handleAdd(e) {
  e.preventDefault();
  setError('');

  if (!activeBranch?.id) {
    setError('Please select a branch first.');
    return;
  }

  if (!form.name.trim()) {
    setError('Grade name is required.');
    return;
  }

  if (form.order === '' || Number(form.order) < 1) {
    setError('Please enter a valid display order.');
    return;
  }

  setSaving(true);

  try {
    await gradeService.createGrade({
      name: form.name.trim(),
      order: Number(form.order),
      branchId: activeBranch.id,
    });

    setForm(EMPTY);
    await load();

  } catch (err) {
    console.error('CREATE GRADE ERROR:', err);
    setError(err?.message || 'Could not add this grade.');
  } finally {
    setSaving(false);
  }
}
  async function handleDelete(id) {
    try {
      await gradeService.deleteGrade(id);
      await load();
    } catch (err) {
      setError(err?.message || 'Could not remove this grade.');
    }
  }

  return (
  <div>
    <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>
      Add your grades
    </h2>

    {/* Show the currently selected branch */}
    <p className="text-secondary mb-2">
      Active Branch: {activeBranch?.name || 'Loading branch...'}
    </p>

    <p className="text-secondary mb-4">
      Grades (e.g. Grade 7, Grade 8) group students and classes together. Add at least one to continue.
    </p>

    <form
      className="grid-2"
      style={{ gap: 'var(--sp-3)', alignItems: 'end' }}
      onSubmit={handleAdd}
    >
      <div className="field">
        <label className="field-label">Grade Name</label>
        <input
          className="input"
          placeholder="e.g. 1"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({ ...f, name: e.target.value }))
          }
        />
      </div>

      <div className="field">
        <label className="field-label">Display Order</label>
        <input
          className="input"
          type="number"
          placeholder="Optional"
          value={form.order}
          onChange={(e) =>
            setForm((f) => ({ ...f, order: e.target.value }))
          }
        />
      </div>

      {error && (
        <p className="field-error" style={{ gridColumn: '1 / -1' }}>
          {error}
        </p>
      )}

      <button
        className="btn btn-secondary"
        type="submit"
        disabled={saving || !activeBranch?.id}
        style={{ gridColumn: '1 / -1', justifyContent: 'center' }}
      >
        <Plus size={16} />
        {saving ? 'Adding…' : 'Add Grade'}
      </button>
    </form>

    {!loading && grades.length > 0 && (
      <div className="mt-4 flex gap-2" style={{ flexWrap: 'wrap' }}>
        {grades.map((g) => (
          <span key={g.id} className="chip flex items-center gap-2">
            {g.name}
            <button
              type="button"
              onClick={() => handleDelete(g.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
              title="Remove"
            >
              <Trash2 size={13} color="var(--danger-500)" />
            </button>
          </span>
        ))}
      </div>
    )}

    <div className="flex gap-3 mt-4">
      <button
        className="btn btn-secondary"
        onClick={onBack}
        style={{ justifyContent: 'center' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <button
        className="btn btn-primary"
        disabled={grades.length === 0}
        onClick={onNext}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        Continue <ArrowRight size={16} />
      </button>
    </div>
  </div>
);
}
