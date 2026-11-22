import { ROLES, ACTIONS, PERMISSION_PAGES } from './constants';

// Default permission matrix shown in the User Permissions screen.
// This is UI-only demonstration data — the backend is the source of truth
// for real authorization decisions.
export function buildDefaultPermissionMatrix() {
  const matrix = {};
  Object.values(ROLES).forEach((role) => {
    matrix[role] = {};
    PERMISSION_PAGES.forEach((page) => {
      matrix[role][page] = {};
      ACTIONS.forEach((action) => {
        if (role === ROLES.ADMIN) {
          matrix[role][page][action] = true;
        } else if (role === ROLES.MANAGER) {
          matrix[role][page][action] = action !== 'Delete';
        } else {
          matrix[role][page][action] = action === 'View';
        }
      });
    });
  });
  return matrix;
}

export function canAccessBranch(user, branchId) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  return (user.allowedBranches || []).includes(branchId);
}

// Expense module permissions (see Daily Financial Management spec §8).
export function canAddExpense(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER || user?.role === ROLES.USER;
}

export function canEditExpense(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}

export function canDeleteExpense(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}

// Regular Users only ever see the expenses they created themselves.
export function canViewAllExpenses(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}

export function canAccessFinancialReports(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}

export function canSendReportsManually(user) {
  return user?.role === ROLES.ADMIN;
}

// Follow-Up Reminders: any staff member can create/complete/snooze
// reminders (their own or others'); deleting one outright is reserved
// for Admin and Manager, same tier as expense edit/delete.
export function canManageFollowUps() {
  return true;
}

export function canDeleteFollowUp(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}

// Matches the backend: DELETE /notifications/:id is Admin + Manager only.
export function canDeleteNotification(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}
