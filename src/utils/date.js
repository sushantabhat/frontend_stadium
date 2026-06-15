export function formatMatchDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date TBD';
  }

  return date.toLocaleString(undefined, {
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
