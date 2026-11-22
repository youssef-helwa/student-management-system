import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { LoadingState } from '../components/common/States';
import { ROLES } from '../utils/constants';

export default function MainLayout() {
  const { isAuthenticated, user } = useAuth();
  const { activeBranch, loading } = useBranch();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (loading) return <div className="loading-screen" style={{ height: '100vh' }}><LoadingState label="Loading workspace…" /></div>;
  // Administrators can enter the console with no active branch — there's
  // nothing to pick right after the first admin account is created, and
  // they need to get in to add the center's first branch themselves.
  if (!activeBranch && user?.role !== ROLES.ADMIN) return <Navigate to="/select-branch" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
