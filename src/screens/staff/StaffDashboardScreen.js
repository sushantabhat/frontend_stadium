import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/theme';
import ProfileMenuButton from '../../components/profile/ProfileMenuButton';

const scanStats = [
  { label: 'Scans today', value: '247' },
  { label: 'Verified', value: '240' },
  { label: 'Exceptions', value: '7' },
];

const recentScans = [
  { name: 'Aman Kumar', seat: 'Block A • Row 4 • Seat 12', status: 'Valid' },
  { name: 'Riya Sharma', seat: 'Block C • Row 2 • Seat 7', status: 'Valid' },
  { name: 'Mohit Singh', seat: 'Block B • Row 5 • Seat 19', status: 'Manual check' },
];

export default function StaffDashboardScreen({ navigation }) {
  const goTo = (route) => navigation.navigate(route);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.roleBadge}>STAFF CONSOLE</Text>
            <Text style={styles.title}>Entry scanner</Text>
            <Text style={styles.subtitle}>Quick validation for stadium entry and ticket checks.</Text>
          </View>
          <ProfileMenuButton />
        </View>

        <View style={styles.scanHero}>
          <Text style={styles.scanIcon}>📱</Text>
          <Text style={styles.scanTitle}>Ready to scan</Text>
          <Text style={styles.scanText}>Open the scanner to verify tickets at the gate with real-time validation.</Text>
          <TouchableOpacity style={styles.scanButton} onPress={() => goTo('GateScanner')}>
            <Text style={styles.scanButtonText}>Open scanner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsRow}>
          {scanStats.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shift tools</Text>
          <Text style={styles.sectionCaption}>Everything needed for gate operations</Text>
        </View>

        <View style={styles.toolsGrid}>
          <TouchableOpacity style={styles.toolCard} onPress={() => goTo('GateScanner')}>
            <Text style={styles.toolIcon}>📷</Text>
            <Text style={styles.toolTitle}>Scanner</Text>
            <Text style={styles.toolText}>Validate ticket QR codes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => goTo('TicketVerify')}>
            <Text style={styles.toolIcon}>🎫</Text>
            <Text style={styles.toolTitle}>Verify tickets</Text>
            <Text style={styles.toolText}>Check manually when needed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => goTo('MyShifts')}>
            <Text style={styles.toolIcon}>🕒</Text>
            <Text style={styles.toolTitle}>My shift</Text>
            <Text style={styles.toolText}>Review today’s schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => goTo('DailyReport')}>
            <Text style={styles.toolIcon}>📊</Text>
            <Text style={styles.toolTitle}>Reports</Text>
            <Text style={styles.toolText}>See today’s scan summary</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Recent scans</Text>
          {recentScans.map((scan) => (
            <View key={scan.name} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineName}>{scan.name}</Text>
                <Text style={styles.timelineSeat}>{scan.seat}</Text>
              </View>
              <Text style={styles.timelineStatus}>{scan.status}</Text>
            </View>
          ))}
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
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
    maxWidth: 240,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 280,
  },
  scanHero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  scanIcon: {
    fontSize: 46,
    marginBottom: 12,
  },
  scanTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  scanText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  scanButton: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  toolCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  toolIcon: {
    fontSize: 22,
    marginBottom: 10,
  },
  toolTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  toolText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  timelineTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
    marginRight: 12,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineSeat: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  timelineStatus: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
});
