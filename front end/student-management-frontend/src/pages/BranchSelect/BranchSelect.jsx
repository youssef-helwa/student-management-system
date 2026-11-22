import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { LoadingState } from '../../components/common/States';
import { ROLES } from '../../utils/constants';
import { PATHS } from '../../router/paths';

export default function BranchSelect() {
  const { user } = useAuth();
  const { accessibleBranches, setActiveBranch, loading } = useBranch();
  const navigate = useNavigate();

  const isAdminWithNoBranches = user?.role === ROLES.ADMIN && accessibleBranches.length === 0;

  // First-time admin, nothing to pick yet — send them straight into the
  // console to add the center's first branch instead of a dead end here.
  useEffect(() => {
    if (!loading && isAdminWithNoBranches) {
      navigate(PATHS.branches, { replace: true });
    }
  }, [loading, isAdminWithNoBranches, navigate]);

  function choose(branch) {
    setActiveBranch(branch);
    navigate('/app/dashboard');
  }

  if (!loading && isAdminWithNoBranches) {
    return <AuthLayout wide><LoadingState label="Taking you to your console…" /></AuthLayout>;
  }

  return (
    <AuthLayout wide>
      <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 4 }}>Choose a branch</h2>
      <p className="text-secondary mb-4">Select the branch you want to work with. You can switch branches later from the top bar.</p>

      {loading ? (
        <LoadingState label="Loading branches…" />
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {accessibleBranches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => choose(branch)}
              className="card card-pad flex items-center gap-3"
              style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-default)' }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: branch.color, color: '#fff', flexShrink: 0 }}
              >
                <MapPin size={19} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{branch.name}</div>
                <div className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>{branch.address}</div>
              </div>
              <ArrowRight size={16} className="text-tertiary" />
            </button>
          ))}
        </div>
      )}

      {!loading && accessibleBranches.length === 0 && (
        <p className="text-secondary">You don't have access to any branches yet. Contact an administrator.</p>
      )}
    </AuthLayout>
  );
}
