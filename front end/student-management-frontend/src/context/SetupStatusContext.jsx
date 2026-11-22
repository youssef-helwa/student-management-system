import { createContext, useContext } from 'react';

// App.jsx checks GET /auth/setup-status exactly once when the app loads
// and keeps the result in memory for routing decisions. Once the wizard
// finishes, we flip that in-memory flag directly (via markSetupComplete)
// instead of re-hitting the backend, so the user can navigate straight
// to /login without the app bouncing them back to /setup.
export const SetupStatusContext = createContext({
  setupRequired: false,
  markSetupComplete: () => {},
});

export function useSetupStatus() {
  return useContext(SetupStatusContext);
}
