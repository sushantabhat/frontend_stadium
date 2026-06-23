import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMyActiveShift, fetchMyShifts } from '../../services/ticketService';

export default function MyShiftsScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [activeShift, setActiveShift] = useState(null);
  const [allShifts, setAllShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const initials = (userInfo?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const [active, all] = await Promise.all([
        fetchMyActiveShift(),
        fetchMyShifts(),
      ]);
      setActiveShift(active);
      setAllShifts(all || []);
    } catch (e) {
      console.log('Shifts load error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { refreshing, onRefresh } = useRefresh(() => loadData(true));

  const upcoming = allShifts.filter(s => !activeShift || s._id !== activeShift._id);

  const formatDate = (d) => {
    if (!d) return '—';
    const opts = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kathmandu' };
    return new Date(d).toLocaleDateString('en-US', opts);
  };

  const formatTime = (d) => {
    if (!d) return '—';
    const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu' };
    return new Date(d).toLocaleTimeString('en-US', opts);
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="SCHEDULE"
          title="My Shifts"
          avatarColors={['#00C853', '#00A844']}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('Account')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.huge }} />
          ) : (
            <>
              {activeShift && (
                <View style={styles.heroShift}>
                  <LinearGradient colors={colors.gradientPurple} style={styles.heroShiftInner}>
                    <View style={styles.heroTop}>
                      <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>ON SHIFT</Text>
                      </View>
                      <Text style={styles.heroTime}>{formatTime(activeShift.match?.matchDate)}</Text>
                    </View>
                    <Text style={styles.heroMatch}>{activeShift.match?.title || 'Today\'s Match'}</Text>
                    <Text style={styles.heroGate}>{activeShift.gate}</Text>
                    <TouchableOpacity style={styles.checkInBtn} activeOpacity={0.85}>
                      <Text style={styles.checkInText}>✓ Checked In</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              {upcoming.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Upcoming</Text>
                  <View style={styles.shiftsList}>
                    {upcoming.map((shift, idx) => (
                      <View key={shift._id} style={[styles.shiftItem, idx < upcoming.length - 1 && styles.shiftItemBorder]}>
                        <View style={styles.shiftLeft}>
                          <View style={styles.shiftDateBox}>
                            <Text style={styles.shiftDay}>{formatDate(shift.date).split(',')[0]}</Text>
                            <Text style={styles.shiftDateNum}>{formatDate(shift.date).split(',')[1]?.trim()}</Text>
                          </View>
                        </View>
                        <View style={styles.shiftCenter}>
                          <Text style={styles.shiftMatch}>{shift.match?.title || 'Unknown Match'}</Text>
                          <Text style={styles.shiftTime}>{shift.match?.matchDate ? formatTime(shift.match.matchDate) : '—'}</Text>
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
              )}

              {!activeShift && upcoming.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyTitle}>No shifts assigned</Text>
                  <Text style={styles.emptyDesc}>Ask your admin to assign you to a match</Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: spacing.xxxl + 20 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  emptyDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center' },
});
