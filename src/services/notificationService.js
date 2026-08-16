import api from './api';

export async function fetchNotifications() {
  const response = await api.get('/api/notifications');
  return response.data;
}

export async function fetchUnreadCount() {
  const response = await api.get('/api/notifications/unread-count');
  return response.data;
}

export async function markNotificationRead(notificationId) {
  const response = await api.patch(`/api/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch('/api/notifications/read-all');
  return response.data;
}
