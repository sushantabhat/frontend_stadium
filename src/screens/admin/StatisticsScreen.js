import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors } from '../../constants/theme';
import { fetchAdminAnalytics, fetchFraudLogs } from '../../services/adminService';

function MetricCard({ title, value, caption, color }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricCardTitle}>{title}</Text>
      <Text style={[styles.metricCardValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.metricCardCaption}>{caption}</Text>
    </View>
  );
}

export default function StatisticsScreen({ navigation }) {
  const [analytics, setAnalytics] = useState(null);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await fetchAdminAnalytics();
      setAnalytics(data);

      const logs = await fetchFraudLogs();
      setFraudLogs(logs);
    } catch (error) {
      console.log('Failed to fetch analytics:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Analytics" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      </View>
    );
  }

  const sales = analytics?.salesByCategory || {};
  const attendance = analytics?.attendance || {};
  const fraudAlerts = analytics?.fraudAlerts || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Statistics & Analytics"
        subtitle="Live stadium operations and revenue statistics"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Core summary metrics */}
        <View style={styles.metricsRow}>
          <MetricCard
            title="TOTAL REVENUE"
            value={`₹${analytics?.totalRevenue || 0}`}
            caption="Direct ticket purchases"
            color={colors.primaryLight}
          />
          <MetricCard
            title="ENTRY RATE"
            value={`${attendance.entryRate || '0.0'}%`}
            caption={`${attendance.scannedTickets || 0}/${attendance.totalTickets || 0} checked in`}
            color={colors.success}
          />
        </View>

        {/* AI Fraud metrics banner */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🤖 AI SECURITY & FRAUD MONITORS</Text>
          <View style={styles.fraudGrid}>
            <View style={styles.fraudBox}>
              <Text style={styles.fraudValue}>{fraudAlerts.duplicate_scan || 0}</Text>
              <Text style={styles.fraudLabel}>Duplicate Scans</Text>
            </View>
            <View style={styles.fraudBox}>
              <Text style={styles.fraudValue}>{fraudAlerts.invalid_ticket || 0}</Text>
              <Text style={styles.fraudLabel}>Fake QR Attempts</Text>
            </View>
            <View style={styles.fraudBox}>
              <Text style={styles.fraudValue}>{fraudAlerts.unauthorized_attempt || 0}</Text>
              <Text style={styles.fraudLabel}>Repeated Blocks</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>CATEGORY-WISE SALES</Text>
          {['vip', 'premium', 'general'].map((cat) => {
            const data = sales[cat] || { count: 0, revenue: 0 };
            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={styles.catNameCol}>
                  <Text style={styles.catName}>{cat.toUpperCase()}</Text>
                  <Text style={styles.catCount}>{data.count} Sold</Text>
                </View>
                <Text style={styles.catRevenue}>₹{data.revenue}</Text>
              </View>
            );
          })}
        </View>

        {/* Match Occupancies */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>MATCH PERFORMANCE & DEMAND</Text>
          {analytics?.matchPerformance?.length === 0 ? (
            <Text style={styles.emptyText}>No fixtures created.</Text>
          ) : (
            analytics?.matchPerformance?.map((match) => (
              <View key={match.matchId} style={styles.matchPerformanceRow}>
                <View style={styles.matchPerformanceInfo}>
                  <Text style={styles.matchPerformanceTitle} numberOfLines={1}>
                    {match.title}
                  </Text>
                  <Text style={styles.matchPerformanceRevenue}>Revenue: ₹{match.revenue}</Text>
                </View>
                <View style={styles.progressColumn}>
                  <Text style={styles.progressLabel}>{match.occupancy}% Occupied</Text>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(Number(match.occupancy), 100)}%`,
                          backgroundColor:
                            Number(match.occupancy) > 75 ? colors.danger : colors.primaryLight,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Live Fraud Attempt Feed */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>LIVE SECURITY THREAT LOGS</Text>
          {fraudLogs.length === 0 ? (
            <Text style={styles.emptyText}>No security threat patterns flagged.</Text>
          ) : (
            fraudLogs.map((log) => (
              <View key={log._id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logReason}>
                    ⚠️ {log.reason === 'duplicate_scan' ? 'DUPLICATE ENTRY attempt' : 'FAKE SIGNATURE'}
                  </Text>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.logDetails}>{log.details}</Text>
                <Text style={styles.logStaff}>Gate Staff: {log.scannedBy?.name || 'Gate staff'}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  metricCardTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.0,
  },
  metricCardValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4,
  },
  metricCardCaption: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  fraudGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  fraudBox: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  fraudValue: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '800',
  },
  fraudLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: `${colors.border}50`,
  },
  catNameCol: {
    flexDirection: 'column',
  },
  catName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  catCount: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  catRevenue: {
    color: colors.primaryLight,
    fontSize: 15,
    fontWeight: '800',
  },
  matchPerformanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: `${colors.border}50`,
    gap: 12,
  },
  matchPerformanceInfo: {
    flex: 1,
  },
  matchPerformanceTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  matchPerformanceRevenue: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  progressColumn: {
    width: 110,
    alignItems: 'flex-end',
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14,
  },
  logItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: `${colors.border}50`,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logReason: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  logTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  logDetails: {
    color: colors.textPrimary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  logMuted: {
    color: colors.textMuted,
  },
  logStaff: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
});
