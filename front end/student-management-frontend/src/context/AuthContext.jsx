
import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return authService.getCurrentUser();
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Normal login
  async function login(credentials) {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      const loggedInUser = response.user;

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err?.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // First administrator setup
  function completeSetup(admin) {
    if (!admin) {
      throw new Error('Admin data is missing.');
    }

    localStorage.setItem('user', JSON.stringify(admin));
    setUser(admin);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      sessionStorage.removeItem('sms_branch');
      sessionStorage.removeItem('sms_user');
    }
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: !!user,
      login,
      completeSetup,
      logout,
      loading,
      error
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
