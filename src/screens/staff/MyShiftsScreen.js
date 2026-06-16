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
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

const SHIFTS = [
  { match: 'India vs Australia', date: 'Today', time: '2:00 PM — 10:00 PM', gate: 'Gate A', status: 'active', checkedIn: true },
  { match: 'India vs England', date: 'Sat, Jun 21', time: '6:00 PM — 11:00 PM', gate: 'Gate B', status: 'upcoming', checkedIn: false },
  { match: 'Mumbai vs Chennai', date: 'Sun, Jun 22', time: '3:00 PM — 9:00 PM', gate: 'Gate A', status: 'upcoming', checkedIn: false },
];

export default function MyShiftsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="My Shifts" subtitle="Work schedule" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Today's shift highlight */}
        {SHIFTS[0].status === 'active' && (
          <View style={styles.heroShift}>
            <LinearGradient colors={colors.gradientPurple} style={styles.heroShiftInner}>
              <View style={styles.heroTop}>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>ON SHIFT</Text>
                </View>
                <Text style={styles.heroTime}>{SHIFTS[0].time}</Text>
              </View>
              <Text style={styles.heroMatch}>{SHIFTS[0].match}</Text>
              <Text style={styles.heroGate}>{SHIFTS[0].gate}</Text>
              <TouchableOpacity style={styles.checkInBtn} activeOpacity={0.85}>
                <Text style={styles.checkInText}>
                  {SHIFTS[0].checkedIn ? '✓ Checked In' : 'Check In Now'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Upcoming shifts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.shiftsList}>
            {SHIFTS.filter(s => s.status === 'upcoming').map((shift, idx) => (
              <View key={idx} style={[styles.shiftItem, idx < SHIFTS.length - 2 && styles.shiftItemBorder]}>
                <View style={styles.shiftLeft}>
                  <View style={styles.shiftDateBox}>
                    <Text style={styles.shiftDay}>{shift.date.split(',')[0]}</Text>
                    <Text style={styles.shiftDateNum}>{shift.date.split(',')[1]?.trim()}</Text>
                  </View>
                </View>
                <View style={styles.shiftCenter}>
                  <Text style={styles.shiftMatch}>{shift.match}</Text>
                  <Text style={styles.shiftTime}>{shift.time}</Text>
                  <Text style={styles.shiftGate}>{shift.gate}</Text>
                </View>
                <View style={styles.shiftRight}>
                  <View style={styles.upcomingPill}>
                    <Text style={styles.upcomingText}>UPCOMING</Text>
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

  heroShift: { marginHorizontal: spacing.xl, marginBottom: spacing.xxl, borderRadius: radii.xl, overflow: 'hidden', ...shadows.primary },
  heroShiftInner: { padding: spacing.xxl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  liveText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  heroTime: { color: 'rgba(255,255,255,0.8)', fontSize: typography.small.fontSize },
  heroMatch: { color: '#FFF', fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xs },
  heroGate: { color: 'rgba(255,255,255,0.7)', fontSize: typography.caption.fontSize, marginBottom: spacing.xl },
  checkInBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  checkInText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.md },

  shiftsList: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  shiftItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, gap: spacing.md },
  shiftItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  shiftLeft: {},
  shiftDateBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  shiftDay: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  shiftDateNum: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  shiftCenter: { flex: 1 },
  shiftMatch: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  shiftTime: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  shiftGate: { color: colors.primaryLight, fontSize: 9, fontWeight: '700', marginTop: 2 },
  shiftRight: {},
  upcomingPill: { backgroundColor: colors.surfaceElevated, borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
  upcomingText: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
});
