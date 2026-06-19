export const NEPAL_TIMEZONE = 'Asia/Kathmandu';
export const LOCALE = 'en-US';

function toDate(input) {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatInNepal(input, options = {}) {
  const d = toDate(input);
  if (!d) return '—';
  try {
    return d.toLocaleDateString(LOCALE, { timeZone: NEPAL_TIMEZONE, ...options });
  } catch {
    return '—';
  }
}

export function formatTimeInNepal(input, options = {}) {
  const d = toDate(input);
  if (!d) return '—';
  try {
    return d.toLocaleTimeString(LOCALE, { timeZone: NEPAL_TIMEZONE, ...options });
  } catch {
    return '—';
  }
}

export function formatMatchDate(dateString) {
  const d = toDate(dateString);
  if (!d) return 'Date TBD';
  return formatInNepal(d, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status) {
  switch (status) {
    case 'live':
      return '#22C55E';
    case 'upcoming':
      return '#3B82F6';
    case 'completed':
      return '#94A3B8';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#94A3B8';
  }
}
