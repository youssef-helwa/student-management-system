import { CURRENCY } from './constants';

export function formatDate(isoString, options) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', options ?? { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return `${formatDate(isoString)} · ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return `${CURRENCY} ${Number(amount).toLocaleString('en-US')}`;
}

export function initials(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
