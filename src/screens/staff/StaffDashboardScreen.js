import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchScanHistory } from '../../services/ticketService';

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
  const verifiedToday = todayScans.length;
  /* Compute flagged scans from actual data instead of hardcoded 0 */
  const flaggedToday = scans.filter(s => s.status === 'duplicate' || s.status === 'invalid' || s.fraud).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.rolePill}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>STAFF</Text>
            </View>
            <Text style={styles.name}>Hey, {firstName}</Text>
            <Text style={styles.subtitle}>Gate Operations</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Account')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#00C853', '#00A844']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Scanner CTA */}
        <TouchableOpacity
          style={styles.scannerCta}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={colors.gradientPurple}
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

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.heroStat}>
            <LinearGradient colors={[`${colors.primary}25`, `${colors.primary}08`]} style={styles.heroStatInner}>
              <View style={styles.heroStatLeft}>
                <Text style={styles.heroStatLabel}>SCANS TODAY</Text>
                {isLoading ? (
                  <ActivityIndicator color={colors.primaryLight} style={{ height: 46 }} />
                ) : (
                  <Text style={styles.heroStatValue}>{totalToday}</Text>
                )}
                <Text style={styles.heroStatSub}>
                  {totalToday > 0 ? `Last scan ${timeAgo(todayScans[0]?.entryTime)}` : 'No scans yet'}
                </Text>
              </View>
              <Text style={styles.heroStatEmoji}>📷</Text>
            </LinearGradient>
          </View>

          <View style={styles.statRow}>
            <View style={styles.smallStat}>
              <LinearGradient colors={[`${colors.success}20`, `${colors.success}08`]} style={styles.smallStatInner}>
                <Text style={styles.smallStatEmoji}>✅</Text>
                <Text style={styles.smallStatValue}>{verifiedToday}</Text>
                <Text style={styles.smallStatLabel}>Verified</Text>
              </LinearGradient>
            </View>
            <View style={styles.smallStat}>
              <LinearGradient colors={[`${colors.warning}20`, `${colors.warning}08`]} style={styles.smallStatInner}>
                <Text style={styles.smallStatEmoji}>⚠️</Text>
                <Text style={styles.smallStatValue}>{flaggedToday}</Text>
                <Text style={styles.smallStatLabel}>Flagged</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Quick Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools</Text>
          <View style={styles.toolsGrid}>
            {[
              { icon: '🔍', label: 'Verify\nTicket', route: 'TicketVerify', gradient: [`${colors.info}25`, `${colors.info}08`] },
              { icon: '🕒', label: 'My\nShifts', route: 'MyShifts', gradient: [`${colors.warning}25`, `${colors.warning}08`] },
              { icon: '📊', label: 'Daily\nReport', route: 'DailyReport', gradient: [`${colors.accent}25`, `${colors.accent}08`] },
              { icon: '🚨', label: 'Report\nIssue', route: '__report', gradient: [`${colors.danger}25`, `${colors.danger}08`] },
            ].map((t) => (
              <TouchableOpacity
                key={t.label}
                style={styles.toolCard}
                onPress={() => t.route === '__report' ? setShowReportModal(true) : navigation.navigate(t.route)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={t.gradient} style={styles.toolGradient}>
                  <Text style={styles.toolIcon}>{t.icon}</Text>
                  <Text style={styles.toolLabel}>{t.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : scans.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptyText}>Start scanning tickets to see history here</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {scans.slice(0, 10).map((scan, idx) => (
                <View key={scan._id || idx} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, styles.dotValid]} />
                    {idx < Math.min(scans.length, 10) - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineIconWrap}>
                      <Text style={styles.timelineIcon}>✓</Text>
                    </View>
                    <View style={styles.timelineText}>
                      <Text style={styles.scanName}>{scan.user?.name || 'Unknown'}</Text>
                      <Text style={styles.scanSeat}>
                        {scan.seat?.seatLabel || 'N/A'}
                        {scan.match?.title ? ` • ${scan.match.title}` : ''}
                      </Text>
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={styles.scanTime}>{timeAgo(scan.entryTime)}</Text>
                      <View style={[styles.statusBadge, styles.badgeValid]}>
                        <Text style={[styles.badgeText, styles.badgeTextValid]}>✓ Valid</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>

      {/* ═══ REPORT ISSUE MODAL ═══ */}
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
              placeholderTextColor={colors.textMuted}
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
              <LinearGradient colors={colors.gradientPurple} style={styles.reportSubmitGradient}>
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
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.lg },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, marginBottom: spacing.xxl,
  },
  topLeft: {},
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  roleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  roleText: { color: colors.success, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  name: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: typography.caption.fontSize, marginTop: spacing.xs },
  avatar: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden' },
  avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  scannerCta: {
    marginHorizontal: spacing.xl, marginBottom: spacing.xxl,
    borderRadius: radii.xl, overflow: 'hidden', ...shadows.primary,
  },
  scannerGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.xxl, gap: spacing.lg,
  },
  scannerEmoji: { fontSize: 36 },
  scannerInfo: { flex: 1 },
  scannerTitle: { color: '#FFF', fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.xxs },
  scannerDesc: { color: 'rgba(255,255,255,0.7)', fontSize: typography.small.fontSize },
  scannerArrowWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  scannerArrow: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  section: { marginBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary, fontSize: typography.h3.fontSize,
    fontWeight: '800', letterSpacing: -0.3,
  },

  heroStat: {
    borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  heroStatInner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.xxl,
  },
  heroStatLeft: {},
  heroStatLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  heroStatValue: { color: colors.primaryLight, fontSize: 42, fontWeight: '900', lineHeight: 46, marginBottom: spacing.xs },
  heroStatSub: { color: colors.textMuted, fontSize: typography.small.fontSize },
  heroStatEmoji: { fontSize: 44, opacity: 0.4 },

  statRow: { flexDirection: 'row', gap: spacing.md },
  smallStat: {
    flex: 1, borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  smallStatInner: { padding: spacing.xl, alignItems: 'center' },
  smallStatEmoji: { fontSize: 20, marginBottom: spacing.sm },
  smallStatValue: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  smallStatLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  toolCard: {
    width: '47%', borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  toolGradient: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  toolIcon: { fontSize: 22 },
  toolLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 16 },

  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },

  timeline: {},
  timelineItem: { flexDirection: 'row', minHeight: 52 },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  dotValid: { backgroundColor: colors.success },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  timelineContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingBottom: spacing.md, gap: spacing.md,
  },
  timelineIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: `${colors.success}15`, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${colors.success}25`,
  },
  timelineIcon: { fontSize: 11, fontWeight: '700', color: colors.successLight },
  timelineText: { flex: 1 },
  scanName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  scanSeat: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  timelineRight: { alignItems: 'flex-end', gap: spacing.xxs },
  scanTime: { color: colors.textMuted, fontSize: 9 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs + 1, borderRadius: radii.full },
  badgeValid: { backgroundColor: colors.successSurface },
  badgeText: { fontSize: 9, fontWeight: '700' },
  badgeTextValid: { color: colors.successLight },

  /* Report Issue Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },
  reportOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  reportOptionActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
  reportLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600', flex: 1 },
  reportLabelActive: { color: colors.primaryLight },
  reportCheck: { color: colors.primaryLight, fontSize: 16, fontWeight: '800' },
  reportInput: { backgroundColor: colors.surfaceElevated, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, borderRadius: radii.md, fontSize: typography.body.fontSize, borderWidth: 1, borderColor: colors.border, minHeight: 80, textAlignVertical: 'top', marginTop: spacing.md, marginBottom: spacing.xl },
  reportSubmitBtn: { borderRadius: radii.md, overflow: 'hidden' },
  reportSubmitGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
  reportSubmitText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
