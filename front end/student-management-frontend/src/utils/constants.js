export const ROLES = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

export const ACTIONS = ['View', 'Create', 'Edit', 'Delete'];

// Every manageable page/module, used by the User Permissions screen to
// build the permission matrix (role/user x page x action).
export const PERMISSION_PAGES = [
  'Dashboard',
  'Students',
  'Grades & Classes',
  'Attendance',
  'Exams',
  'Results',
  'Payments',
  'Expenses',
  'Reports',
  'Notifications',
  'Follow-Ups',
  'Users',
  'Settings',
  'Activity Log',
];

// Predefined expense categories shown in the Expenses form.
export const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Electricity',
  'Water',
  'Internet',
  'Maintenance',
  'Equipment',
  'Transportation',
  'Marketing',
  'Teacher Salary',
  'Cleaning',
  'Rent',
  'Other',
];

export const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Card', 'Instapay', 'Other'];

export const EXPENSE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const CALL_RESULT_LABELS = {
  answered: 'Parent answered the call',
  no_answer: 'No answer',
  line_busy: 'Line busy',
  switched_off: 'Phone switched off / No signal',
  wrong_number: 'Wrong phone number',
  invalid_number: 'Invalid phone number',
  other: 'Other',
};

export const CURRENCY = 'EGP';
