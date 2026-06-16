import api from './api';

export async function lockSeats(matchId, seatIds) {
  const response = await api.post('/api/bookings/lock', { matchId, seatIds });
  return response.data;
}

export async function unlockSeats(matchId, seatIds) {
  const response = await api.post('/api/bookings/unlock', { matchId, seatIds });
  return response.data;
}

export async function confirmBooking(matchId, seatIds, totalAmount) {
  const response = await api.post('/api/bookings/confirm', { matchId, seatIds, totalAmount });
  return response.data;
}

export async function fetchMyBookings() {
  const response = await api.get('/api/bookings/my-bookings');
  return response.data.bookings;
}
