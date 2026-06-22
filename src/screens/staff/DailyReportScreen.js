import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { colors, spacing, radii, typography } from '../../constants/theme';

const REPORT_DATA = {
  totalScans: 247,
  verified: 240,
  flagged: 7,
  peakHour: '6:00 PM — 7:00 PM',
  gateBreakdown: [
    { gate: 'Gate A', scanned: 98, verified: 95 },
    { gate: 'Gate B', scanned: 78, verified: 76 },
    { gate: 'Gate C', scanned: 52, verified: 50 },
    { gate: 'Gate D', scanned: 19, verified: 19 },
  ],
};

export default function DailyReportScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const initials = (userInfo?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const successRate = ((REPORT_DATA.verified / REPORT_DATA.totalScans) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <DashboardHeader
        topLabel="REPORTING"
        title="Daily Report"
        avatarColors={['#00C853', '#00A844']}
        avatarLabel={initials}
        onAvatarPress={() => navigation.navigate('Account')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero stat */}
        <View style={styles.heroStat}>
          <LinearGradient
            colors={[`${colors.primary}25`, `${colors.primary}08`]}
            style={styles.heroStatInner}
          >
            <View>
              <Text style={styles.heroStatLabel}>SUCCESS RATE</Text>
              <Text style={styles.heroStatValue}>{successRate}%</Text>
              <Text style={styles.heroStatSub}>{REPORT_DATA.verified} of {REPORT_DATA.totalScans} verified</Text>
            </View>
            <Text style={styles.heroStatEmoji}>📊</Text>
          </LinearGradient>
        </View>

        {/* Quick stats */}
        <View style={styles.statRow}>
          {[
            { label: 'Total Scans', value: String(REPORT_DATA.totalScans), icon: '📷', color: colors.primary },
            { label: 'Flagged', value: String(REPORT_DATA.flagged), icon: '⚠️', color: colors.warning },
            { label: 'Peak Hour', value: REPORT_DATA.peakHour.split('—')[0].trim(), icon: '⏰', color: colors.info },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Gate breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gate Breakdown</Text>
          <View style={styles.gateCard}>
            {REPORT_DATA.gateBreakdown.map((gate, idx) => {
              const barWidth = `${(gate.scanned / REPORT_DATA.totalScans) * 100}%`;
              return (
                <View key={gate.gate} style={[styles.gateItem, idx < REPORT_DATA.gateBreakdown.length - 1 && styles.gateItemBorder]}>
                  <View style={styles.gateHeader}>
                    <Text style={styles.gateName}>{gate.gate}</Text>
                    <Text style={styles.gateCount}>{gate.scanned} scans</Text>
                  </View>
                  <View style={styles.barBg}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.barFill, { width: barWidth }]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: spacing.md },

  heroStat: { marginHorizontal: spacing.xl, marginBottom: spacing.xxl, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroStatInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xxl },
  heroStatLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  heroStatValue: { color: colors.primaryLight, fontSize: 42, fontWeight: '900', lineHeight: 46, marginBottom: spacing.xs },
  heroStatSub: { color: colors.textMuted, fontSize: typography.small.fontSize },
  heroStatEmoji: { fontSize: 44, opacity: 0.4 },

  statRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: spacing.sm },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  statLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '600', textAlign: 'center' },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.md },

  gateCard: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  gateItem: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2 },
  gateItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  gateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  gateName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  gateCount: { color: colors.textMuted, fontSize: typography.small.fontSize },
  barBg: { height: 6, backgroundColor: colors.surfaceElevated, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
