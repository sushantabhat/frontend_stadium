import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TicketProHeader, { AdminCard } from '../../components/admin/TicketProHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchAdminAnalytics, fetchFraudLogs } from '../../services/adminService';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function formatRevenue(value) {
  if (value >= 1000000) return `Rs.${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs.${Math.round(value / 1000)}K`;
  return `Rs.${value}`;
}

export default function StatisticsScreen({ navigation }) {
  const [analytics, setAnalytics] = useState(null);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const [data, logs] = await Promise.all([fetchAdminAnalytics(), fetchFraudLogs()]);
      setAnalytics(data);
      setFraudLogs(logs);
    } catch (error) {
      console.log('Failed to fetch analytics:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadAnalytics(); }, [loadAnalytics]));

  const sales = analytics?.salesByCategory || {};
  const attendance = analytics?.attendance || {};
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalTickets = attendance.totalTickets || 0;
  const avgTicket = totalTickets > 0 ? Math.round(totalRevenue / totalTickets) : 0;
  const occupancy = attendance.entryRate || '0.0';
  const refundRate = fraudLogs.length > 0 ? ((fraudLogs.length / Math.max(totalTickets, 1)) * 100).toFixed(1) : '0.0';

  const barHeights = MONTHS.map((_, i) => 35 + i * 12 + (i === 5 ? 15 : 0));

  const handleExport = () => {
    Alert.alert('Export', 'Report export will be available in a future update.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.center}><ActivityIndicator size="large" color={glass.brandPurple} /></View>
      </SafeAreaView>
    );
  }

  const latestFraud = fraudLogs[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TicketProHeader showLive />

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>ANALYTICS</Text>
            <Text style={styles.pageTitle}>Reports</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.75}>
            <Text style={styles.exportText}>↓ Export</Text>
          </TouchableOpacity>
        </View>

        <AdminCard style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.cardLabel}>MONTHLY REVENUE</Text>
            <Text style={styles.growth}>↗ 22.8%</Text>
          </View>
          <Text style={styles.revenueValue}>{formatRevenue(totalRevenue)}</Text>
          <Text style={styles.revenueSub}>Year to date · Jan — Jun 2026</Text>
          <View style={styles.chart}>
            {barHeights.map((h, i) => (
              <View key={MONTHS[i]} style={styles.chartCol}>
                <View style={[styles.chartBar, { height: h, opacity: i === 5 ? 1 : 0.45 + i * 0.08 }]} />
                <Text style={styles.chartLabel}>{MONTHS[i]}</Text>
              </View>
            ))}
          </View>
        </AdminCard>

        <View style={styles.grid}>
          {[
            { label: 'Avg Ticket Price', value: `Rs.${avgTicket}`, delta: '+Rs.12', positive: true },
            { label: 'Occupancy Rate', value: `${occupancy}%`, delta: '+3.1%', positive: true },
            { label: 'Refund Rate', value: `${refundRate}%`, delta: '-0.4%', positive: true },
            { label: 'Tickets Sold', value: totalTickets.toLocaleString(), delta: '+4%', positive: true },
          ].map((item) => (
            <AdminCard key={item.label} style={styles.gridCard}>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <Text style={styles.gridValue}>{item.value}</Text>
              <Text style={[styles.gridDelta, { color: glass.statusSuccessText }]}>{item.delta}</Text>
            </AdminCard>
          ))}
        </View>

        {latestFraud && (
          <TouchableOpacity
            style={styles.fraudAlert}
            onPress={() => navigation.navigate('AdminTicketValidation')}
            activeOpacity={0.85}
          >
            <Text style={styles.fraudIcon}>⚠</Text>
            <View style={styles.fraudContent}>
              <Text style={styles.fraudTitle}>
                Fraud Alert · {latestFraud.ticket?.ticketCode || 'TK-00000'}
              </Text>
              <Text style={styles.fraudDesc} numberOfLines={2}>
                {latestFraud.details || latestFraud.reason || 'Suspicious scan activity detected'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>DOWNLOAD REPORTS</Text>
        <AdminCard style={styles.reportCard}>
          <View style={styles.reportAccent} />
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Revenue Report</Text>
            <Text style={styles.reportDesc}>Breakdown by event & type</Text>
            <Text style={styles.reportSize}>2.4 MB</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleExport}>
            <Text style={styles.downloadIcon}>↓</Text>
          </TouchableOpacity>
        </AdminCard>

        <AdminCard style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Category Sales</Text>
          {(() => {
            const CATEGORY_COLORS_MAP = {
              platinum: '#E8E8E8', gold: '#FFD700', silver: '#A8A8A8', bronze: '#CD7F32',
              general: '#5B9BD5', category1: '#FFD700', category2: '#FF6B6B', category3: '#A29BFE',
              category4: '#EF5350', supporters: '#81C784', premium: glass.brandPurple,
            };
            return Object.entries(sales || {})
              .filter(([, data]) => data && (data.count > 0 || data.revenue > 0))
              .slice(0, 6)
              .map(([cat, data], idx) => {
                const catColor = CATEGORY_COLORS_MAP[cat] || '#888';
                return (
                  <View key={cat} style={[styles.breakdownRow, idx < Object.keys(sales).length - 1 && styles.breakdownBorder]}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <View>
                        <Text style={styles.catName}>{cat.toUpperCase()}</Text>
                        <Text style={styles.catCount}>{data.count} sold</Text>
                      </View>
                    </View>
                    <Text style={[styles.catRevenue, { color: catColor }]}>Rs.{(data.revenue || 0).toLocaleString()}</Text>
                  </View>
                );
              });
          })()}
        </AdminCard>

        {analytics?.matchPerformance?.length > 0 && (
          <AdminCard style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Event Performance</Text>
            {analytics.matchPerformance.slice(0, 4).map((match, idx) => (
              <View key={match.matchId} style={[styles.breakdownRow, idx < 3 && styles.breakdownBorder]}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.matchName} numberOfLines={1}>{match.title}</Text>
                  <Text style={styles.catCount}>Rs.{match.revenue.toLocaleString()} revenue</Text>
                </View>
                <Text style={styles.occupancy}>{match.occupancy}%</Text>
              </View>
            ))}
          </AdminCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.xl },
  eyebrow: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: spacing.xs },
  pageTitle: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', letterSpacing: -0.4 },
  exportBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.card,
  },
  exportText: { color: glass.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700' },
  revenueCard: { padding: spacing.xl, marginBottom: spacing.md },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  growth: { color: glass.statusSuccessText, fontSize: typography.caption.fontSize, fontWeight: '700' },
  revenueValue: { color: colors.textPrimary, fontSize: 36, fontWeight: '900', letterSpacing: -0.5, marginBottom: spacing.xs },
  revenueSub: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.xl },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, height: 100 },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBar: { width: '100%', backgroundColor: glass.brandPurple, borderRadius: 4, marginBottom: spacing.sm, minHeight: 8 },
  chartLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  gridCard: { width: '47%', padding: spacing.lg },
  gridLabel: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600', marginBottom: spacing.sm },
  gridValue: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xs },
  gridDelta: { fontSize: typography.small.fontSize, fontWeight: '600' },
  fraudAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  fraudIcon: { color: glass.statusWarningText, fontSize: 16, fontWeight: '800', marginTop: 2 },
  fraudContent: { flex: 1 },
  fraudTitle: { color: glass.statusWarningText, fontSize: typography.captionMedium.fontSize, fontWeight: '800', marginBottom: 4 },
  fraudDesc: { color: glass.textMuted, fontSize: typography.small.fontSize, lineHeight: 18 },
  sectionLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: spacing.md },
  reportCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, overflow: 'hidden' },
  reportAccent: { width: 4, alignSelf: 'stretch', backgroundColor: glass.brandPurple },
  reportContent: { flex: 1, padding: spacing.lg },
  reportTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: 2 },
  reportDesc: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: 4 },
  reportSize: { color: glass.textMuted, fontSize: 10, fontWeight: '600' },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: glass.brandPurpleSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  downloadIcon: { color: glass.brandPurple, fontSize: 16, fontWeight: '800' },
  breakdownCard: { padding: spacing.xl, marginBottom: spacing.lg },
  breakdownTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.lg },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  breakdownBorder: { borderBottomWidth: 1, borderBottomColor: glass.border },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  catCount: { color: glass.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  catRevenue: { fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  matchName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', maxWidth: 200 },
  occupancy: { color: glass.brandPurple, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
