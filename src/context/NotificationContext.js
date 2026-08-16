import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from '../constants/config';
import { fetchUnreadCount as apiFetchUnreadCount } from '../services/notificationService';
import InAppToast from '../components/InAppToast';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { userInfo } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { unreadCount: count } = await apiFetchUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    if (!userInfo?.id) return;

    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.emit('join_user', userInfo.id);

    socket.on('new_notification', (notification) => {
      setUnreadCount(prev => prev + 1);
      setToastNotification(notification);
    });

    refreshUnreadCount();

    return () => {
      socket.emit('leave_user', userInfo.id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userInfo?.id, refreshUnreadCount]);

  const value = useMemo(() => ({
    unreadCount,
    refreshUnreadCount,
  }), [unreadCount, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toastNotification && (
        <InAppToast
          notification={toastNotification}
          onDismiss={() => setToastNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}
