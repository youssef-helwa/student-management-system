import { ROLES } from './constants';

// Administrators and Managers can always browse every day's data.
// Everyone else only ever sees today's entries — once the calendar date
// changes, anything from a previous day simply won't show up anymore
// the next time they open the app.
export function canViewFullHistory(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// Filters a list of records down to just today's, unless the user is
// allowed to see full history. `dateKey` is the field holding the
// record's date (e.g. 'date').
export function scopeToToday(records, dateKey, user) {
  if (!records) return records;
  if (canViewFullHistory(user)) return records;
  const today = todayString();
  return records.filter((r) => r?.[dateKey] === today);
}
