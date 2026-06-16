import React, { useContext, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchAdminAnalytics } from '../../services/adminService';
import { fetchMatches } from '../../services/matchService';
import { fetchUsers } from '../../services/adminService';

export default function AdminDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({ liveMatches: 0, bookedSeats: 0, fraudCount: 0, revenue: 0, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      const [matches, analytics, users] = await Promise.all([
        fetchMatches(true),
        fetchAdminAnalytics(),
        fetchUsers(),
      ]);
      const live = matches.filter(m => m.status === 'live' || m.status === 'upcoming').length;
      const booked = analytics.attendance?.totalTickets || 0;
      const fraud = Object.values(analytics.fraudAlerts || {}).reduce((a, b) => a + b, 0);
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

  useFocusEffect(useCallback(() => { loadMetrics(); }, [loadMetrics]));

  const firstName = userInfo?.name?.split(' ')[0] || 'Admin';
  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Text style={styles.greeting}>Control Center</Text>
            <Text style={styles.name}>Welcome, {firstName}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Account')} activeOpacity={0.8}>
            <LinearGradient colors={colors.gradientPurple} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Hero Revenue KPI */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient colors={[`${colors.primary}30`, `${colors.primary}08`]} style={styles.heroKpi}>
              <View style={styles.heroKpiLeft}>
                <Text style={styles.heroKpiLabel}>TOTAL REVENUE</Text>
                {isLoading ? <ActivityIndicator color={colors.primaryLight} style={{ height: 46 }} /> : (
                  <Text style={styles.heroKpiValue}>₹{metrics.revenue.toLocaleString()}</Text>
                )}
                <Text style={styles.heroKpiSub}>From confirmed bookings</Text>
              </View>
              <Text style={styles.heroKpiEmoji}>💰</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Secondary KPIs — 3 columns */}
        <View style={styles.section}>
          <View style={styles.kpiRow3}>
            {[
              { label: 'Live Matches', value: metrics.liveMatches, icon: '🏏', color: colors.primary, gradient: [`${colors.primary}25`, `${colors.primary}08`] },
              { label: 'Tickets Sold', value: metrics.bookedSeats, icon: '🎫', color: colors.success, gradient: [`${colors.success}25`, `${colors.success}08`] },
              { label: 'Total Users', value: metrics.totalUsers, icon: '👥', color: colors.info, gradient: [`${colors.info}25`, `${colors.info}08`] },
            ].map((kpi) => (
              <TouchableOpacity key={kpi.label} style={styles.kpi3Card} activeOpacity={0.9}>
                <LinearGradient colors={kpi.gradient} style={styles.kpi3Inner}>
                  <Text style={styles.kpi3Emoji}>{kpi.icon}</Text>
                  <Text style={[styles.kpi3Value, { color: kpi.color }]}>{isLoading ? '—' : kpi.value}</Text>
                  <Text style={styles.kpi3Label}>{kpi.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fraud Alert — only if present */}
        {metrics.fraudCount > 0 && (
          <View style={styles.section}>
            <TouchableOpacity activeOpacity={0.9}>
              <LinearGradient colors={[`${colors.danger}20`, `${colors.danger}08`]} style={styles.alertCard}>
                <View style={styles.alertLeft}>
                  <Text style={styles.alertIcon}>🚨</Text>
                  <View>
                    <Text style={styles.alertTitle}>Fraud Alerts</Text>
                    <Text style={styles.alertDesc}>{metrics.fraudCount} incidents detected</Text>
                  </View>
                </View>
                <Text style={styles.alertArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions — asymmetric 2+2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionLarge} onPress={() => navigation.navigate('Matches')} activeOpacity={0.7}>
              <LinearGradient colors={[`${colors.primary}25`, `${colors.primary}08`]} style={styles.actionLargeInner}>
                <Text style={styles.actionLargeIcon}>⚽</Text>
                <Text style={styles.actionLargeLabel}>Matches</Text>
                <Text style={styles.actionLargeSub}>Create & manage events</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.actionsCol}>
              <TouchableOpacity style={styles.actionSmall} onPress={() => navigation.navigate('Users')} activeOpacity={0.7}>
                <LinearGradient colors={[`${colors.warning}25`, `${colors.warning}08`]} style={styles.actionSmallInner}>
                  <Text style={styles.actionSmallIcon}>👥</Text>
                  <Text style={styles.actionSmallLabel}>Users</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSmall} onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.7}>
                <LinearGradient colors={[`${colors.success}25`, `${colors.success}08`]} style={styles.actionSmallInner}>
                  <Text style={styles.actionSmallIcon}>📈</Text>
                  <Text style={styles.actionSmallLabel}>Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusCard}>
            {[
              { label: 'Database', status: 'Connected', color: colors.success, icon: '🟢' },
              { label: 'Socket.io', status: 'Active', color: colors.success, icon: '🟢' },
              { label: 'AI Engine', status: 'Ready', color: colors.success, icon: '🟢' },
              { label: 'Payment', status: 'Simulated', color: colors.warning, icon: '🟡' },
            ].map((item, idx) => (
              <View key={item.label} style={[styles.statusItem, idx < 3 && styles.statusItemBorder]}>
                <Text style={styles.statusIcon}>{item.icon}</Text>
                <Text style={styles.statusLabel}>{item.label}</Text>
                <Text style={[styles.statusValue, { color: item.color }]}>{item.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.feedCard}>
            {[
              { icon: '💰', text: 'New booking — ₹2,400', time: '2m ago', color: colors.success },
              { icon: '🎫', text: 'Ticket scanned at Gate A', time: '5m ago', color: colors.primary },
              { icon: '👥', text: 'New staff account created', time: '18m ago', color: colors.info },
              { icon: '📊', text: 'Daily report generated', time: '1h ago', color: colors.warning },
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
          </View>
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.lg },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, marginBottom: spacing.xxl,
  },
  topLeft: {},
  greeting: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: '500' },
  name: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', letterSpacing: -0.5 },
  avatar: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden' },
  avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  section: { marginBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionTitle: {
    color: colors.textPrimary, fontSize: typography.h3.fontSize,
    fontWeight: '800', letterSpacing: -0.3, marginBottom: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAll: { color: colors.primaryLight, fontSize: typography.small.fontSize, fontWeight: '600' },

  // Hero KPI
  heroKpi: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: radii.xl, padding: spacing.xxl, borderWidth: 1, borderColor: colors.border,
  },
  heroKpiLeft: {},
  heroKpiLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  heroKpiValue: { color: colors.primaryLight, fontSize: 42, fontWeight: '900', lineHeight: 46, marginBottom: spacing.xs },
  heroKpiSub: { color: colors.textMuted, fontSize: typography.small.fontSize },
  heroKpiEmoji: { fontSize: 48, opacity: 0.5 },

  // 3-col KPIs
  kpiRow3: { flexDirection: 'row', gap: spacing.sm },
  kpi3Card: { flex: 1, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  kpi3Inner: { padding: spacing.lg, alignItems: 'center' },
  kpi3Emoji: { fontSize: 18, marginBottom: spacing.sm },
  kpi3Value: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 1 },
  kpi3Label: { color: colors.textMuted, fontSize: 8, fontWeight: '600', textAlign: 'center' },

  // Alert
  alertCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, borderColor: `${colors.danger}25`,
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  alertIcon: { fontSize: 24 },
  alertTitle: { color: colors.dangerLight, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  alertDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  alertArrow: { color: colors.dangerLight, fontSize: 18, fontWeight: '700' },

  // Actions — asymmetric
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionLarge: { flex: 1.5, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  actionLargeInner: { padding: spacing.xl, justifyContent: 'flex-end', minHeight: 120 },
  actionLargeIcon: { fontSize: 28, marginBottom: spacing.sm },
  actionLargeLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xxs },
  actionLargeSub: { color: colors.textMuted, fontSize: typography.small.fontSize },
  actionsCol: { flex: 1, gap: spacing.md },
  actionSmall: { flex: 1, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  actionSmallInner: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  actionSmallIcon: { fontSize: 20 },
  actionSmallLabel: { color: colors.textSecondary, fontSize: typography.small.fontSize, fontWeight: '700' },

  // System Status
  statusCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  statusItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2, gap: spacing.md,
  },
  statusItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  statusIcon: { fontSize: 10 },
  statusLabel: { flex: 1, color: colors.textSecondary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  statusValue: { fontSize: typography.small.fontSize, fontWeight: '700' },

  // Activity Feed
  feedCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  feedItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, gap: spacing.md,
  },
  feedItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  feedDot: { width: 8, height: 8, borderRadius: 4 },
  feedContent: { flex: 1 },
  feedText: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  feedTime: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  feedIcon: { fontSize: 14 },
});
