import api from './api';

export async function fetchAdminAnalytics() {
  const response = await api.get('/api/admin/analytics');
  return response.data.analytics;
}

export async function fetchFraudLogs() {
  const response = await api.get('/api/admin/fraud-logs');
  return response.data.fraudLogs;
}

export async function fetchAllTickets() {
  const response = await api.get('/api/admin/tickets');
  return response.data.tickets;
}

export async function fetchUsers(role) {
  const params = role ? { role } : {};
  const response = await api.get('/api/admin/users', { params });
  return response.data.users;
}

export async function createUser({ name, email, password, role }) {
  const response = await api.post('/api/admin/users', { name, email, password, role });
  return response.data;
}

export async function updateUser(userId, updates) {
  const response = await api.put(`/api/admin/users/${userId}`, updates);
  return response.data;
}

export async function deleteUser(userId) {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
}
