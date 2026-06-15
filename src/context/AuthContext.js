import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { setAuthToken } from '../services/api';
import { clearSession, loadSession, saveSession } from '../utils/storage';
import { getAllowedRoles } from '../constants/roleNavigation';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const normalizeUser = useCallback((user, activeRole) => {
    const availableRoles = getAllowedRoles(user);
    const resolvedRole = activeRole && availableRoles.includes(activeRole) ? activeRole : user?.role;

    return {
      ...user,
      role: resolvedRole,
      availableRoles,
    };
  }, []);

  const applySession = useCallback(async (token, user, activeRole) => {
    const normalizedUser = normalizeUser(user, activeRole || user?.role);
    setAuthToken(token);
    setUserToken(token);
    setUserInfo(normalizedUser);
    await saveSession(token, normalizedUser);
  }, [normalizeUser]);

  const clearAuthState = useCallback(async () => {
    setAuthToken(null);
    setUserToken(null);
    setUserInfo(null);
    await clearSession();
  }, []);

  useEffect(() => {
    async function restoreSession() {
      try {
        const session = await loadSession();
        if (!session) {
          return;
        }

        setAuthToken(session.token);
        const user = await authService.fetchCurrentUser();
        await applySession(session.token, user, session.activeRole);
      } catch {
        await clearAuthState();
      } finally {
        setIsBootstrapping(false);
      }
    }

    restoreSession();
  }, [applySession, clearAuthState]);

  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      try {
        const data = await authService.loginUser({ email, password });
        await applySession(data.token, data.user);
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applySession]
  );

  const register = useCallback(
    async (name, email, password) => {
      setIsLoading(true);
      try {
        const data = await authService.registerUser({ name, email, password });
        await applySession(data.token, data.user);
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      login,
      register,
      logout,
      isLoading,
      isBootstrapping,
      userToken,
      userInfo,
    }),
    [login, register, logout, isLoading, isBootstrapping, userToken, userInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
