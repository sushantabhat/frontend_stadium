import api from './api';

export async function fetchAdminAnalytics() {
  const response = await api.get('/api/admin/analytics');
  return response.data.analytics;
}

export async function fetchFraudLogs() {
  const response = await api.get('/api/admin/fraud-logs');
  return response.data.fraudLogs;
}
