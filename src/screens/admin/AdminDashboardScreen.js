import React, { useContext, useState, useCallback } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import ProfileMenuButton from '../../components/profile/ProfileMenuButton';
import { colors } from '../../constants/theme';
import { fetchAdminAnalytics } from '../../services/adminService';
import { fetchMatches } from '../../services/matchService';

const quickActions = [
  { title: 'Manage Matches', subtitle: 'Create and control fixtures', route: 'AdminMatchList', accent: colors.primaryLight, icon: '🏟️' },
  { title: 'Analytics', subtitle: 'Revenue and bookings insight', route: 'Statistics', accent: '#22C55E', icon: '📈' },
  { title: 'Users & Roles', subtitle: 'Staff and fan control', route: 'UserManagement', accent: '#F59E0B', icon: '👥' },
  { title: 'System Settings', subtitle: 'Admin preferences and setup', route: 'AdminSettings', accent: '#A78BFA', icon: '⚙️' },
];

export default function AdminDashboardScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({ liveMatches: 0, bookedSeats: 0, fraudCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const handlePress = (route) => navigation.navigate(route);

  const loadMetrics = useCallback(async () => {
    try {
      const matches = await fetchMatches(true);
      const analytics = await fetchAdminAnalytics();

      const live = matches.filter(m => m.status === 'live' || m.status === 'upcoming').length;
      const booked = analytics.attendance?.totalTickets || 0;
      const fraud = Object.values(analytics.fraudAlerts || {}).reduce((a, b) => a + b, 0);

      setMetrics({
        liveMatches: live,
        bookedSeats: booked,
        fraudCount: fraud
      });
    } catch (error) {
      console.log('Failed to fetch admin metrics:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMetrics();
    }, [loadMetrics])
  );

  const operationalItems = [
    { label: 'Active Matches', value: isLoading ? '...' : String(metrics.liveMatches) },
    { label: 'Booked Seats', value: isLoading ? '...' : String(metrics.bookedSeats) },
    { label: 'Security Threats', value: isLoading ? '...' : String(metrics.fraudCount) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.roleBadge}>ADMIN PANEL</Text>
            <Text style={styles.title}>Welcome back, {userInfo?.name || 'Admin'}</Text>
            <Text style={styles.subtitle}>Manage matches, users, pricing, and platform activity from one place.</Text>
          </View>
          <ProfileMenuButton />
        </View>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Operations overview</Text>
            <Text style={styles.heroValue}>Stadium control center</Text>
            <Text style={styles.heroNote}>Everything here is focused on event setup and stadium operations.</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>Live</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          {operationalItems.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionCaption}>Most-used admin tasks</Text>
        </View>

        <View style={styles.actionList}>
          {quickActions.map((item) => (
            <TouchableOpacity key={item.title} style={styles.actionCard} onPress={() => handlePress(item.route)}>
              <View style={[styles.actionIconWrap, { backgroundColor: `${item.accent}20` }]}>
                <Text style={styles.actionIcon}>{item.icon}</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Latest activity</Text>
          <Text style={styles.footerText}>Match pricing updated · 3 minutes ago</Text>
          <Text style={styles.footerText}>New staff account approved · 14 minutes ago</Text>
          <Text style={styles.footerText}>Revenue report generated · Today 09:12</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  roleBadge: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    maxWidth: 260,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 280,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heroValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroNote: {
    color: colors.textSecondary,
    fontSize: 13,
    maxWidth: 240,
  },
  heroPill: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCaption: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  actionList: {
    gap: 10,
    marginBottom: 18,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  arrow: {
    color: colors.primaryLight,
    fontSize: 28,
    lineHeight: 28,
    marginLeft: 6,
  },
  footerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  footerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 15,
  },
});
