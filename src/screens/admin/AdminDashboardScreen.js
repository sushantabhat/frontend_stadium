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
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography } from '../../constants/theme';
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
        {/* Header */}
        <View style={styles.topBar}>
          <View>
            <View style={styles.adminPill}>
              <View style={styles.adminDot} />
              <Text style={styles.adminText}>ADMIN</Text>
            </View>
            <Text style={styles.greeting}>Welcome, {firstName}</Text>
            <Text style={styles.tagline}>Stadium control center</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations Overview</Text>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, styles.kpiLarge]}>
              <View style={styles.kpiIconWrap}>
                <Text style={styles.kpiIcon}>🏏</Text>
              </View>
              <Text style={styles.kpiValue}>{isLoading ? '—' : String(metrics.liveMatches)}</Text>
              <Text style={styles.kpiLabel}>Live Matches</Text>
              <View style={[styles.kpiTrend, { backgroundColor: colors.successSurface }]}>
                <Text style={[styles.kpiTrendText, { color: colors.successLight }]}>Active</Text>
              </View>
            </View>
            <View style={styles.kpiStack}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValueSmall}>{isLoading ? '—' : String(metrics.bookedSeats)}</Text>
                <Text style={styles.kpiLabelSmall}>Booked Seats</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValueSmall, { color: metrics.fraudCount > 0 ? colors.dangerLight : colors.textPrimary }]}>
                  {isLoading ? '—' : String(metrics.fraudCount)}
                </Text>
                <Text style={styles.kpiLabelSmall}>Fraud Alerts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '⚽', label: 'Manage\nMatches', route: 'Matches', color: colors.primary },
              { icon: '📈', label: 'Analytics\n& Stats', route: 'Dashboard', color: colors.success },
              { icon: '👥', label: 'User\nManagement', route: 'Users', color: colors.warning },
              { icon: '⚙️', label: 'System\nSettings', route: 'Dashboard', color: '#A78BFA' },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => navigation.navigate(a.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: `${a.color}18` }]}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.feedCard}>
            {[
              { icon: '💰', text: 'Match pricing updated', time: '3 min ago', color: colors.primary },
              { icon: '✅', text: 'Staff account approved', time: '14 min ago', color: colors.success },
              { icon: '📊', text: 'Revenue report generated', time: '09:12 today', color: colors.warning },
              { icon: '🔐', text: 'Security scan completed', time: '08:45 today', color: colors.info },
            ].map((item, idx) => (
              <View key={idx} style={styles.feedItem}>
                <View style={[styles.feedIconWrap, { backgroundColor: `${item.color}18` }]}>
                  <Text style={styles.feedIcon}>{item.icon}</Text>
                </View>
                <View style={styles.feedInfo}>
                  <Text style={styles.feedText}>{item.text}</Text>
                  <Text style={styles.feedTime}>{item.time}</Text>
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
  scroll: { paddingTop: spacing.md },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  adminDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  adminText: {
    color: colors.primary,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: `${colors.primary}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryLight,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    marginBottom: spacing.md,
  },

  // KPI
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  kpiLarge: {
    flex: 1,
    backgroundColor: colors.primarySurface,
    borderColor: `${colors.primary}30`,
  },
  kpiStack: {
    flex: 1,
    gap: spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  kpiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kpiIcon: { fontSize: 20 },
  kpiValue: {
    color: colors.primaryLight,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: spacing.xxs,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    marginBottom: spacing.sm,
  },
  kpiTrend: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.full,
  },
  kpiTrendText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  kpiValueSmall: {
    color: colors.textPrimary,
    fontSize: typography.h2.fontSize,
    fontWeight: '900',
    marginBottom: spacing.xxs,
  },
  kpiLabelSmall: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Feed
  feedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.md,
  },
  feedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedIcon: { fontSize: 16 },
  feedInfo: { flex: 1 },
  feedText: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '600',
  },
  feedTime: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    marginTop: 2,
  },
});
