import api from './api';

export async function fetchAdminAnalytics() {
  const response = await api.get('/api/admin/analytics');
  return response.data.analytics;
}

export async function fetchFraudLogs() {
  const response = await api.get('/api/admin/fraud-logs');
  return response.data.fraudLogs;
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
