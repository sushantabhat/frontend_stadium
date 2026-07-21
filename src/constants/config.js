import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiBaseUrl() {
  return 'http://192.168.1.114:5009';
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
