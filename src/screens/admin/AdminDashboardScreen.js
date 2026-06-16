import React, { useContext, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchAdminAnalytics } from '../../services/adminService';
import { fetchMatches } from '../../services/matchService';

export default function AdminDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({ liveMatches: 0, bookedSeats: 0, fraudCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      const matches = await fetchMatches(true);
      const analytics = await fetchAdminAnalytics();
      const live = matches.filter(m => m.status === 'live' || m.status === 'upcoming').length;
      const booked = analytics.attendance?.totalTickets || 0;
      const fraud = Object.values(analytics.fraudAlerts || {}).reduce((a, b) => a + b, 0);
      setMetrics({ liveMatches: live, bookedSeats: booked, fraudCount: fraud });
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
        {/* Header — asymmetric */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Text style={styles.greeting}>Control Center</Text>
            <Text style={styles.name}>Welcome, {firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Account')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={colors.gradientPurple} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* KPI — varied sizes, not uniform grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>

          {/* Large hero KPI */}
          <TouchableOpacity style={styles.heroKpi} activeOpacity={0.9}>
            <LinearGradient
              colors={[`${colors.primary}30`, `${colors.primary}10`]}
              style={styles.heroKpiInner}
            >
              <View style={styles.heroKpiLeft}>
                <Text style={styles.heroKpiLabel}>Live Matches</Text>
                <Text style={styles.heroKpiValue}>{isLoading ? '—' : String(metrics.liveMatches)}</Text>
                <Text style={styles.heroKpiSub}>Active right now</Text>
              </View>
              <Text style={styles.heroKpiEmoji}>🏏</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Two smaller KPIs */}
          <View style={styles.kpiRow}>
            <TouchableOpacity style={styles.smallKpi} activeOpacity={0.9}>
              <LinearGradient
                colors={[`${colors.success}20`, `${colors.success}08`]}
                style={styles.smallKpiInner}
              >
                <Text style={styles.smallKpiEmoji}>🎫</Text>
                <Text style={styles.smallKpiValue}>{isLoading ? '—' : String(metrics.bookedSeats)}</Text>
                <Text style={styles.smallKpiLabel}>Seats Sold</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallKpi} activeOpacity={0.9}>
              <LinearGradient
                colors={[`${metrics.fraudCount > 0 ? colors.danger : colors.warning}20`, `${metrics.fraudCount > 0 ? colors.danger : colors.warning}08`]}
                style={styles.smallKpiInner}
              >
                <Text style={styles.smallKpiEmoji}>🛡️</Text>
                <Text style={[styles.smallKpiValue, metrics.fraudCount > 0 && { color: colors.danger }]}>{isLoading ? '—' : String(metrics.fraudCount)}</Text>
                <Text style={styles.smallKpiLabel}>Fraud Alerts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions — 2x2 with varied accent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '⚽', label: 'Matches', route: 'Matches', gradient: [`${colors.primary}25`, `${colors.primary}08`] },
              { icon: '📈', label: 'Analytics', route: 'Dashboard', gradient: [`${colors.success}25`, `${colors.success}08`] },
              { icon: '👥', label: 'Users', route: 'Users', gradient: [`${colors.warning}25`, `${colors.warning}08`] },
              { icon: '⚙️', label: 'Settings', route: 'Dashboard', gradient: [`${colors.info}25`, `${colors.info}08`] },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => navigation.navigate(a.route)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={a.gradient} style={styles.actionGradient}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity — timeline style, not cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.timeline}>
            {[
              { icon: '💰', text: 'Match pricing updated', time: '3 min ago', color: colors.primary, line: true },
              { icon: '✅', text: 'Staff account approved', time: '14 min ago', color: colors.success, line: true },
              { icon: '📊', text: 'Revenue report generated', time: '09:12 today', color: colors.warning, line: true },
              { icon: '🔐', text: 'Security scan completed', time: '08:45 today', color: colors.info, line: false },
            ].map((item, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                  {item.line && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineIconWrap}>
                    <Text style={styles.timelineIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.timelineText}>
                    <Text style={styles.timelineMsg}>{item.text}</Text>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  </View>
                </View>
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

  // Hero KPI — large, prominent
  heroKpi: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroKpiInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  heroKpiLeft: {},
  heroKpiLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  heroKpiValue: { color: colors.primaryLight, fontSize: 42, fontWeight: '900', lineHeight: 46, marginBottom: spacing.xs },
  heroKpiSub: { color: colors.textMuted, fontSize: typography.small.fontSize },
  heroKpiEmoji: { fontSize: 48, opacity: 0.5 },

  // Small KPIs
  kpiRow: { flexDirection: 'row', gap: spacing.md },
  smallKpi: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallKpiInner: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  smallKpiEmoji: { fontSize: 22, marginBottom: spacing.sm },
  smallKpiValue: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  smallKpiLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  // Actions — 2x2
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionCard: {
    width: '47%',
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: { fontSize: 24 },
  actionLabel: {
    color: colors.textSecondary, fontSize: typography.small.fontSize,
    fontWeight: '700',
  },

  // Timeline — vertical line, not cards
  timeline: {},
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  timelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineIcon: { fontSize: 14 },
  timelineText: { flex: 1 },
  timelineMsg: {
    color: colors.textPrimary, fontSize: typography.captionMedium.fontSize,
    fontWeight: '600',
  },
  timelineTime: {
    color: colors.textMuted, fontSize: 9, marginTop: 2,
  },
});
