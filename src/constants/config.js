import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl !== '') return envUrl;

  const debuggerHost = Constants.manifest?.debuggerHost
    || Constants.manifest?.hostUri
    || Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5001`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }

  return 'http://localhost:5001';
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
};
