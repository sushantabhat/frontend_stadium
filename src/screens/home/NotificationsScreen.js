import React, { useCallback, useContext, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, CheckCircle, XCircle, Ticket, Info } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationService';
import { NotificationContext } from '../../context/NotificationContext';
import ScreenHeader from '../../components/ScreenHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

const TYPE_CONFIG = {
  refund_processing: { Icon: Clock, color: '#FFD93D', bg: 'rgba(255,217,61,0.12)' },
  refund_completed: { Icon: CheckCircle, color: '#A29BFE', bg: 'rgba(162,155,254,0.12)' },
  match_cancelled: { Icon: XCircle, color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  booking_confirmed: { Icon: Ticket, color: '#69F0AE', bg: 'rgba(105,240,174,0.12)' },
  general: { Icon: Info, color: colors.textMuted, bg: 'rgba(255,255,255,0.06)' },
};

export default function NotificationsScreen({ navigation }) {
  const { refreshUnreadCount } = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  const { refreshing, onRefresh } = useRefresh(() => load(true));

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshUnreadCount();
    } catch {}
  };

  const handleTap = async (item) => {
    if (!item.read) {
      try {
        await markNotificationRead(item._id);
        setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, read: true } : n));
        refreshUnreadCount();
      } catch {}
    }
    if (item.data?.matchId) {
      // Could navigate to match detail if needed
    }
  };

  const renderNotification = useCallback(({ item }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifUnread]}
        onPress={() => handleTap(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
          <config.Icon size={18} color={config.color} strokeWidth={2} />
        </View>
        <View style={styles.notifBody}>
          <View style={styles.notifTop}>
            <Text style={[styles.notifTitle, !item.read && { color: colors.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.readAllBtn} onPress={handleReadAll}>
            <Text style={styles.readAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyText}>You're all caught up</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxxl },
  readAllBtn: {
    alignSelf: 'flex-end', marginHorizontal: spacing.xl, marginBottom: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: 'rgba(108,92,231,0.12)', borderRadius: radii.full,
  },
  readAllText: { color: colors.primaryLight, fontSize: typography.small.fontSize, fontWeight: '700' },
  notifCard: {
    flexDirection: 'row', marginHorizontal: spacing.xl, marginBottom: spacing.md,
    padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  notifUnread: { borderColor: '#FF4757', backgroundColor: 'rgba(255,71,87,0.06)' },
  notifIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  notifIconText: { fontSize: 18 },
  notifBody: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  notifTitle: { color: colors.textSecondary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' },
  notifMessage: { color: colors.textMuted, fontSize: typography.small.fontSize, lineHeight: 18, marginBottom: spacing.xs },
  notifTime: { color: colors.textMuted, fontSize: typography.tiny?.fontSize || 10, opacity: 0.6 },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 40, marginBottom: spacing.lg, opacity: 0.4 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700', marginBottom: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize },
});
