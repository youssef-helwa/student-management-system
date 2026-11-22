// Tracks which "was absent last session" notifications a user has already
// dismissed, so the popup (spec: Attendance Notifications §5) doesn't nag
// them again for the same absence — but does resurface if the student
// racks up a *new* absence after that point.
//
// UI-only: keyed in localStorage by student, storing the date of the
// absence that was last acknowledged. A real backend could track this
// per-user instead, but for a single front-desk device this is enough.

const STORAGE_KEY = 'sms.absenceAck.v1';

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable — notification will simply reappear each time.
  }
}

// Returns true if this exact absence (studentId + absenceDate) has already
// been acknowledged by the user.
export function isAbsenceAcknowledged(studentId, absenceDate) {
  const store = readStore();
  return store[studentId] === absenceDate;
}

// Marks this absence as seen/dismissed.
export function acknowledgeAbsence(studentId, absenceDate) {
  const store = readStore();
  store[studentId] = absenceDate;
  writeStore(store);
}
