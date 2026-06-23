import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiBaseUrl() {
  try {
    const envUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
    if (envUrl && envUrl !== '') return envUrl;
  } catch {}

  try {
    const manifest = Constants?.manifest ?? Constants?.expoConfig ?? null;
    const debuggerHost = manifest?.debuggerHost
      || manifest?.hostUri
      || manifest?.extra?.expoGo?.debuggerHost;

    if (debuggerHost) {
      const host = debuggerHost.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5009`;
      }
    }
  } catch {}

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5009';
  }

  return 'http://localhost:5009';
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
