import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import * as branchService from '../../services/branchService';
import BranchDot from '../common/BranchDot';
import { useBranch } from '../../context/BranchContext';

const EMPTY = { name: '', code: '', address: '' };

export default function BranchStep({ onNext }) {
  const { refreshBranches, setActiveBranch } = useBranch();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await branchService.getBranches();
    setBranches(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
  e.preventDefault();
  setError('');

  if (!form.name.trim()) {
    setError('Branch name is required.');
    return;
  }

  setSaving(true);

  try {
    await branchService.createBranch(form);

    setForm(EMPTY);

    // Refresh branches in Context
    await refreshBranches();

    // Refresh local branches list
    await load();

  } catch (err) {
    setError(err?.message || 'Could not add this branch.');
  } finally {
    setSaving(false);
  }
}

  async function handleDelete(id) {
    await branchService.deleteBranch(id);
    await load();
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>Add your first branch</h2>
      <p className="text-secondary mb-4">
        Branches represent each physical location your center operates. You'll need at least one to continue.
      </p>

      <form className="grid-2" style={{ gap: 'var(--sp-3)', alignItems: 'end' }} onSubmit={handleAdd}>
        <div className="field">
          <label className="field-label">Branch Name</label>
          <input
            className="input"
            placeholder="e.g. Cairo"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="field">
          <label className="field-label">Code</label>
          <input
            className="input"
            placeholder="e.g. CAI"
            maxLength={6}
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Address</label>
          <input
            className="input"
            placeholder="e.g. Nasr City, Cairo"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        {error && <p className="field-error" style={{ gridColumn: '1 / -1' }}>{error}</p>}
        <button className="btn btn-secondary" type="submit" disabled={saving} style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
          <Plus size={16} /> {saving ? 'Adding…' : 'Add Branch'}
        </button>
      </form>

      {!loading && branches.length > 0 && (
        <div className="mt-4 flex-col gap-2" style={{ display: 'flex' }}>
          {branches.map((b) => (
            <div key={b.id} className="card card-pad flex items-center justify-between" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
              <BranchDot branch={b} />
              <button className="btn btn-ghost btn-icon btn-sm" title="Remove" onClick={() => handleDelete(b.id)}>
                <Trash2 size={15} color="var(--danger-500)" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary w-full mt-4"
        disabled={branches.length === 0}
        onClick={onNext}
        style={{ justifyContent: 'center' }}
      >
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}
