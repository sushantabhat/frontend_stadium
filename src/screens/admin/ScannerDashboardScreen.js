import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchAdminAnalytics, fetchUsers } from '../../services/adminService';
import { fetchScanHistory } from '../../services/ticketService';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

const GATE_LABELS = ['Gate A — Main', 'Gate B — North', 'Gate C — South', 'Gate D — VIP', 'Gate E — Staff'];

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function gateStatus(staff) {
  if (staff.status === 'suspended') return { label: 'Offline', color: glass.statusDangerText, border: 'rgba(255,23,68,0.25)' };
  if (staff.role === 'staff') return { label: 'Online', color: glass.statusSuccessText, border: 'rgba(0,230,118,0.2)' };
  return { label: 'Standby', color: glass.statusWarningText, border: 'rgba(255,179,0,0.2)' };
}

export default function ScannerDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);

  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const [staff, setStaff] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const [stats, users, scans] = await Promise.all([
        fetchAdminAnalytics(),
        fetchUsers(),
        fetchScanHistory(),
      ]);
      setAnalytics(stats);
      setStaff(users.filter((u) => ['staff', 'supervisor'].includes(u.role)));
      setScanLogs(scans || []);
    } catch (e) {
      console.log('Scanner dashboard error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadData(true));

  const gates = useMemo(() => {
    const scannedToday = analytics?.attendance?.scannedTickets || scanLogs.length;
    const entryRate = analytics?.attendance?.entryRate || '98.4';
    const pool = staff.length > 0 ? staff : [{ name: 'Gate Staff', status: 'active', role: 'staff', _id: 'default' }];

    return pool.slice(0, 5).map((member, idx) => {
      const gateScans = Math.max(0, Math.round(scannedToday / Math.max(pool.length, 1)));
      const status = gateStatus(member);
      return {
        id: member._id || String(idx),
        name: GATE_LABELS[idx] || `Gate ${String.fromCharCode(65 + idx)}`,
        venue: member.venue || 'Stadium Arena',
        status,
        scanned: gateScans,
        staff: member.name,
        initials: getInitials(member.name),
      };
    });
  }, [staff, analytics, scanLogs]);

  const statusCounts = useMemo(() => {
    const online = gates.filter((g) => g.status.label === 'Online').length;
    const standby = gates.filter((g) => g.status.label === 'Standby').length;
    const offline = gates.filter((g) => g.status.label === 'Offline').length;
    return { online, standby, offline };
  }, [gates]);

  const scannedToday = analytics?.attendance?.scannedTickets || scanLogs.length;
  const acceptanceRate = analytics?.attendance?.entryRate || '98.4';

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={isRefreshing} />
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="MONITORING"
          title="Scanners"
          avatarColors={['#FFD700', '#FFA000']}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('AdminProfile')}
        />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />
        }
      >

        <Text style={styles.heroLabel}>TICKETS SCANNED TODAY</Text>
        {isLoading ? (
          <ActivityIndicator color={glass.brandPurple} style={{ marginBottom: spacing.xl }} />
        ) : (
          <Text style={styles.heroValue}>{scannedToday.toLocaleString()}</Text>
        )}
        <Text style={styles.heroSub}>↗ {acceptanceRate}% acceptance rate</Text>

        <View style={styles.statusRow}>
          {[
            { label: 'Online', value: statusCounts.online, color: glass.statusSuccessText },
            { label: 'Standby', value: statusCounts.standby, color: glass.statusWarningText },
            { label: 'Offline', value: statusCounts.offline, color: glass.statusDangerText },
          ].map((item) => (
            <View key={item.label} style={[styles.statusPill, { borderColor: `${item.color}33` }]}>
              <Text style={[styles.statusPillValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statusPillLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loading}><ActivityIndicator color={glass.brandPurple} /></View>
        ) : (
          gates.map((gate) => (
            <View key={gate.id} style={styles.gateCard}>
              <View style={styles.gateHeader}>
                <View style={styles.gateHeaderLeft}>
                  <Text style={styles.gateName}>{gate.name}</Text>
                  <Text style={styles.gateVenue}>📍 {gate.venue}</Text>
                </View>
                <View style={[styles.gateBadge, { backgroundColor: `${gate.status.color}18` }]}>
                  <Text style={[styles.gateBadgeText, { color: gate.status.color }]}>{gate.status.label}</Text>
                </View>
              </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>SCANNED</Text>
                    <Text style={styles.metricValue}>{gate.scanned.toLocaleString()}</Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>RATE</Text>
                    <Text style={styles.metricValue}>{acceptanceRate}%</Text>
                  </View>
                </View>

              <View style={styles.gateFooter}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffInitials}>{gate.initials}</Text>
                </View>
                <Text style={styles.staffName}>{gate.staff}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },
  heroLabel: {
    color: glass.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  heroValue: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  heroSub: {
    color: glass.occupancyTeal,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  statusRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statusPill: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    backgroundColor: glass.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statusPillValue: { fontSize: typography.h3.fontSize, fontWeight: '900' },
  statusPillLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  loading: { paddingVertical: spacing.xxl, alignItems: 'center' },
  gateCard: {
    backgroundColor: glass.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  gateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  gateHeaderLeft: { flex: 1 },
  gateName: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: 4 },
  gateVenue: { color: glass.textMuted, fontSize: typography.small.fontSize },
  gateBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.full },
  gateBadgeText: { fontSize: 10, fontWeight: '800' },
  metricsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  metricCol: { flex: 1 },
  metricColWide: { flex: 1.4 },
  metricLabel: { color: glass.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.xs },
  metricValue: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '900' },
  batteryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  batteryTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  batteryFill: { height: '100%', backgroundColor: glass.occupancyTeal, borderRadius: 2 },
  batteryText: { color: glass.textSecondary, fontSize: typography.small.fontSize, fontWeight: '700', minWidth: 34 },
  gateFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: glass.border, paddingTop: spacing.md },
  staffAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: glass.brandPurpleSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitials: { color: glass.brandPurple, fontSize: 10, fontWeight: '800' },
  staffName: { color: glass.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '600' },
});
