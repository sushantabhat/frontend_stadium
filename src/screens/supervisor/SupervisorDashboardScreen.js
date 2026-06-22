import React, { useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchFraudLogs } from '../../services/adminService';
import { fetchScanHistory } from '../../services/ticketService';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

/* ─── Gate labels (data sourced from live scan history) ─── */
const GATE_LABELS = ['Gate A — North', 'Gate B — South', 'Gate C — East', 'Gate D — West'];

/* ─── Severity color mapping ─── */
const SEVERITY = {
  critical: { bg: colors.dangerSurface, text: colors.danger, label: 'CRITICAL' },
  high:     { bg: colors.warningSurface, text: colors.warning, label: 'HIGH' },
  medium:   { bg: colors.warningSurface, text: colors.warning, label: 'MEDIUM' },
  low:      { bg: colors.successSurface, text: colors.success, label: 'LOW' },
};

export default function SupervisorDashboardScreen({ navigation }) {
  /* ── Preserved: Auth context ── */
  const { userInfo } = useContext(AuthContext);

  /* ── State: incidents + scan data ── */
  const [incidents, setIncidents] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Data loading: parallel fetch ── */
  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const [frauds, scanLogsData] = await Promise.all([
        fetchFraudLogs(),
        fetchScanHistory(),
      ]);
      setScanLogs(scanLogsData || []);
      const mapped = (frauds || []).map(f => ({
        id: f._id,
        type: f.reason === 'duplicate_scan' ? 'fraud' : 'technical',
        severity: f.reason === 'duplicate_scan' ? 'high' : 'medium',
        title: f.reason === 'duplicate_scan' ? 'Duplicate Scan Detected' : 'Invalid Ticket Attempt',
        ticketCode: f.ticketCode || '—',
        details: f.details,
        staff: f.scannedBy?.name || 'Gate staff',
        timestamp: f.timestamp || f.createdAt,
        status: 'open',
      }));
      setIncidents(mapped);
    } catch (e) {
      console.log('Supervisor dashboard error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Focus-based refresh ── */
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadData(true));

  /* ── Identity helpers ── */
  const firstName = userInfo?.name?.split(' ')[0] || 'Supervisor';
  const initials = (userInfo?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  /* ── Derived stats ── */
  const openIncidents = incidents.filter(i => i.status === 'open');
  const criticalCount = openIncidents.filter(i => i.severity === 'critical').length;
  const totalScans = scanLogs.length;

  /* ── Time helper ── */
  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={isRefreshing} />
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
      >
        {/* ═══ DASHBOARD HEADER ═══ */}
        <DashboardHeader
          topLabel="INCIDENT COMMAND"
          title={`Hey, ${firstName}`}
          avatarColors={[colors.primary, colors.primaryDark]}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('SupervisorProfile')}
        />

        {/* ═══ ACTIVE INCIDENTS ALERT ═══ */}
        {openIncidents.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.alertCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('SupervisorIncidents')}
            >
              <View style={styles.alertInner}>
                <View style={styles.alertLeft}>
                  <Text style={styles.alertIcon}>🚨</Text>
                  <View>
                    <Text style={styles.alertTitle}>{openIncidents.length} Open Incidents</Text>
                    <Text style={styles.alertDesc}>
                      {criticalCount > 0 ? `${criticalCount} critical — requires immediate action` : 'Review and resolve pending issues'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.alertArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══ OPERATIONAL METRICS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations Overview</Text>
          <View style={styles.metricsRow}>
            {[
              { label: 'OPEN', value: openIncidents.length, icon: '📋', color: colors.warning },
              { label: 'CRITICAL', value: criticalCount, icon: '🔴', color: colors.danger },
              { label: 'TOTAL SCANS', value: totalScans.toLocaleString(), icon: '📸', color: colors.primary },
              { label: 'GATES DOWN', value: '—', icon: '📡', color: colors.textMuted },
            ].map((m) => (
              <TouchableOpacity key={m.label} style={styles.metricCard} activeOpacity={0.9}>
                <View style={styles.metricInner}>
                  <Text style={styles.metricIcon}>{m.icon}</Text>
                  <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ GATE STATUS ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Gate Status</Text>
            <Text style={styles.sectionSub}>{scanLogs.length} total scans today</Text>
          </View>
          {GATE_LABELS.map((name, idx) => (
            <View key={name} style={styles.gateCard}>
              <View style={styles.gateInner}>
                <View style={styles.gateLeft}>
                  <View style={[styles.gateStatusDot, { backgroundColor: colors.success }]} />
                  <View>
                    <Text style={styles.gateName}>{name}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ═══ RECENT INCIDENTS ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Incidents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SupervisorIncidents')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.xl }} />
          ) : incidents.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>All clear</Text>
              <Text style={styles.emptyDesc}>No incidents reported</Text>
            </View>
          ) : (
            incidents.slice(0, 5).map((incident) => {
              const sev = SEVERITY[incident.severity] || SEVERITY.medium;
              return (
                <TouchableOpacity
                  key={incident.id}
                  style={styles.incidentCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('SupervisorIncidentDetail', { incidentId: incident.id, incident })}
                >
                  <View style={styles.incidentInner}>
                    <View style={styles.incidentLeft}>
                      <Text style={styles.incidentTitle} numberOfLines={1}>{incident.title}</Text>
                      <Text style={styles.incidentMeta}>{incident.ticketCode} · {incident.staff} · {timeAgo(incident.timestamp)}</Text>
                    </View>
                    <View style={[styles.severityPill, { backgroundColor: sev.bg }]}>
                      <Text style={[styles.severityText, { color: sev.text }]}>{sev.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: spacing.lg },

  section: { marginBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', letterSpacing: -0.3, marginBottom: spacing.lg },
  sectionSub: { color: colors.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.lg },
  seeAll: { color: colors.primary, fontSize: typography.small.fontSize, fontWeight: '600', marginBottom: spacing.lg },

  alertCard: { borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.dangerSurface },
  alertInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  alertIcon: { fontSize: 24 },
  alertTitle: { color: colors.danger, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  alertDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  alertArrow: { color: colors.danger, fontSize: 18, fontWeight: '700' },

  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border },
  metricInner: { padding: spacing.xl, alignItems: 'center' },
  metricIcon: { fontSize: 18, marginBottom: spacing.sm },
  metricValue: { fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xs },
  metricLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },

  gateCard: { marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border },
  gateInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl },
  gateLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  gateStatusDot: { width: 10, height: 10, borderRadius: 5 },
  gateName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  gateStaff: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  gateRight: { alignItems: 'flex-end' },
  gateScans: { color: colors.primary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  gateErrors: { color: colors.danger, fontSize: 9, marginTop: 2 },

  incidentCard: { marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border },
  incidentInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  incidentLeft: { flex: 1 },
  incidentTitle: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', marginBottom: 2 },
  incidentMeta: { color: colors.textMuted, fontSize: 9 },
  severityPill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.full },
  severityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  emptyDesc: { color: colors.textMuted, fontSize: typography.small.fontSize },
});
