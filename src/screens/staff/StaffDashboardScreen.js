import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchScanHistory } from '../../services/ticketService';
import DashboardHeader from '../../components/DashboardHeader';
import { AdminCard } from '../../components/admin/TicketProHeader';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function StaffDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportNote, setReportNote] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await fetchScanHistory();
      setScans(data);
    } catch (e) {
      console.log('Scan history error:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = () => { setIsRefreshing(true); loadData(); };

  const firstName = userInfo?.name?.split(' ')[0] || 'Staff';
  const initials = (userInfo?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayScans = scans.filter(s => new Date(s.entryTime) >= todayStart);
  const totalToday = todayScans.length;
  const flaggedToday = scans.filter(s => s.status === 'duplicate' || s.status === 'invalid' || s.fraud).length;

  const quickActions = [
    { icon: '🔍', label: 'Verify Ticket', route: 'TicketVerify', color: glass.brandPurple },
    { icon: '🕒', label: 'My Shifts', route: 'MyShifts', color: glass.statusWarningText },
    { icon: '📊', label: 'Daily Report', route: 'DailyReport', color: glass.occupancyTeal },
    { icon: '🚨', label: 'Report Issue', route: '__report', color: glass.statusDangerText },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={glass.brandPurple} colors={[glass.brandPurple]} />}
      >
        <DashboardHeader
          topLabel="GATE OPERATIONS"
          title={`Hey, ${firstName}`}
          avatarColors={[glass.statusSuccessText, '#00A844']}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('Account')}
        />

        <TouchableOpacity
          style={styles.scannerCta}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['rgba(108,92,231,0.15)', 'rgba(108,92,231,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scannerGradient}
          >
            <Text style={styles.scannerEmoji}>📸</Text>
            <View style={styles.scannerInfo}>
              <Text style={styles.scannerTitle}>Open Scanner</Text>
              <Text style={styles.scannerDesc}>Scan QR codes for gate entry</Text>
            </View>
            <View style={styles.scannerArrowWrap}>
              <Text style={styles.scannerArrow}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <AdminCard style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsLabel}>SCANS TODAY</Text>
            {isLoading ? (
              <ActivityIndicator color={glass.brandPurple} size="small" />
            ) : (
              <Text style={styles.statsValue}>{totalToday}</Text>
            )}
            <Text style={styles.statsSub}>
              {totalToday > 0 ? `Last scan ${timeAgo(todayScans[0]?.entryTime)}` : 'No scans yet'}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { backgroundColor: 'rgba(0,230,118,0.1)' }]}>
              <Text style={[styles.statPillValue, { color: glass.statusSuccessText }]}>{totalToday}</Text>
              <Text style={styles.statPillLabel}>Verified</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: 'rgba(255,179,0,0.1)' }]}>
              <Text style={[styles.statPillValue, { color: glass.statusWarningText }]}>{flaggedToday}</Text>
              <Text style={styles.statPillLabel}>Flagged</Text>
            </View>
          </View>
        </AdminCard>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Tools</Text>
        </View>
        <View style={styles.toolsGrid}>
          {quickActions.map((t) => (
            <TouchableOpacity
              key={t.label}
              style={styles.toolCard}
              onPress={() => t.route === '__report' ? setShowReportModal(true) : navigation.navigate(t.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: `${t.color}18` }]}>
                <Text style={styles.toolIcon}>{t.icon}</Text>
              </View>
              <Text style={styles.toolLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={glass.brandPurple} />
          </View>
        ) : scans.length === 0 ? (
          <AdminCard style={styles.emptyCard}>
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptyText}>Start scanning tickets to see history here</Text>
            </View>
          </AdminCard>
        ) : (
          <AdminCard style={styles.timelineCard}>
            {scans.slice(0, 10).map((scan, idx) => (
              <View key={scan._id || idx} style={[styles.timelineItem, idx === 0 && { paddingTop: 0 }]}>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineText}>
                    <Text style={styles.scanName}>{scan.user?.name || 'Unknown'}</Text>
                    <Text style={styles.scanSeat}>
                      {scan.seat?.seatLabel || 'N/A'}
                      {scan.match?.title ? ` · ${scan.match.title}` : ''}
                    </Text>
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={styles.scanTime}>{timeAgo(scan.entryTime)}</Text>
                    <View style={[styles.statusBadge, styles.badgeValid]}>
                      <Text style={styles.badgeText}>✓ Valid</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </AdminCard>
        )}

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>

      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Issue</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {[
              { key: 'fraud', label: 'Fraud — Fake or duplicate ticket' },
              { key: 'technical', label: 'Technical — System or API failure' },
              { key: 'operational', label: 'Operational — Customer dispute' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.reportOption, reportType === item.key && styles.reportOptionActive]}
                onPress={() => setReportType(item.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.reportLabel, reportType === item.key && styles.reportLabelActive]}>{item.label}</Text>
                {reportType === item.key && <Text style={styles.reportCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.reportInput}
              placeholder="Additional details..."
              placeholderTextColor={glass.textMuted}
              value={reportNote}
              onChangeText={setReportNote}
              multiline
            />
            <TouchableOpacity
              style={styles.reportSubmitBtn}
              onPress={() => {
                if (!reportType) { Alert.alert('Required', 'Select an issue type.'); return; }
                Alert.alert('Reported', 'Your issue has been sent to the supervisor on duty.', [
                  { text: 'OK', onPress: () => { setShowReportModal(false); setReportType(''); setReportNote(''); } },
                ]);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[glass.brandPurple, glass.neonMagenta]} style={styles.reportSubmitGradient}>
                <Text style={styles.reportSubmitText}>Submit Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: spacing.lg },

  scannerCta: {
    marginHorizontal: spacing.xl, marginBottom: spacing.xxl,
    borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  scannerGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.xxl, gap: spacing.lg,
  },
  scannerEmoji: { fontSize: 36 },
  scannerInfo: { flex: 1 },
  scannerTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.xxs },
  scannerDesc: { color: glass.textMuted, fontSize: typography.small.fontSize },
  scannerArrowWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: glass.brandPurple,
    alignItems: 'center', justifyContent: 'center',
  },
  scannerArrow: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  statsCard: { marginHorizontal: spacing.xl, padding: spacing.xl, marginBottom: spacing.xxl },
  statsHeader: { marginBottom: spacing.lg },
  statsLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: spacing.sm },
  statsValue: { color: colors.textPrimary, fontSize: 42, fontWeight: '900', lineHeight: 46, marginBottom: spacing.xs },
  statsSub: { color: glass.textMuted, fontSize: typography.small.fontSize },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statPill: { flex: 1, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center' },
  statPillValue: { fontSize: typography.h3.fontSize, fontWeight: '900' },
  statPillLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', letterSpacing: -0.3 },

  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  toolCard: {
    width: '47%', borderRadius: radii.xl,
    borderWidth: 1, borderColor: glass.border,
    backgroundColor: glass.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  toolIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolIcon: { fontSize: 20 },
  toolLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', textAlign: 'center' },

  timelineCard: { marginHorizontal: spacing.xl, padding: spacing.xl },
  timelineItem: { paddingVertical: spacing.md },
  timelineContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  timelineDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: glass.statusSuccessText,
  },
  timelineText: { flex: 1 },
  scanName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  scanSeat: { color: glass.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  timelineRight: { alignItems: 'flex-end', gap: spacing.xxs },
  scanTime: { color: glass.textMuted, fontSize: typography.small.fontSize },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs + 1, borderRadius: radii.full, backgroundColor: 'rgba(0,230,118,0.12)' },
  badgeText: { fontSize: 9, fontWeight: '700', color: glass.statusSuccessText },

  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyCard: { marginHorizontal: spacing.xl, padding: spacing.xxl },
  emptyWrap: { alignItems: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  emptyText: { color: glass.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: glass.canvasStart, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, maxHeight: '85%', borderWidth: 1, borderColor: glass.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: glass.textMuted, fontSize: 20, fontWeight: '600' },
  reportOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.xl, borderRadius: radii.lg, backgroundColor: glass.card, borderWidth: 1, borderColor: glass.border, marginBottom: spacing.sm },
  reportOptionActive: { borderColor: glass.brandPurple, backgroundColor: `${glass.brandPurple}18` },
  reportLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600', flex: 1 },
  reportLabelActive: { color: glass.brandPurple },
  reportCheck: { color: glass.brandPurple, fontSize: 16, fontWeight: '800' },
  reportInput: { backgroundColor: glass.card, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, borderRadius: radii.md, fontSize: typography.body.fontSize, borderWidth: 1, borderColor: glass.border, minHeight: 80, textAlignVertical: 'top', marginTop: spacing.md, marginBottom: spacing.xl },
  reportSubmitBtn: { borderRadius: radii.md, overflow: 'hidden' },
  reportSubmitGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
  reportSubmitText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
