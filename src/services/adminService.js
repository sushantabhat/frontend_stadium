import api from './api';

export async function fetchAdminAnalytics() {
  const response = await api.get('/api/admin/analytics');
  return response.data.analytics;
}

export async function fetchFraudLogs(status) {
  const params = status ? { status } : {};
  const response = await api.get('/api/admin/fraud-logs', { params });
  return response.data.fraudLogs;
}

export async function fetchFraudLogById(id) {
  const response = await api.get(`/api/admin/fraud-logs/${id}`);
  return response.data.fraudLog;
}

export async function fetchFraudLogAttendance(id) {
  const response = await api.get(`/api/admin/fraud-logs/${id}/attendance`);
  return response.data.attendanceLogs;
}

export async function resolveFraudLog(id, resolution, notes) {
  const response = await api.put(`/api/admin/fraud-logs/${id}/resolve`, { resolution, notes });
  return response.data;
}

export async function escalateFraudLog(id, notes) {
  const response = await api.put(`/api/admin/fraud-logs/${id}/escalate`, { notes });
  return response.data;
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

/* ── Staff Shift Management ── */

export async function fetchShifts(params) {
  const response = await api.get('/api/shifts', { params });
  return response.data.shifts;
}

export async function createShift({ staff, match, gate, date }) {
  const response = await api.post('/api/shifts', { staff, match, gate, date });
  return response.data;
}

export async function deleteShift(id) {
  const response = await api.delete(`/api/shifts/${id}`);
  return response.data;
}

export async function fetchGateStats(matchId) {
  const response = await api.get(`/api/shifts/gate-stats/${matchId}`);
  return response.data.gates;
}
