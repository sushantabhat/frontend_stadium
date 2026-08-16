import React, { useCallback, useContext, useMemo, useState, useEffect } from 'react';
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
import { fetchAdminAnalytics, fetchUsers, fetchGateStats } from '../../services/adminService';
import { fetchScanHistory } from '../../services/ticketService';
import { fetchMatches } from '../../services/matchService';
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

  const [latestMatches, setLatestMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [gateStats, setGateStats] = useState([]);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const [stats, users, scans, matches] = await Promise.all([
        fetchAdminAnalytics(),
        fetchUsers(),
        fetchScanHistory(),
        fetchMatches(),
      ]);
      setAnalytics(stats);
      setStaff(users.filter((u) => ['staff', 'supervisor'].includes(u.role)));
      setScanLogs(scans || []);

      if (matches && matches.length > 0) {
        const top3 = matches.slice(0, 3);
        setLatestMatches(top3);
        if (!selectedMatchId && top3.length > 0) {
          setSelectedMatchId(top3[0]._id);
        }
      }
    } catch (e) {
      console.log('Scanner dashboard error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMatchId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  useEffect(() => {
    async function loadGates() {
      if (!selectedMatchId) return;
      try {
        const stats = await fetchGateStats(selectedMatchId);
        setGateStats(stats || []);
      } catch (e) {
        console.log('Error fetching gate stats:', e);
      }
    }
    loadGates();
  }, [selectedMatchId]);

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadData(true));

  const gates = useMemo(() => {
    if (gateStats.length === 0) return [];

    return gateStats.map((gs, idx) => {
      const isOnline = gs.status === 'active' || (gs.staff && gs.staff.length > 0);
      const isOffline = gs.scanned === 0 && (!gs.staff || gs.staff.length === 0);
      let statusLabel = 'Standby';
      let color = glass.statusWarningText;
      let border = 'rgba(255,179,0,0.2)';

      if (isOnline) {
        statusLabel = 'Online';
        color = glass.statusSuccessText;
        border = 'rgba(0,230,118,0.2)';
      } else if (isOffline) {
        statusLabel = 'Offline';
        color = glass.statusDangerText;
        border = 'rgba(255,23,68,0.25)';
      }

      return {
        id: gs.gate || String(idx),
        name: gs.gate || `Gate ${idx + 1}`,
        venue: 'Stadium Arena',
        status: { label: statusLabel, color, border },
        scanned: gs.scanned || 0,
        staff: gs.staff && gs.staff.length > 0 ? gs.staff.join(', ') : 'Unassigned',
        initials: getInitials(gs.staff && gs.staff.length > 0 ? gs.staff[0] : 'U'),
      };
    });
  }, [gateStats]);

  const statusCounts = useMemo(() => {
    const online = gates.filter((g) => g.status.label === 'Online').length;
    const standby = gates.filter((g) => g.status.label === 'Standby').length;
    const offline = gates.filter((g) => g.status.label === 'Offline').length;
    return { online, standby, offline };
  }, [gates]);

  const scannedToday = useMemo(() => {
    return gates.reduce((sum, g) => sum + g.scanned, 0);
  }, [gates]);
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
          onAvatarPress={() => navigation.navigate('Home', { screen: 'AdminProfile' })}
        />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />
        }
      >

        <View style={{ marginBottom: spacing.lg }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
            {latestMatches.map(m => (
              <TouchableOpacity
                key={m._id}
                onPress={() => setSelectedMatchId(m._id)}
                style={{
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.md,
                  borderRadius: radii.full,
                  backgroundColor: selectedMatchId === m._id ? glass.brandPurple : 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: selectedMatchId === m._id ? glass.brandPurple : glass.border,
                }}
              >
                <Text style={{ color: selectedMatchId === m._id ? '#FFF' : glass.textMuted, fontWeight: '600' }}>
                  {m.teamA} vs {m.teamB}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.heroLabel}>TICKETS SCANNED FOR MATCH</Text>
        {isLoading && gates.length === 0 ? (
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
