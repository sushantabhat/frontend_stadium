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
import { LinearGradient } from 'expo-linear-gradient';
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
          <Text style={styles.subtitle}>Real-time scan monitoring</Text>
        </View>

        {/* Scanner CTA */}
        <TouchableOpacity
          style={styles.scannerCta}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={colors.gradientPurple}
            style={styles.scannerGradient}
          >
            <View style={styles.scannerIconWrap}>
              <Text style={styles.scannerIcon}>📸</Text>
            </View>
            <View style={styles.scannerInfo}>
              <Text style={styles.scannerTitle}>Open Scanner</Text>
              <Text style={styles.scannerDesc}>Scan QR codes for gate entry</Text>
            </View>
            <Text style={styles.scannerArrow}>→</Text>
          </LinearGradient>
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
              { icon: '🕒', label: 'My\nShifts', route: 'MyShifts', color: colors.warning },
              { icon: '📊', label: 'Daily\nReport', route: 'DailyReport', color: colors.accent },
            ].map((t) => (
              <TouchableOpacity
                key={t.label}
                style={styles.toolCard}
                onPress={() => navigation.navigate(t.route)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[`${t.color}20`, `${t.color}08`]}
                  style={styles.toolGradient}
                >
                  <Text style={styles.toolIcon}>{t.icon}</Text>
                  <Text style={styles.toolLabel}>{t.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <View style={styles.scanList}>
            {recentScans.map((scan, idx) => (
              <View key={idx} style={styles.scanItem}>
                <View style={[styles.scanDot, scan.status === 'valid' ? styles.dotValid : styles.dotManual]} />
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>{scan.name}</Text>
                  <Text style={styles.scanSeat}>{scan.seat}</Text>
                </View>
                <View style={styles.scanRight}>
                  <Text style={styles.scanTime}>{scan.time}</Text>
                  <View style={[styles.statusBadge, scan.status === 'valid' ? styles.badgeValid : styles.badgeManual]}>
                    <Text style={[styles.badgeText, scan.status === 'valid' ? styles.badgeTextValid : styles.badgeTextManual]}>
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

  header: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  roleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  roleText: { color: colors.success, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: typography.caption.fontSize, marginTop: spacing.xs },

  // Scanner CTA
  scannerCta: { marginHorizontal: spacing.xl, marginBottom: spacing.xl, borderRadius: radii.xl, overflow: 'hidden', ...shadows.primary },
  scannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  scannerIconWrap: {
    width: 56, height: 56, borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  scannerIcon: { fontSize: 28 },
  scannerInfo: { flex: 1 },
  scannerTitle: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xxs },
  scannerDesc: { color: 'rgba(255,255,255,0.75)', fontSize: typography.small.fontSize },
  scannerArrow: { color: '#FFF', fontSize: 22, fontWeight: '700' },

  // Sections
  section: { marginBottom: spacing.xl, paddingHorizontal: spacing.xl },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center',
  },
  statIcon: { fontSize: 18, marginBottom: spacing.sm },
  statValue: { fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  statLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  // Tools
  toolsRow: { flexDirection: 'row', gap: spacing.md },
  toolCard: { flex: 1, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  toolGradient: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  toolIcon: { fontSize: 20 },
  toolLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 16 },

  // Scans
  scanList: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  scanItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: spacing.md,
  },
  scanDot: { width: 8, height: 8, borderRadius: 4 },
  dotValid: { backgroundColor: colors.success },
  dotManual: { backgroundColor: colors.warning },
  scanInfo: { flex: 1 },
  scanName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  scanSeat: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  scanRight: { alignItems: 'flex-end', gap: spacing.xxs },
  scanTime: { color: colors.textMuted, fontSize: 9 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs + 1, borderRadius: radii.full },
  badgeValid: { backgroundColor: colors.successSurface },
  badgeManual: { backgroundColor: colors.warningSurface },
  badgeText: { fontSize: 9, fontWeight: '700' },
  badgeTextValid: { color: colors.successLight },
  badgeTextManual: { color: colors.warningLight },
});
