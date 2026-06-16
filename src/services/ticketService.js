import api from './api';

export async function fetchMyTickets() {
  const response = await api.get('/api/tickets/my-tickets');
  return response.data.tickets;
}

export async function verifyTicketCode(ticketCode) {
  const response = await api.post('/api/tickets/verify', { ticketCode });
  return response.data;
}

export async function fetchScanHistory() {
  const response = await api.get('/api/tickets/scan-history');
  return response.data.history;
}
