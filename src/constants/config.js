export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.69:5001';

export const ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const STORAGE_KEYS = {
  TOKEN: 'smart_stadium_token',
  USER: 'smart_stadium_user',
  ACTIVE_ROLE: 'smart_stadium_active_role',
};
