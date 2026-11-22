import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import * as gradeService from '../../services/gradeService';
import { CURRENCY } from '../../utils/constants';
import { useBranch } from '../../context/BranchContext';

export default function FeesStep({ onNext, onBack }) {
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState({});
  const [savedIds, setSavedIds] = useState({});
  const [loading, setLoading] = useState(true);
  const { activeBranch } = useBranch();

  useEffect(() => {
  if (!activeBranch?.id) return;

  const loadData = async () => {
    try {
      const [gradesData, feesData] = await Promise.all([
        gradeService.getGrades({ branchId: activeBranch.id }),
        gradeService.getGradeFees({ branchId: activeBranch.id }),
      ]);

      setGrades(gradesData);
      setFees(feesData);
    } catch (error) {
      console.error("Failed to load fees:", error);
    }
  };

  loadData();
}, [activeBranch?.id]);

  async function handleSave(gradeId) {
    const value = Number(fees[gradeId]);
    if (Number.isNaN(value) || value < 0) return;
    await gradeService.setGradeFee(gradeId, value);
    setSavedIds((s) => ({ ...s, [gradeId]: true }));
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>Set session fees</h2>
      <p className="text-secondary mb-4">
        Set the standard per-session fee for each grade. This step is optional — you can change these anytime from Payments.
      </p>

      {!loading && (
        <div className="flex-col gap-2" style={{ display: 'flex' }}>
          {grades.map((g) => (
            <div key={g.id} className="card card-pad flex items-center gap-3" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
              <div style={{ flex: 1, fontWeight: 600 }}>{g.name}</div>
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  style={{ width: 110 }}
                  value={fees[g.id] ?? ''}
                  onChange={(e) => {
                    setFees((f) => ({ ...f, [g.id]: e.target.value }));
                    setSavedIds((s) => ({ ...s, [g.id]: false }));
                  }}
                />
                <span className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>{CURRENCY}</span>
                <button
                  type="button"
                  className={`btn btn-sm ${savedIds[g.id] ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleSave(g.id)}
                  disabled={fees[g.id] === undefined || fees[g.id] === ''}
                >
                  {savedIds[g.id] ? <Check size={14} /> : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button className="btn btn-secondary" onClick={onBack} style={{ justifyContent: 'center' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary" onClick={onNext} style={{ flex: 1, justifyContent: 'center' }}>
          Finish Setup <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
