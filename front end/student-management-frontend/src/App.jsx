import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login/Login';
import CreateAdministrator from './pages/Setup/CreateAdministrator';
import SetupWizard from './pages/Setup/SetupWizard';
import BranchSelect from './pages/BranchSelect/BranchSelect';
import Dashboard from './pages/Dashboard/Dashboard';
import StudentsList from './pages/Students/StudentsList';
import StudentDetails from './pages/Students/StudentDetails';
import Branches from './pages/Branches/Branches';
import GradesClasses from './pages/GradesClasses/GradesClasses';
import Attendance from './pages/Attendance/Attendance';
import ExamList from './pages/Exams/ExamList';
import ExamDetails from './pages/Exams/ExamDetails';
import Results from './pages/Results/Results';
import Payments from './pages/Payments/Payments';
import Expenses from './pages/Expenses/Expenses';
import Reports from './pages/Reports/Reports';
import Notifications from './pages/Notifications/Notifications';
import UserManagement from './pages/Users/UserManagement';
import Settings from './pages/Settings/Settings';
import ActivityLog from './pages/ActivityLog/ActivityLog';
import EndOfDaySummary from './pages/EndOfDaySummary/EndOfDaySummary';
import FollowUps from './pages/FollowUps/FollowUps';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/constants';
import { getSetupStatus } from './services/authService';
import { SetupStatusContext } from './context/SetupStatusContext';
import { PATHS } from './router/paths';
import { LoadingState } from './components/common/States';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Blocks direct navigation to a role-restricted route (not just hiding
// it from the sidebar) — e.g. a Regular User typing /app/reports in the
// address bar gets sent back to the dashboard instead of seeing the page.
function RequireRole({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/app/dashboard" replace />;
}

// Sends a visitor to the right place for the current setup state:
// the Create Administrator page while no admin exists yet, or straight
// back to Login once it does (and vice versa if they try the other one).
function RequireSetupState({ requireSetup, setupRequired, children }) {
  if (setupRequired === requireSetup) return children;
  return <Navigate to={setupRequired ? PATHS.setup : PATHS.login} replace />;
}

export default function App() {
  // null = still checking with the backend, true/false = known.
  const [setupRequired, setSetupRequired] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSetupStatus()
      .then((res) => {
        if (!cancelled) setSetupRequired(!!res?.setupRequired);
      })
      .catch(() => {
        // If the check itself can't be reached, don't lock the app on a
        // blank screen — fall back to the normal login flow.
        if (!cancelled) setSetupRequired(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (setupRequired === null) {
    return (
      <div style={{ height: '100vh' }}>
        <LoadingState label="Starting up…" />
      </div>
    );
  }

  return (
    <SetupStatusContext.Provider
      value={{ setupRequired, markSetupComplete: () => setSetupRequired(false) }}
    >
      <Routes>
        <Route
          path="/setup"
          element={
            <RequireSetupState requireSetup setupRequired={setupRequired}>
              <CreateAdministrator />
            </RequireSetupState>
          }
        />
        <Route
          path="/setup/wizard"
          element={
            <RequireSetupState requireSetup setupRequired={setupRequired}>
              <SetupWizard />
            </RequireSetupState>
          }
        />
        <Route
          path="/login"
          element={
            <RequireSetupState requireSetup={false} setupRequired={setupRequired}>
              <Login />
            </RequireSetupState>
          }
        />
        <Route
          path="/select-branch"
          element={
            <RequireAuth>
              <BranchSelect />
            </RequireAuth>
          }
        />

        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="branches"
            element={
              <RequireRole roles={[ROLES.ADMIN]}>
                <Branches />
              </RequireRole>
            }
          />
          <Route path="students" element={<StudentsList />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route
            path="grades-classes"
            element={
              <RequireRole roles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <GradesClasses />
              </RequireRole>
            }
          />
          <Route path="attendance" element={<Attendance />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="exams/:id" element={<ExamDetails />} />
          <Route path="results" element={<Results />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<RequireRole roles={[ROLES.ADMIN, ROLES.MANAGER]}><Reports /></RequireRole>} />
          <Route path="end-of-day" element={<RequireRole roles={[ROLES.ADMIN, ROLES.MANAGER]}><EndOfDaySummary /></RequireRole>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="users" element={<RequireRole roles={[ROLES.ADMIN, ROLES.MANAGER]}><UserManagement /></RequireRole>} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to={setupRequired ? PATHS.setup : PATHS.login} replace />} />
        <Route path="*" element={<Navigate to={setupRequired ? PATHS.setup : PATHS.login} replace />} />
      </Routes>
    </SetupStatusContext.Provider>
  );
}
