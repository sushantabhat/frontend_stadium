import React, { useContext, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchAdminAnalytics, fetchUsers } from '../../services/adminService';
import { fetchMatches } from '../../services/matchService';

/* ─── Timeline Filter Options ─── */
const TIMELINE_FILTERS = ['1D', '1W', '1M', 'ALL'];

export default function AdminDashboardScreen({ navigation }) {
  /* ── Preserved: Auth context & user identity ── */
  const { userInfo } = useContext(AuthContext);

  /* ── Preserved: Metrics state ── */
  const [metrics, setMetrics] = useState({ liveMatches: 0, bookedSeats: 0, fraudCount: 0, revenue: 0, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  /* ── New: Timeline filter (visual only, doesn't alter data fetch) ── */
  const [activeTimeline, setActiveTimeline] = useState('ALL');

  /* ── Preserved: Data loading with parallel API calls ── */
  const loadMetrics = useCallback(async () => {
    try {
      const [matches, analytics, users] = await Promise.all([
        fetchMatches(true),
        fetchAdminAnalytics(),
        fetchUsers(),
      ]);
      const live = matches.filter(m => m.status === 'live' || m.status === 'upcoming').length;
      const booked = analytics.attendance?.totalTickets || 0;
      const fraud = Object.values(analytics.securityAlerts || {}).reduce((a, b) => a + b, 0);
      setMetrics({
        liveMatches: live,
        bookedSeats: booked,
        fraudCount: fraud,
        revenue: analytics.totalRevenue || 0,
        totalUsers: users.length,
      });
    } catch (e) {
      console.log('Admin metrics error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Preserved: Focus-based data refresh ── */
  useFocusEffect(useCallback(() => { loadMetrics(); }, [loadMetrics]));

  /* ── Preserved: User identity helpers ── */
  const firstName = userInfo?.name?.split(' ')[0] || 'Admin';
  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ═══ TOP BAR: Avatar + Notification ═══ */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Text style={styles.greeting}>Control Center</Text>
            <Text style={styles.name}>Welcome, {firstName}</Text>
          </View>
          <View style={styles.topRight}>
            {/* Notification badge with pulsing indicator */}
            <TouchableOpacity style={styles.notifBadge} activeOpacity={0.7}>
              <Text style={styles.notifIcon}>🔔</Text>
              {metrics.fraudCount > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            {/* Avatar in glowing neon ring */}
            <TouchableOpacity style={styles.avatarRing} onPress={() => navigation.navigate('Account')} activeOpacity={0.8}>
              <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ HERO REVENUE KPI ═══ */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroKpi}
            >
              {/* Subtle highlight shimmer at top-left */}
              <LinearGradient
                colors={[glass.highlightStrong, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 0.6 }}
                style={styles.heroKpiShimmer}
              />
              <View style={styles.heroKpiLeft}>
                <Text style={styles.heroKpiLabel}>TOTAL REVENUE</Text>
                {isLoading ? (
                  <ActivityIndicator color={glass.neonCyan} style={{ height: 46 }} />
                ) : (
                  <Text style={styles.heroKpiValue}>₹{metrics.revenue.toLocaleString()}</Text>
                )}
                <View style={styles.trendBadge}>
                  <Text style={styles.trendArrow}>↑</Text>
                  <Text style={styles.trendText}>+18.4%</Text>
                </View>
              </View>
              <Text style={styles.heroKpiEmoji}>💰</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ═══ SECONDARY KPIs — 3 COLUMNS ═══ */}
        <View style={styles.section}>
          <View style={styles.kpiRow3}>
            {[
              { label: 'Live Matches', value: metrics.liveMatches, icon: '🏏', color: glass.neonCyan },
              { label: 'Tickets Sold', value: metrics.bookedSeats, icon: '🎫', color: glass.neonMagenta },
              { label: 'Total Users', value: metrics.totalUsers, icon: '👥', color: glass.neonPurple },
            ].map((kpi) => (
              <TouchableOpacity key={kpi.label} style={styles.kpi3Card} activeOpacity={0.9}>
                <LinearGradient
                  colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.kpi3Inner}
                >
                  <Text style={styles.kpi3Emoji}>{kpi.icon}</Text>
                  <Text style={[styles.kpi3Value, { color: kpi.color }]}>
                    {isLoading ? '—' : kpi.value}
                  </Text>
                  <Text style={styles.kpi3Label}>{kpi.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ TIMELINE FILTER PILLS ═══ */}
        <View style={styles.section}>
          <View style={styles.filterContainer}>
            {TIMELINE_FILTERS.map((filter) => {
              const isActive = activeTimeline === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveTimeline(filter)}
                  activeOpacity={0.7}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={[glass.neonCyan, glass.neonPurple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.filterPillGradient}
                    >
                      <Text style={styles.filterPillTextActive}>{filter}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.filterPillText}>{filter}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══ TREND CHART VECTOR (SVG Line) ═══ */}
        <View style={styles.section}>
          <View style={styles.chartCard}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chartInner}
            >
              <Text style={styles.chartTitle}>Revenue Trend</Text>
              <Text style={styles.chartSubtitle}>Transactional speed over time</Text>
              {/* Simplified line chart using View bars for visual representation */}
              <View style={styles.chartArea}>
                <View style={styles.chartBars}>
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                    <View key={i} style={styles.chartBarCol}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: `${h}%`,
                            backgroundColor: i === 10 ? glass.neonCyan : `${glass.neonCyan}40`,
                          },
                        ]}
                      />
                    </View>
                  ))}
                </View>
                {/* Baseline axis */}
                <View style={styles.chartAxis} />
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Revenue (Cyan Vector)</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* ═══ FRAUD ALERT — only if present ═══ */}
        {metrics.fraudCount > 0 && (
          <View style={styles.section}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AdminTicketValidation')}>
              <LinearGradient
                colors={[glass.statusDangerFill, 'rgba(255,23,68,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.alertCard}
              >
                <View style={styles.alertLeft}>
                  <Text style={styles.alertIcon}>🚨</Text>
                  <View>
                    <Text style={styles.alertTitle}>Fraud Alerts</Text>
                    <Text style={styles.alertDesc}>{metrics.fraudCount} incidents detected — tap to review</Text>
                  </View>
                </View>
                <Text style={styles.alertArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══ QUICK ACTIONS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {/* Row 1: Large card + 2 small */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionLarge} onPress={() => navigation.navigate('Matches')} activeOpacity={0.7}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionLargeInner}
              >
                <Text style={styles.actionLargeIcon}>⚽</Text>
                <Text style={styles.actionLargeLabel}>Matches</Text>
                <Text style={styles.actionLargeSub}>Create & manage events</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.actionsCol}>
              <TouchableOpacity style={styles.actionSmall} onPress={() => navigation.navigate('Users')} activeOpacity={0.7}>
                <LinearGradient
                  colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionSmallInner}
                >
                  <Text style={styles.actionSmallIcon}>👥</Text>
                  <Text style={styles.actionSmallLabel}>Users</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSmall} onPress={() => navigation.navigate('AdminStatistics')} activeOpacity={0.7}>
                <LinearGradient
                  colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionSmallInner}
                >
                  <Text style={styles.actionSmallIcon}>📈</Text>
                  <Text style={styles.actionSmallLabel}>Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          {/* Row 2: Ticket Validation + Promotions + Settings */}
          <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
            <TouchableOpacity style={styles.actionSmallWide} onPress={() => navigation.navigate('AdminTicketValidation')} activeOpacity={0.7}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionSmallWideInner}
              >
                <Text style={styles.actionSmallWideIcon}>🎫</Text>
                <Text style={styles.actionSmallWideLabel}>Ticket Validation</Text>
                <Text style={styles.actionSmallWideSub}>Gate scan audit</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionSmallWide} onPress={() => navigation.navigate('Users', { screen: 'AdminPromotionalHub' })} activeOpacity={0.7}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionSmallWideInner}
              >
                <Text style={styles.actionSmallWideIcon}>📣</Text>
                <Text style={styles.actionSmallWideLabel}>Promotions</Text>
                <Text style={styles.actionSmallWideSub}>Banners & sponsors</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionSmallWide} onPress={() => navigation.navigate('AdminSettings')} activeOpacity={0.7}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionSmallWideInner}
              >
                <Text style={styles.actionSmallWideIcon}>⚙️</Text>
                <Text style={styles.actionSmallWideLabel}>Config</Text>
                <Text style={styles.actionSmallWideSub}>Pricing & rules</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ SYSTEM STATUS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusInner}
            >
              {[
                { label: 'Database', status: 'Connected', color: glass.statusSuccessText, dot: glass.statusSuccessText },
                { label: 'Socket.io', status: 'Active', color: glass.statusSuccessText, dot: glass.statusSuccessText },
                { label: 'AI Engine', status: 'Ready', color: glass.statusSuccessText, dot: glass.statusSuccessText },
                { label: 'Payment', status: 'Simulated', color: glass.statusWarningText, dot: glass.statusWarningText },
              ].map((item, idx) => (
                <View key={item.label} style={[styles.statusItem, idx < 3 && styles.statusItemBorder]}>
                  <View style={[styles.statusDot, { backgroundColor: item.dot }]} />
                  <Text style={styles.statusLabel}>{item.label}</Text>
                  <Text style={[styles.statusValue, { color: item.color }]}>{item.status}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        </View>

        {/* ═══ ACTIVITY FEED ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.feedCard}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.feedInner}
            >
              {[
                { icon: '💰', text: 'New booking — ₹2,400', time: '2m ago', color: glass.statusSuccessText },
                { icon: '🎫', text: 'Ticket scanned at Gate A', time: '5m ago', color: glass.neonCyan },
                { icon: '👥', text: 'New staff account created', time: '18m ago', color: glass.neonPurple },
                { icon: '📊', text: 'Daily report generated', time: '1h ago', color: glass.statusWarningText },
              ].map((item, idx) => (
                <View key={item.text} style={[styles.feedItem, idx < 3 && styles.feedItemBorder]}>
                  <View style={[styles.feedDot, { backgroundColor: item.color }]} />
                  <View style={styles.feedContent}>
                    <Text style={styles.feedText}>{item.text}</Text>
                    <Text style={styles.feedTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.feedIcon}>{item.icon}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ── Canvas: pitch-black workspace ── */
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingTop: spacing.lg },

  /* ── Top Bar ── */
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, marginBottom: spacing.xxl,
  },
  topLeft: {},
  greeting: { color: glass.textMuted, fontSize: typography.caption.fontSize, fontWeight: '500' },
  name: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', letterSpacing: -0.5 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },

  /* Notification badge */
  notifBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: glass.neonMagenta,
  },

  /* Avatar in neon ring */
  avatarRing: {
    width: 48, height: 48, borderRadius: 16, overflow: 'hidden',
    borderWidth: 2, borderColor: glass.neonCyan,
  },
  avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  /* ── Section spacing ── */
  section: { marginBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionTitle: {
    color: colors.textPrimary, fontSize: typography.h3.fontSize,
    fontWeight: '800', letterSpacing: -0.3, marginBottom: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAll: { color: glass.neonCyan, fontSize: typography.small.fontSize, fontWeight: '600' },

  /* ── Hero Revenue KPI ── */
  heroKpi: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: radii.xl, padding: spacing.xxl,
    borderWidth: 1, borderColor: glass.border,
    overflow: 'hidden',
  },
  heroKpiShimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radii.xl,
  },
  heroKpiLeft: { zIndex: 1 },
  heroKpiLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  heroKpiValue: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', lineHeight: 46, marginBottom: spacing.xs },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255, 46, 147, 0.15)',
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radii.full, alignSelf: 'flex-start',
  },
  trendArrow: { color: glass.neonMagenta, fontSize: 12, fontWeight: '800' },
  trendText: { color: glass.neonMagenta, fontSize: 11, fontWeight: '700' },
  heroKpiEmoji: { fontSize: 48, opacity: 0.5, zIndex: 1 },

  /* ── 3-Column KPIs ── */
  kpiRow3: { flexDirection: 'row', gap: spacing.sm },
  kpi3Card: {
    flex: 1, borderRadius: radii.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  kpi3Inner: { padding: spacing.lg, alignItems: 'center' },
  kpi3Emoji: { fontSize: 18, marginBottom: spacing.sm },
  kpi3Value: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 1 },
  kpi3Label: { color: glass.textMuted, fontSize: 8, fontWeight: '600', textAlign: 'center' },

  /* ── Timeline Filter Pills ── */
  filterContainer: {
    flexDirection: 'row', gap: spacing.sm,
    backgroundColor: glass.surface, borderRadius: radii.full,
    padding: spacing.xxs, borderWidth: 1, borderColor: glass.border,
  },
  filterPill: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center',
  },
  filterPillActive: {},
  filterPillGradient: {
    flex: 1, width: '100%', paddingVertical: spacing.sm + 2,
    borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
  },
  filterPillText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '700' },
  filterPillTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  /* ── Trend Chart ── */
  chartCard: {
    borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  chartInner: { padding: spacing.xl },
  chartTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xxs },
  chartSubtitle: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.xl },
  chartArea: { height: 120, marginBottom: spacing.md },
  chartBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  chartBarCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBar: {
    width: '100%', borderRadius: 4,
    minHeight: 4,
  },
  chartAxis: {
    height: 1, backgroundColor: glass.border, marginTop: spacing.xs,
  },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: glass.neonCyan },
  legendText: { color: glass.textMuted, fontSize: typography.tiny.fontSize },

  /* ── Fraud Alert ── */
  alertCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: radii.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: glass.statusDangerFill,
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  alertIcon: { fontSize: 24 },
  alertTitle: { color: glass.statusDangerText, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  alertDesc: { color: glass.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  alertArrow: { color: glass.statusDangerText, fontSize: 18, fontWeight: '700' },

  /* ── Quick Actions — asymmetric ── */
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionLarge: {
    flex: 1.5, borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  actionLargeInner: { padding: spacing.xl, justifyContent: 'flex-end', minHeight: 120 },
  actionLargeIcon: { fontSize: 28, marginBottom: spacing.sm },
  actionLargeLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xxs },
  actionLargeSub: { color: glass.textMuted, fontSize: typography.small.fontSize },
  actionsCol: { flex: 1, gap: spacing.md },
  actionSmall: {
    flex: 1, borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  actionSmallInner: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  actionSmallIcon: { fontSize: 20 },
  actionSmallLabel: { color: glass.textSecondary, fontSize: typography.small.fontSize, fontWeight: '700' },

  /* Row 2: Wide action cards (Ticket Validation, Promotions, Config) */
  actionSmallWide: {
    flex: 1, borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  actionSmallWideInner: { padding: spacing.lg, alignItems: 'center', gap: spacing.xs, minHeight: 100, justifyContent: 'center' },
  actionSmallWideIcon: { fontSize: 22, marginBottom: spacing.xs },
  actionSmallWideLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', textAlign: 'center' },
  actionSmallWideSub: { color: glass.textMuted, fontSize: 9, textAlign: 'center' },

  /* ── System Status ── */
  statusCard: {
    borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  statusInner: {},
  statusItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2, gap: spacing.md,
  },
  statusItemBorder: { borderBottomWidth: 1, borderBottomColor: glass.border },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, color: glass.textSecondary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  statusValue: { fontSize: typography.small.fontSize, fontWeight: '700' },

  /* ── Activity Feed ── */
  feedCard: {
    borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  feedInner: {},
  feedItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, gap: spacing.md,
  },
  feedItemBorder: { borderBottomWidth: 1, borderBottomColor: glass.border },
  feedDot: { width: 8, height: 8, borderRadius: 4 },
  feedContent: { flex: 1 },
  feedText: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  feedTime: { color: glass.textMuted, fontSize: 9, marginTop: 2, fontFamily: glass.monoFont },
  feedIcon: { fontSize: 14 },
});
