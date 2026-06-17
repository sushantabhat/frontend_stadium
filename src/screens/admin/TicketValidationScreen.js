import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchScanHistory } from '../../services/ticketService';
import { fetchFraudLogs } from '../../services/adminService';

/* ─── Segmented tab options ─── */
const TABS = [
  { key: 'all', label: 'All Scan Logs' },
  { key: 'gates', label: 'Gate Entries' },
  { key: 'flagged', label: 'Flagged Exceptions' },
];

/* ─── Status pill style mapping ─── */
const SCAN_STATUS = {
  verified:  { bg: glass.statusSuccessFill, text: glass.statusSuccessText, label: 'VERIFIED' },
  duplicate: { bg: glass.statusDangerFill,  text: glass.statusDangerText,  label: 'FRAUD — DUPLICATE' },
  invalid:   { bg: glass.statusDangerFill,  text: glass.statusDangerText,  label: 'INVALID' },
  pending:   { bg: glass.statusWarningFill, text: glass.statusWarningText, label: 'PENDING' },
};

export default function TicketValidationScreen({ navigation }) {
  /* ── State: scan history + fraud logs ── */
  const [scanLogs, setScanLogs] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  /* ── Data loading: parallel fetch of scan history + fraud logs ── */
  const loadData = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const [scans, frauds] = await Promise.all([
        fetchScanHistory(),
        fetchFraudLogs(),
      ]);
      setScanLogs(scans || []);
      setFraudLogs(frauds || []);
    } catch (err) {
      console.log('Ticket validation data error:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /* ── Focus-based refresh ── */
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  /* ── Derived: compute filtered list based on active tab ── */
  const getFilteredData = () => {
    if (activeTab === 'flagged') {
      /* Combine fraud logs with scan logs that have fraud status */
      return fraudLogs.map(log => ({
        id: log._id,
        ticketCode: log.ticketCode || '—',
        reason: log.reason,
        details: log.details,
        staff: log.scannedBy?.name || 'Gate staff',
        timestamp: log.timestamp || log.createdAt,
        status: 'duplicate',
        isGate: false,
      }));
    }
    if (activeTab === 'gates') {
      return scanLogs.filter(log => log.gate || log.ticketCode?.startsWith('GATE'));
    }
    return scanLogs;
  };

  const filteredData = getFilteredData();

  /* ── Stats for top metrics ── */
  const totalScans = scanLogs.length;
  const flaggedCount = fraudLogs.length;

  /* ── Helper: format relative time ── */
  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  /* ── Helper: get scan status or default ── */
  const getScanStatus = (log) => {
    if (log.status) return SCAN_STATUS[log.status] || SCAN_STATUS.pending;
    if (log.reason === 'duplicate_scan') return SCAN_STATUS.duplicate;
    if (log.reason === 'fake_signature') return SCAN_STATUS.invalid;
    return SCAN_STATUS.verified;
  };

  /* ── Render: individual audit entry ── */
  const renderLogEntry = ({ item, index }) => {
    const scanStatus = getScanStatus(item);
    return (
      <View style={styles.logCard}>
        <LinearGradient
          colors={[glass.surface, 'rgba(18,21,34,0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logCardInner}
        >
          {/* Left: Alphanumeric ticket key (monospaced) */}
          <View style={styles.logLeft}>
            <Text style={styles.logTicketCode}>
              {item.ticketCode || item.gate || `LOG-${String(index + 1).padStart(4, '0')}`}
            </Text>
            <Text style={styles.logTimestamp}>
              {timeAgo(item.timestamp || item.createdAt)}
            </Text>
          </View>

          {/* Center: Customer/agent ID + details */}
          <View style={styles.logCenter}>
            <Text style={styles.logAgent} numberOfLines={1}>
              {item.staff || item.agent || item.userId || 'System'}
            </Text>
            <Text style={styles.logDetails} numberOfLines={1}>
              {item.details || item.reason || 'Scan event logged'}
            </Text>
          </View>

          {/* Right: Status pill */}
          <View style={[styles.logStatusPill, { backgroundColor: scanStatus.bg }]}>
            <Text style={[styles.logStatusText, { color: scanStatus.text }]} numberOfLines={1}>
              {scanStatus.label}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Ticket Validation"
        subtitle="Live gate scan monitoring & audit ledger"
        onBack={() => navigation.goBack()}
      />

      {/* ═══ SEGMENTED TAB BAR ═══ */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={[glass.neonCyan, glass.neonPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGradient}
                >
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ═══ METRIC STRIP ═══ */}
      <View style={styles.metricStrip}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{totalScans}</Text>
          <Text style={styles.metricLabel}>Total Scans</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: glass.statusDangerText }]}>{flaggedCount}</Text>
          <Text style={styles.metricLabel}>Flagged</Text>
        </View>
      </View>

      {/* ═══ AUDIT LEDGER ═══ */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={glass.neonCyan} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => item.id || item._id || String(index)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor={glass.neonCyan}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No scan logs found</Text>
              <Text style={styles.emptyDesc}>
                {activeTab === 'flagged'
                  ? 'No flagged exceptions in the audit trail.'
                  : 'Gate scan events will appear here in real-time.'}
              </Text>
            </View>
          }
          renderItem={renderLogEntry}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ── Canvas ── */
  container: { flex: 1, backgroundColor: glass.canvasStart },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* ── Segmented Tab Bar ── */
  tabBar: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.xl, marginBottom: spacing.md,
  },
  tabItem: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border,
  },
  tabItemActive: { borderWidth: 0, padding: 0 },
  tabGradient: {
    flex: 1, width: '100%', paddingVertical: spacing.sm + 2,
    borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
  },
  tabText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  /* ── Metric Strip ── */
  metricStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.xl, marginBottom: spacing.lg,
    backgroundColor: glass.surface, borderRadius: radii.xl,
    padding: spacing.xl, borderWidth: 1, borderColor: glass.border,
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricValue: { color: glass.neonCyan, fontSize: typography.h2.fontSize, fontWeight: '900', fontFamily: glass.monoFont },
  metricLabel: { color: glass.textMuted, fontSize: typography.tiny.fontSize, marginTop: spacing.xs },
  metricDivider: { width: 1, height: 32, backgroundColor: glass.border },

  /* ── List ── */
  list: { padding: spacing.xl, paddingBottom: spacing.xxl * 1.5 },

  /* ── Log Entry Card ── */
  logCard: {
    marginBottom: spacing.md, borderRadius: radii.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: glass.border,
  },
  logCardInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.xl, gap: spacing.md,
  },

  /* Left: ticket key (monospaced) */
  logLeft: { minWidth: 90 },
  logTicketCode: {
    color: glass.neonCyan, fontSize: 12, fontWeight: '800',
    fontFamily: glass.monoFont, marginBottom: spacing.xs,
  },
  logTimestamp: {
    color: glass.textMuted, fontSize: 9,
    fontFamily: glass.monoFont,
  },

  /* Center: agent + details */
  logCenter: { flex: 1 },
  logAgent: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600', marginBottom: 2 },
  logDetails: { color: glass.textMuted, fontSize: typography.small.fontSize },

  /* Right: status pill */
  logStatusPill: {
    paddingHorizontal: spacing.md, paddingVertical: 4,
    borderRadius: radii.full, maxWidth: 130,
  },
  logStatusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },

  /* ── Empty State ── */
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  emptyDesc: { color: glass.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', maxWidth: 260 },
});
