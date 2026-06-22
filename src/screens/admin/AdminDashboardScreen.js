import React, { useContext, useState, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { AdminCard } from '../../components/admin/TicketProHeader';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { formatInNepal } from '../../utils/date';
import { fetchAdminAnalytics, fetchUsers } from '../../services/adminService';
import { fetchMatches } from '../../services/matchService';

const CHART_HEIGHTS = [42, 58, 48, 72, 55, 88, 64, 95, 70, 100];

function Sparkline({ heights, color, activeIndex }) {
  return (
    <View style={sparkStyles.wrap}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[
            sparkStyles.bar,
            {
              height: `${h}%`,
              backgroundColor: i === activeIndex ? color : `${color}35`,
            },
          ]}
        />
      ))}
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 28, flex: 1 },
  bar: { flex: 1, borderRadius: 2, minHeight: 4 },
});

export default function AdminDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const [metrics, setMetrics] = useState({
    liveMatches: 0,
    bookedSeats: 0,
    fraudCount: 0,
    revenue: 0,
    totalUsers: 0,
    scannersOnline: 0,
    scannersTotal: 0,
  });
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadMetrics = useCallback(async () => {
    try {
      const [matches, analytics, users] = await Promise.all([
        fetchMatches(true),
        fetchAdminAnalytics(),
        fetchUsers(),
      ]);
      const live = matches.filter((m) => m.status === 'live');
      const active = matches.filter((m) => m.status === 'live' || m.status === 'upcoming');
      const staff = users.filter((u) => ['staff', 'supervisor'].includes(u.role));
      const onlineStaff = staff.filter((u) => u.status !== 'suspended');
      const fraud = Object.values(analytics.securityAlerts || {}).reduce((a, b) => a + b, 0);

      setMetrics({
        liveMatches: active.length,
        bookedSeats: analytics.attendance?.totalTickets || 0,
        fraudCount: fraud,
        revenue: analytics.totalRevenue || 0,
        totalUsers: users.length,
        scannersOnline: onlineStaff.length,
        scannersTotal: staff.length || onlineStaff.length,
      });
      setLiveMatch(live[0] || null);
      setUpcomingMatches(
        matches
          .filter((m) => m.status === 'upcoming')
          .slice(0, 6)
      );
    } catch (e) {
      console.log('Admin metrics error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { refreshing, onRefresh } = useRefresh(loadMetrics);

  useFocusEffect(useCallback(() => { loadMetrics(); }, [loadMetrics]));

  const statCards = useMemo(() => [
    { label: 'Tickets Sold', value: metrics.bookedSeats, delta: '+12.1%', positive: true, color: glass.statusSuccessText },
    { label: 'Active Events', value: metrics.liveMatches, delta: '+3 this month', positive: true, color: glass.brandPurple },
    {
      label: 'Scanners Online',
      value: `${metrics.scannersOnline} / ${Math.max(metrics.scannersTotal, metrics.scannersOnline)}`,
      delta: metrics.scannersTotal > metrics.scannersOnline ? `${metrics.scannersTotal - metrics.scannersOnline} offline` : 'All online',
      positive: metrics.scannersOnline >= metrics.scannersTotal,
      color: metrics.scannersOnline >= metrics.scannersTotal ? glass.statusSuccessText : glass.statusDangerText,
    },
  ], [metrics]);

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}>
          <DashboardHeader
            topLabel="SYSTEM OVERVIEW"
            title={userInfo?.name || 'Admin'}
            avatarColors={colors.gradientGold}
            avatarLabel={initials}
            onAvatarPress={() => navigation.navigate('AdminProfile')}
          />

          <AdminCard style={styles.revenueCard}>
            <Text style={styles.cardLabel}>WEEKLY REVENUE</Text>
            {isLoading ? (
              <ActivityIndicator color={glass.brandPurple} style={{ marginVertical: spacing.lg }} />
            ) : (
              <Text style={styles.revenueValue}>Rs.{metrics.revenue.toLocaleString()}</Text>
            )}
            <Text style={styles.revenueDelta}>↗ +18.4% vs last week</Text>
            <View style={styles.chartArea}>
              <View style={styles.chartBars}>
                {CHART_HEIGHTS.map((h, i) => (
                  <View key={i} style={styles.chartCol}>
                    <View style={[styles.chartBar, { height: `${h}%`, opacity: i >= 8 ? 1 : 0.45 }]} />
                  </View>
                ))}
              </View>
              <View style={styles.chartLabels}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <Text key={`${d}-${i}`} style={styles.chartDay}>{d}</Text>
                ))}
              </View>
            </View>
          </AdminCard>

          {statCards.map((card) => (
            <AdminCard key={card.label} style={styles.statCard}>
              <View style={styles.statTop}>
                <View>
                  <Text style={styles.statLabel}>{card.label}</Text>
                  <Text style={styles.statValue}>
                    {isLoading ? '—' : card.value}
                  </Text>
                </View>
                <Sparkline heights={[30, 45, 40, 60, 55, 75, 65, 80]} color={card.color} activeIndex={7} />
              </View>
              <Text style={[styles.statDelta, { color: card.positive ? glass.statusSuccessText : glass.statusDangerText }]}>
                {card.delta}
              </Text>
            </AdminCard>
          ))}

          {liveMatch && (
            <TouchableOpacity
              style={styles.liveAlert}
              onPress={() => navigation.navigate('Events', { screen: 'AdminMatchDetail', params: { matchId: liveMatch._id } })}
              activeOpacity={0.85}
            >
              <View style={styles.liveDot} />
              <View style={styles.liveTextWrap}>
                <Text style={styles.liveTitle}>
                  {liveMatch.title || `${liveMatch.teamA} vs ${liveMatch.teamB}`} — LIVE NOW
                </Text>
                <Text style={styles.liveSub}>
                  {liveMatch.venue} · {(liveMatch.seatStats?.booked || 0).toLocaleString()} scanned
                </Text>
              </View>
              <Text style={styles.liveChevron}>›</Text>
            </TouchableOpacity>
          )}

          {metrics.fraudCount > 0 && (
            <TouchableOpacity
              style={styles.fraudBanner}
              onPress={() => navigation.navigate('AdminTicketValidation')}
              activeOpacity={0.85}
            >
              <Text style={styles.fraudIcon}>⚠</Text>
              <View style={styles.fraudText}>
                <Text style={styles.fraudTitle}>Fraud Alert</Text>
                <Text style={styles.fraudDesc}>{metrics.fraudCount} security incidents need review</Text>
              </View>
            </TouchableOpacity>
          )}

          {upcomingMatches.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>NEXT UP</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nextRow}>
                {upcomingMatches.map((match) => {
                  const available = match.seatStats?.available ?? 0;
                  const soldOut = available === 0 && (match.seatStats?.total || 0) > 0;
                  const date = match.matchDate
                    ? formatInNepal(match.matchDate, { month: 'short', day: 'numeric' })
                    : 'TBD';
                  return (
                    <TouchableOpacity
                      key={match._id}
                      style={styles.nextCard}
                      onPress={() => navigation.navigate('Events', { screen: 'AdminMatchDetail', params: { matchId: match._id } })}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.nextIcon}>🏟</Text>
                      <Text style={styles.nextTitle} numberOfLines={1}>
                        {match.title || `${match.teamA} vs ${match.teamB}`}
                      </Text>
                      <Text style={styles.nextDate}>{date}</Text>
                      <View style={[styles.nextBadge, soldOut ? styles.nextBadgeSold : styles.nextBadgeSale]}>
                        <Text style={[styles.nextBadgeText, soldOut ? styles.nextBadgeTextSold : styles.nextBadgeTextSale]}>
                          {soldOut ? 'Sold Out' : 'On Sale'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },
  revenueCard: { padding: spacing.xl, marginBottom: spacing.md },
  cardLabel: {
    color: glass.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  revenueValue: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  revenueDelta: {
    color: glass.statusSuccessText,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  chartArea: { marginTop: spacing.sm },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 72, marginBottom: spacing.sm },
  chartCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', backgroundColor: glass.brandPurple, borderRadius: 3, minHeight: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartDay: { flex: 1, textAlign: 'center', color: glass.textMuted, fontSize: 10, fontWeight: '600' },
  statCard: { padding: spacing.xl, marginBottom: spacing.md },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  statLabel: { color: glass.textMuted, fontSize: typography.caption.fontSize, fontWeight: '600', marginBottom: 4 },
  statValue: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900' },
  statDelta: { fontSize: typography.small.fontSize, fontWeight: '600' },
  liveAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,23,68,0.12)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,23,68,0.2)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: glass.statusDangerText },
  liveTextWrap: { flex: 1 },
  liveTitle: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '800', marginBottom: 2 },
  liveSub: { color: glass.textMuted, fontSize: typography.small.fontSize },
  liveChevron: { color: glass.textMuted, fontSize: 20, fontWeight: '600' },
  fraudBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  fraudIcon: { fontSize: 18, color: glass.statusWarningText },
  fraudText: { flex: 1 },
  fraudTitle: { color: glass.statusWarningText, fontSize: typography.captionMedium.fontSize, fontWeight: '800' },
  fraudDesc: { color: glass.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  sectionLabel: {
    color: glass.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  nextRow: { gap: spacing.md, paddingBottom: spacing.xl },
  nextCard: {
    width: 140,
    backgroundColor: glass.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.lg,
  },
  nextIcon: { fontSize: 22, marginBottom: spacing.sm },
  nextTitle: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '800', marginBottom: 4 },
  nextDate: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.md },
  nextBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  nextBadgeSale: { backgroundColor: glass.statusSuccessFill },
  nextBadgeSold: { backgroundColor: glass.brandPurpleSurface },
  nextBadgeText: { fontSize: 9, fontWeight: '800' },
  nextBadgeTextSale: { color: glass.statusSuccessText },
  nextBadgeTextSold: { color: glass.brandPurple },
});
