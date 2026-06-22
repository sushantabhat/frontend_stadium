import api from './api';

export async function lockSeats(matchId, seatIds) {
  const response = await api.post('/api/bookings/lock', { matchId, seatIds });
  return response.data;
}

export async function unlockSeats(matchId, seatIds) {
  const response = await api.post('/api/bookings/unlock', { matchId, seatIds });
  return response.data;
}

export async function confirmBooking(matchId, seatIds) {
  const response = await api.post('/api/bookings/confirm', { matchId, seatIds });
  return response.data;
}

export async function fetchMyBookings() {
  const response = await api.get('/api/bookings/my-bookings');
  return response.data.bookings;
}

export async function initiateKhaltiPayment(matchId, seatIds, amount) {
  const response = await api.post('/api/payments/khalti/init', { matchId, seatIds, amount });
  return response.data;
}

export async function verifyKhaltiPayment(pidx, matchId, seatIds) {
  const response = await api.post('/api/payments/khalti/verify', { pidx, matchId, seatIds });
  return response.data;
}

export async function initiateCardPayment(cardDetails) {
  const response = await api.post('/api/payments/card/init', cardDetails);
  return response.data;
}

export async function confirmCardBooking(transactionId, matchId, seatIds) {
  const response = await api.post('/api/payments/card/confirm', { transactionId, matchId, seatIds });
  return response.data;
}
