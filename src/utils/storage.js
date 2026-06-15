import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export async function saveSession(token, user) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.TOKEN, token],
    [STORAGE_KEYS.USER, JSON.stringify(user)],
    [STORAGE_KEYS.ACTIVE_ROLE, user?.role || ''],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.ACTIVE_ROLE,
  ]);
}

export async function loadSession() {
  const [[, token], [, userJson], [, activeRole]] = await AsyncStorage.multiGet([
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.ACTIVE_ROLE,
  ]);

  if (!token || !userJson) {
    return null;
  }

  return {
    token,
    user: JSON.parse(userJson),
    activeRole: activeRole || null,
  };
}
