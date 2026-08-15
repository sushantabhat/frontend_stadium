import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiBaseUrl() {
  const debuggerHost = Constants.expoConfig?.hostUri;
  let apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    const port = process.env.EXPO_PUBLIC_API_URL ? process.env.EXPO_PUBLIC_API_URL.split(':').pop() : '5001';
    apiUrl = `http://${ip}:${port}`;
  }

  console.log('API Base URL resolved to:', apiUrl);
  return apiUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const ROLES = {
  USER: 'user',
  STAFF: 'staff',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
};

export const STORAGE_KEYS = {
  TOKEN: 'smart_stadium_token',
  USER: 'smart_stadium_user',
  ACTIVE_ROLE: 'smart_stadium_active_role',
  BACKGROUND_MODE: 'smart_stadium_background_mode',
};
