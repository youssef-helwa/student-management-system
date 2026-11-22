
import { useEffect, useState } from 'react';
import { CheckCircle2, LogIn } from 'lucide-react';

import * as branchService from '../../services/branchService';
import * as gradeService from '../../services/gradeService';
import * as classService from '../../services/classService';
import { useBranch } from '../../context/BranchContext';

export default function CompleteStep({ onFinish }) {
  const { activeBranch, branches } = useBranch();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  if (!activeBranch?.id) return;

  let isMounted = true;

  async function loadSummary() {
    try {
      setLoading(true);
      setError('');

      const [grades, classes, fees] = await Promise.all([
        gradeService.getGrades({ branchId: activeBranch.id }),
        classService.getClasses({ branchId: activeBranch.id }),
        gradeService.getGradeFees({ branchId: activeBranch.id }),
      ]);

      if (!isMounted) return;

      setSummary({
        branches: branches?.length || 0,
        grades: grades?.length || 0,
        classes: classes?.length || 0,
        fees: fees?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load setup summary:', err);

      if (isMounted) {
        setError(err.message || 'Failed to load setup summary');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  loadSummary();

  return () => {
    isMounted = false;
  };
}, [activeBranch?.id, branches]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--success-100)',
          color: 'var(--success-600)',
          margin: '0 auto var(--sp-4)',
        }}
      >
        <CheckCircle2 size={28} />
      </div>

      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>
        Setup complete
      </h2>

      <p className="text-secondary mb-4">
        Your center is ready to go. Here's what you've set up:
      </p>

      {loading && <p>Loading setup summary...</p>}

      {error && (
        <p className="text-danger mb-4">
          {error}
        </p>
      )}

      {summary && (
        <div
          className="grid-2"
          style={{
            gap: 'var(--sp-3)',
            textAlign: 'left',
            marginBottom: 'var(--sp-5)',
          }}
        >
          <SummaryRow label="Branches" value={summary.branches} />
          <SummaryRow label="Grades" value={summary.grades} />
          <SummaryRow label="Classes" value={summary.classes} />
          <SummaryRow label="Grade fees set" value={summary.fees} />
        </div>
      )}

      <button
        className="btn btn-primary w-full"
        onClick={onFinish}
        style={{ justifyContent: 'center' }}
      >
        <LogIn size={16} />
        Continue to Login
      </button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      className="card card-pad"
      style={{ padding: 'var(--sp-3) var(--sp-4)' }}
    >
      <div
        className="text-tertiary"
        style={{ fontSize: 'var(--fs-xs)' }}
      >
        {label}
      </div>

      <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
        {value}
      </div>
    </div>
  );
}
