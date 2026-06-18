import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TicketProHeader, { AdminCard, AdminFilterPills } from '../../components/admin/TicketProHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchScanHistory } from '../../services/ticketService';
import { fetchFraudLogs } from '../../services/adminService';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'valid', label: 'Valid' },
  { key: 'used', label: 'Used' },
  { key: 'refunded', label: 'Refunded' },
];

const TIER_COLORS = { vip: '#FFD700', category1: '#FFD700', category2: '#FF6B6B', category3: '#A29BFE', category4: '#EF5350', supporters: '#81C784', premium: glass.brandPurple, general: '#4F8EF7' };
const TIER_LABELS = { vip: 'VIP', category1: 'Category 1', category2: 'Category 2', category3: 'Category 3', category4: 'Category 4', supporters: 'Supporters', premium: 'Premium', general: 'Standard' };

const STATUS_MAP = {
  valid: { label: 'Valid', color: glass.statusSuccessText, bg: glass.statusSuccessFill },
  used: { label: 'Used', color: glass.textMuted, bg: 'rgba(255,255,255,0.06)' },
  refunded: { label: 'Refunded', color: glass.statusDangerText, bg: glass.statusDangerFill },
  duplicate: { label: 'Refunded', color: glass.statusDangerText, bg: glass.statusDangerFill },
  invalid: { label: 'Used', color: glass.textMuted, bg: 'rgba(255,255,255,0.06)' },
};

function normalizeTicket(log, index) {
  const category = log.seat?.category || log.category || 'general';
  const statusKey = log.status === 'duplicate' || log.reason === 'duplicate_scan'
    ? 'refunded'
    : log.status === 'invalid' || log.reason === 'fake_signature'
      ? 'used'
      : log.status === 'used'
        ? 'used'
        : 'valid';

  return {
    id: log._id || log.id || String(index),
    code: log.ticketCode || `TK-${String(88400 + index)}`,
    statusKey,
    price: log.seat?.price || log.price || 0,
    title: log.match?.title || log.matchTitle || 'Event',
    seat: log.seat?.seatLabel || log.seatLabel || '—',
    category,
    userName: log.user?.name || log.staff || 'Guest',
    userInitials: (log.user?.name || log.staff || 'G').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
  };
}

export default function TicketValidationScreen() {
  const [scanLogs, setScanLogs] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [scans, frauds] = await Promise.all([fetchScanHistory(), fetchFraudLogs()]);
      setScanLogs(scans || []);
      setFraudLogs(frauds || []);
    } catch (err) {
      console.log('Ticket data error:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const tickets = useMemo(() => {
    const fromScans = scanLogs.map((log, i) => normalizeTicket(log, i));
    const fromFraud = fraudLogs.map((log, i) => normalizeTicket({
      ...log,
      ticketCode: log.ticket?.ticketCode || log.ticketCode,
      seat: log.ticket?.seat,
      match: log.match,
      user: log.ticket?.user,
      status: log.reason === 'duplicate_scan' ? 'duplicate' : 'invalid',
    }, fromScans.length + i));

    const merged = [...fromScans, ...fromFraud];
    if (merged.length === 0) return [];

    if (activeFilter === 'all') return merged;
    return merged.filter((t) => t.statusKey === activeFilter);
  }, [scanLogs, fraudLogs, activeFilter]);

  const renderTicket = ({ item }) => {
    const status = STATUS_MAP[item.statusKey] || STATUS_MAP.valid;
    const tierColor = TIER_COLORS[item.category] || TIER_COLORS.general;

    return (
      <AdminCard style={styles.ticketCard}>
        <View style={styles.ticketTop}>
          <View style={styles.ticketTopLeft}>
            <Text style={styles.ticketCode}>{item.code}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.ticketPrice}>Rs.{item.price.toLocaleString()}</Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.seatLine}>
          § {item.category?.toUpperCase()} · Seat {item.seat}
          <Text style={[styles.tier, { color: tierColor }]}> · {TIER_LABELS[item.category] || 'Standard'}</Text>
        </Text>

        <View style={styles.ticketFooter}>
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>{item.userInitials}</Text>
            </View>
            <Text style={styles.userName}>{item.userName}</Text>
          </View>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.menuIcon}>···</Text>
          </TouchableOpacity>
        </View>
      </AdminCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <TicketProHeader showLive />
            <Text style={styles.eyebrow}>MANAGEMENT</Text>
            <Text style={styles.pageTitle}>Tickets</Text>
            <AdminFilterPills options={FILTERS} value={activeFilter} onChange={setActiveFilter} />
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} tintColor={glass.brandPurple} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}><ActivityIndicator color={glass.brandPurple} /></View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No tickets yet</Text>
              <Text style={styles.emptyDesc}>Ticket scan events will appear here.</Text>
            </View>
          )
        }
        renderItem={renderTicket}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },
  eyebrow: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: spacing.xs },
  pageTitle: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', letterSpacing: -0.4, marginBottom: spacing.lg },
  ticketCard: { padding: spacing.xl, marginBottom: spacing.md },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  ticketTopLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  ticketCode: { color: glass.brandPurple, fontSize: typography.captionMedium.fontSize, fontWeight: '800' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  ticketPrice: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900' },
  eventTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  seatLine: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.lg },
  tier: { fontWeight: '700' },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: glass.border, paddingTop: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: glass.brandPurpleSurface, alignItems: 'center', justifyContent: 'center' },
  userInitials: { color: glass.brandPurple, fontSize: 9, fontWeight: '800' },
  userName: { color: glass.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '600' },
  menuIcon: { color: glass.textMuted, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  center: { paddingVertical: spacing.xxl, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  emptyDesc: { color: glass.textMuted, fontSize: typography.caption.fontSize },
});
