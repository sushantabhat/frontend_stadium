import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { formatInNepal } from '../../utils/date';

/* ─── Mock forensic data for investigation ───
 * In production, this comes from GET /api/tickets/:code/forensics */
const MOCK_FORENSICS = {
  ticket: {
    code: 'TKT-95476f-A-1-YZ3R0N',
    purchaser: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    purchaseDate: '2026-06-15T14:34:00Z',
    paymentStatus: 'paid',
    amount: 2500,
    seat: 'A-14',
    category: 'VIP',
    match: 'ICC T20 Finals — India vs Pakistan',
    matchDate: '2026-06-18T18:00:00Z',
  },
  scanHistory: [
    { gate: 'Gate B', time: '2026-06-18T18:42:00Z', status: 'approved', staff: 'Vikram' },
    { gate: 'Gate A', time: '2026-06-18T19:15:00Z', status: 'duplicate', staff: 'Priya' },
    { gate: 'Gate A', time: '2026-06-18T19:15:30Z', status: 'duplicate', staff: 'Priya' },
  ],
  customerProfile: {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    accountStatus: 'active',
    previousBookings: 3,
    previousFraudFlags: 0,
    memberSince: '2025-08-12',
  },
};

/* ─── Tab definitions for investigation ── */
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'ticket', label: 'Ticket' },
  { key: 'scans', label: 'Scan History' },
  { key: 'customer', label: 'Customer' },
];

