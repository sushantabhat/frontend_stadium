import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

const todayStats = [
  { label: 'Scanned', value: '247', icon: '📷', color: colors.primary },
  { label: 'Verified', value: '240', icon: '✅', color: colors.success },
  { label: 'Flagged', value: '7', icon: '⚠️', color: colors.warning },
];

const recentScans = [
  { name: 'Aman Kumar', seat: 'Block A • Row 4 • Seat 12', time: '2m ago', status: 'valid' },
  { name: 'Riya Sharma', seat: 'Block C • Row 2 • Seat 7', time: '5m ago', status: 'valid' },
  { name: 'Mohit Singh', seat: 'Block B • Row 5 • Seat 19', time: '8m ago', status: 'manual' },
  { name: 'Priya Patel', seat: 'Block A • Row 1 • Seat 3', time: '12m ago', status: 'valid' },
];

export default function StaffDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.rolePill}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>STAFF</Text>
          </View>
          <Text style={styles.title}>Gate Operations</Text>
          <Text style={styles.subtitle}>Real-time scan monitoring and ticket verification</Text>
        </View>

        {/* Scanner CTA */}
        <TouchableOpacity
          style={styles.scannerCta}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.85}
        >
          <View style={styles.scannerIconWrap}>
            <Text style={styles.scannerIcon}>📸</Text>
          </View>
          <View style={styles.scannerInfo}>
            <Text style={styles.scannerTitle}>Open Scanner</Text>
            <Text style={styles.scannerDesc}>Scan QR codes for gate entry</Text>
          </View>
          <Text style={styles.scannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
          <View style={styles.statsRow}>
            {todayStats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.toolsRow}>
            {[
              { icon: '🔍', label: 'Verify\nTicket', route: 'TicketVerify', color: colors.info },
              { icon: '🕒', label: 'My\nShifts', route: 'My Shifts', color: colors.warning },
              { icon: '📊', label: 'Daily\nReport', route: 'DailyReport', color: colors.accent },
            ].map((t) => (
              <TouchableOpacity
                key={t.label}
                style={styles.toolCard}
                onPress={() => navigation.navigate(t.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: `${t.color}18` }]}>
                  <Text style={styles.toolIcon}>{t.icon}</Text>
                </View>
                <Text style={styles.toolLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scanList}>
            {recentScans.map((scan, idx) => (
              <View key={idx} style={styles.scanItem}>
                <View style={styles.scanDot} />
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>{scan.name}</Text>
                  <Text style={styles.scanSeat}>{scan.seat}</Text>
                </View>
                <View style={styles.scanRight}>
                  <Text style={styles.scanTime}>{scan.time}</Text>
                  <View style={[styles.statusBadge, scan.status === 'valid' ? styles.statusValid : styles.statusManual]}>
                    <Text style={[styles.statusText, scan.status === 'valid' ? styles.statusTextValid : styles.statusTextManual]}>
                      {scan.status === 'valid' ? '✓ Valid' : '⚠ Manual'}
                    </Text>
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
  scroll: { paddingTop: spacing.md },

  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  roleText: {
    color: colors.success,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    maxWidth: 300,
  },

  // Scanner CTA
  scannerCta: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.primary,
  },
  scannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerIcon: { fontSize: 28 },
  scannerInfo: { flex: 1 },
  scannerTitle: {
    color: '#FFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  scannerDesc: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.small.fontSize,
  },
  scannerArrow: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statIcon: { fontSize: 18, marginBottom: spacing.sm },
  statValue: {
    fontSize: typography.h2.fontSize,
    fontWeight: '900',
    marginBottom: spacing.xxs,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },

  // Tools
  toolsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toolCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  toolIcon: { fontSize: 20 },
  toolLabel: {
    color: colors.textSecondary,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Recent scans
  scanList: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.md,
  },
  scanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  scanInfo: { flex: 1 },
  scanName: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },
  scanSeat: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    marginTop: 2,
  },
  scanRight: { alignItems: 'flex-end', gap: spacing.xxs },
  scanTime: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize - 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.full,
  },
  statusValid: { backgroundColor: colors.successSurface },
  statusManual: { backgroundColor: colors.warningSurface },
  statusText: { fontSize: typography.tiny.fontSize - 1, fontWeight: '700' },
  statusTextValid: { color: colors.successLight },
  statusTextManual: { color: colors.warningLight },
});