export default function IncidentDetailScreen({ route, navigation }) {
  const { incident } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Mock data (would come from API in production) ── */
  const forensics = MOCK_FORENSICS;
  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  /* ── Action handlers (mock — would POST to API) ── */
  const handleOverride = () => {
    Alert.alert('Override Approved', 'Ticket has been manually approved. Entry allowed.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleDeny = () => {
    Alert.alert('Entry Denied', 'Incident marked as denied. Security notified.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleEscalate = () => {
    Alert.alert('Escalated to Admin', 'This incident has been pushed to the admin team for deeper investigation.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleAcknowledge = () => {
    Alert.alert('Acknowledged', 'Incident marked as acknowledged.', [
      { text: 'OK' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Incident Investigation"
        subtitle={incident?.title || 'Review ticket forensics'}
        onBack={() => navigation.goBack()}
      />

      {/* ═══ INVESTIGATION TABS ═══ */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabGradient}>
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <>
            {/* Incident summary */}
            <View style={styles.card}>
              <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
                <Text style={styles.cardHeader}>INCIDENT SUMMARY</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Type</Text>
                  <Text style={styles.value}>{incident?.type === 'fraud' ? 'Fraud Attempt' : 'Technical Fault'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Severity</Text>
                  <Text style={[styles.value, { color: incident?.severity === 'critical' ? glass.statusDangerText : glass.statusWarningText }]}>
                    {(incident?.severity || 'medium').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Reported By</Text>
                  <Text style={styles.value}>{incident?.staff || 'Gate staff'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Ticket Code</Text>
                  <Text style={[styles.value, { fontFamily: glass.monoFont }]}>{incident?.ticketCode || '—'}</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={styles.value}>{timeAgo(incident?.timestamp)}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Quick actions */}
            <View style={styles.card}>
              <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
                <Text style={styles.cardHeader}>ACTIONS</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={handleAcknowledge} activeOpacity={0.7}>
                  <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtnInner}>
                    <Text style={styles.actionIcon}>👁️</Text>
                    <Text style={styles.actionLabel}>Acknowledge</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </>
        )}

        {/* ═══ TICKET TAB ═══ */}
        {activeTab === 'ticket' && (
          <View style={styles.card}>
            <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
              <Text style={styles.cardHeader}>TICKET FORENSICS</Text>
              {[
                { label: 'Ticket Code', value: forensics.ticket.code, mono: true },
                { label: 'Purchased By', value: forensics.ticket.purchaser },
                { label: 'Purchase Date', value: formatInNepal(forensics.ticket.purchaseDate, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                { label: 'Payment', value: `✅ Paid Rs.${forensics.ticket.amount.toLocaleString()}` },
                { label: 'Seat', value: `${forensics.ticket.seat} (${forensics.ticket.category})` },
                { label: 'Match', value: forensics.ticket.match },
              ].map((item, idx, arr) => (
                <View key={item.label} style={[styles.detailRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={[styles.value, item.mono && { fontFamily: glass.monoFont }]} numberOfLines={1}>{item.value}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        )}

        {/* ═══ SCAN HISTORY TAB ═══ */}
        {activeTab === 'scans' && (
          <View style={styles.card}>
            <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
              <Text style={styles.cardHeader}>FULL AUDIT TRAIL</Text>
              {forensics.scanHistory.map((scan, idx) => (
                <View key={idx} style={[styles.scanRow, idx < forensics.scanHistory.length - 1 && styles.scanRowBorder]}>
                  <View style={styles.scanLeft}>
                    <View style={[styles.scanDot, { backgroundColor: scan.status === 'approved' ? glass.statusSuccessText : glass.statusDangerText }]} />
                    <View>
                      <Text style={styles.scanGate}>{scan.gate}</Text>
                      <Text style={styles.scanTime}>{timeAgo(scan.time)}</Text>
                    </View>
                  </View>
                  <View style={[styles.scanStatusPill, { backgroundColor: scan.status === 'approved' ? glass.statusSuccessFill : glass.statusDangerFill }]}>
                    <Text style={[styles.scanStatusText, { color: scan.status === 'approved' ? glass.statusSuccessText : glass.statusDangerText }]}>
                      {scan.status === 'approved' ? 'APPROVED' : 'DUPLICATE'}
                    </Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </View>
        )}

        {/* ═══ CUSTOMER TAB ═══ */}
        {activeTab === 'customer' && (
          <View style={styles.card}>
            <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
              <Text style={styles.cardHeader}>CUSTOMER PROFILE</Text>
              {[
                { label: 'Name', value: forensics.customerProfile.name },
                { label: 'Email', value: forensics.customerProfile.email },
                { label: 'Account Status', value: forensics.customerProfile.accountStatus.toUpperCase(), color: glass.statusSuccessText },
                { label: 'Previous Bookings', value: String(forensics.customerProfile.previousBookings) },
                { label: 'Fraud Flags', value: String(forensics.customerProfile.previousFraudFlags), color: glass.statusSuccessText },
                { label: 'Member Since', value: formatInNepal(forensics.customerProfile.memberSince, { month: 'short', year: 'numeric' }) },
              ].map((item, idx, arr) => (
                <View key={item.label} style={[styles.detailRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={[styles.value, item.color && { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* ═══ BOTTOM ACTION BUTTONS ═══ */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleOverride} activeOpacity={0.85}>
          <LinearGradient colors={[glass.statusSuccessText, '#00C853']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bottomBtnGradient}>
            <Text style={styles.bottomBtnText}>✅ Override & Allow</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.bottomBtnHalf} onPress={handleDeny} activeOpacity={0.85}>
            <LinearGradient colors={[glass.statusDangerFill, 'rgba(255,23,68,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bottomBtnHalfGradient}>
              <Text style={[styles.bottomBtnHalfText, { color: glass.statusDangerText }]}>❌ Deny</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBtnHalf} onPress={handleEscalate} activeOpacity={0.85}>
            <LinearGradient colors={[glass.statusWarningFill, 'rgba(255,179,0,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bottomBtnHalfGradient}>
              <Text style={[styles.bottomBtnHalfText, { color: glass.statusWarningText }]}>⬆️ Escalate</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingBottom: spacing.huge + spacing.xxl },

  tabBar: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  tabItem: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border },
  tabItemActive: { borderWidth: 0, padding: 0 },
  tabGradient: { flex: 1, width: '100%', paddingVertical: spacing.sm + 2, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  card: { marginHorizontal: spacing.xl, marginBottom: spacing.md, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  cardInner: { padding: spacing.xl },
  cardHeader: { color: glass.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: spacing.lg },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: glass.border },
  label: { color: glass.textSecondary, fontSize: typography.caption.fontSize, flex: 1 },
  value: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: '700', textAlign: 'right', flex: 1.5, marginLeft: spacing.md },

  actionBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  actionBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: glass.border, borderRadius: radii.lg },
  actionIcon: { fontSize: 16 },
  actionLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  scanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  scanRowBorder: { borderBottomWidth: 1, borderBottomColor: glass.border },
  scanLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scanDot: { width: 10, height: 10, borderRadius: 5 },
  scanGate: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  scanTime: { color: glass.textMuted, fontSize: 9, marginTop: 2, fontFamily: glass.monoFont },
  scanStatusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  scanStatusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },

  bottomBar: { padding: spacing.xl, gap: spacing.md, backgroundColor: '#0A0B0E', borderTopWidth: 1, borderTopColor: glass.border },
  bottomBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  bottomBtnGradient: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg },
  bottomBtnText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  bottomRow: { flexDirection: 'row', gap: spacing.md },
  bottomBtnHalf: { flex: 1, borderRadius: radii.lg, overflow: 'hidden' },
  bottomBtnHalfGradient: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg, borderWidth: 1, borderColor: glass.border },
  bottomBtnHalfText: { fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
