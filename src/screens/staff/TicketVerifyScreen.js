import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { AlertTriangle, TriangleAlert, Wifi, MonitorOff, UserX } from 'lucide-react-native';

/* ─── Issue types for escalation ─── */
const ISSUE_TYPES = [
  { key: 'fraud_duplicate', label: 'Fraud — Duplicate Scan', severity: 'high', Icon: AlertTriangle },
  { key: 'fraud_fake', label: 'Fraud — Fake Ticket', severity: 'critical', Icon: TriangleAlert },
  { key: 'tech_api', label: 'Technical — API Timeout', severity: 'medium', Icon: Wifi },
  { key: 'tech_system', label: 'Technical — System Down', severity: 'critical', Icon: MonitorOff },
  { key: 'ops_complaint', label: 'Operational — Customer Complaint', severity: 'low', Icon: UserX },
];

export default function TicketVerifyScreen({ route, navigation }) {
  const { status, message, ticket, ticketCode } = route.params || {};
  const [showEscalate, setShowEscalate] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueNote, setIssueNote] = useState('');

  const isSuccess = status === 'success';
  const isDuplicate = status === 'duplicate';
  const isNetworkError = status === 'network_error';

  let alertColor = colors.success;
  let alertSurface = colors.successSurface;
  let statusText = 'TICKET APPROVED';
  let badgeEmoji = '\u2705';

  if (isDuplicate) {
    alertColor = glass.statusDangerText;
    alertSurface = glass.statusDangerFill;
    statusText = 'ALREADY USED';
    badgeEmoji = '\u26A0\uFE0F';
  } else if (isNetworkError) {
    alertColor = '#FF9500';
    alertSurface = 'rgba(255,149,0,0.12)';
    statusText = 'CONNECTION ERROR';
    badgeEmoji = '\uD83D\uDD0C';
  } else if (status === 'invalid') {
    alertColor = glass.statusDangerText;
    alertSurface = glass.statusDangerFill;
    statusText = 'INVALID TICKET';
    badgeEmoji = '\u26A0\uFE0F';
  }

  const handleNext = () => { navigation.goBack(); };

  /* ── Escalation submit (mock — would POST to /api/incidents) ── */
  const handleSubmitIssue = () => {
    if (!selectedIssue) {
      Alert.alert('Required', 'Select an issue type.');
      return;
    }
    const issue = ISSUE_TYPES.find(i => i.key === selectedIssue);
    Alert.alert(
      'Issue Reported',
      `"${issue.label}" has been reported to the supervisor on duty.\n\nThey will investigate and respond shortly.`,
      [{ text: 'OK', onPress: () => { setShowEscalate(false); setSelectedIssue(null); setIssueNote(''); } }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Scan Verification" onBack={handleNext} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Alert Banner */}
        <View style={[styles.alertBanner, { backgroundColor: alertSurface, borderColor: alertColor }]}>
          <Text style={styles.badgeText}>{badgeEmoji}</Text>
          <Text style={[styles.statusTitle, { color: alertColor }]}>{statusText}</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Ticket details (success only) */}
        {isSuccess && ticket ? (
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeader}>TICKET DETAILS</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{ticket.user?.name || ticket.userName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Seat</Text>
              <Text style={styles.value}>
                {ticket.seat?.seatLabel || ticket.seatLabel || 'N/A'} ({(ticket.seat?.category || ticket.category || 'general').toUpperCase()})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Match</Text>
              <Text style={styles.value}>{ticket.match?.title || ticket.matchTitle || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Ticket Code</Text>
              <Text style={styles.codeValue}>{ticket.ticketCode}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: glass.statusSuccessText, fontWeight: '800' }]}>VERIFIED</Text>
            </View>
          </View>
        ) : (
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeader}>SCAN LOG</Text>
            {ticketCode ? (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Scanned Code</Text>
                <Text style={styles.codeValue}>{ticketCode}</Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Result</Text>
              <Text style={[styles.value, { color: isNetworkError ? '#FF9500' : glass.statusDangerText, fontWeight: '800' }]}>
                {isNetworkError ? 'Server unreachable' : isDuplicate ? 'Ticket already used' : 'Invalid ticket code'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Action</Text>
              <Text style={styles.value}>
                {isNetworkError ? 'Check WiFi and try again' : isDuplicate ? 'Deny entry — duplicate scan' : 'Deny entry — ticket not found'}
              </Text>
            </View>
          </View>
        )}

        {/* ═══ ESCALATION BUTTONS (shown on failure states) ═══ */}
        {!isSuccess && (
          <View style={styles.escalationSection}>
            <Text style={styles.escalationTitle}>Need help? Report to supervisor</Text>
            <View style={styles.escalationRow}>
              <TouchableOpacity style={styles.escalationBtn} onPress={() => setShowEscalate(true)} activeOpacity={0.7}>
                <LinearGradient colors={[glass.statusDangerFill, 'rgba(255,23,68,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.escalationBtnInner}>
                  <Text style={styles.escalationIcon}>🚨</Text>
                  <Text style={[styles.escalationLabel, { color: glass.statusDangerText }]}>Report Issue</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.escalationBtn} onPress={() => Alert.alert('Supervisor Notified', 'The on-duty supervisor has been notified and will arrive shortly.')} activeOpacity={0.7}>
                <LinearGradient colors={[glass.statusWarningFill, 'rgba(255,179,0,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.escalationBtnInner}>
                  <Text style={styles.escalationIcon}>📞</Text>
                  <Text style={[styles.escalationLabel, { color: glass.statusWarningText }]}>Call Supervisor</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: alertColor }]}
          onPress={handleNext}
        >
          <Text style={styles.actionButtonText}>Scan Next Ticket</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ═══ ESCALATION MODAL ═══ */}
      <Modal visible={showEscalate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Issue</Text>
              <TouchableOpacity onPress={() => setShowEscalate(false)} activeOpacity={0.7}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>ISSUE TYPE</Text>
              {ISSUE_TYPES.map((issue) => (
                <TouchableOpacity
                  key={issue.key}
                  style={[styles.issueOption, selectedIssue === issue.key && styles.issueOptionActive]}
                  onPress={() => setSelectedIssue(issue.key)}
                  activeOpacity={0.7}
                >
                  <issue.Icon size={18} color={selectedIssue === issue.key ? glass.brandPurple : glass.textMuted} strokeWidth={2} />
                  <Text style={[styles.issueLabel, selectedIssue === issue.key && styles.issueLabelActive]}>{issue.label}</Text>
                  {selectedIssue === issue.key && <Text style={styles.issueCheck}>✓</Text>}
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalSectionTitle, { marginTop: spacing.xl }]}>ADDITIONAL NOTES</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Describe what happened..."
                placeholderTextColor={glass.textMuted}
                value={issueNote}
                onChangeText={setIssueNote}
                multiline
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmitIssue} activeOpacity={0.85}>
              <LinearGradient colors={[glass.neonMagenta, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalSubmitGradient}>
                <Text style={styles.modalSubmitText}>Submit Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.huge },

  alertBanner: { borderWidth: 2, borderRadius: radii.xxl, padding: spacing.xxl, alignItems: 'center' },
  badgeText: { fontSize: 48, marginBottom: spacing.md },
  statusTitle: { fontSize: typography.h2.fontSize, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.sm },
  messageText: { color: glass.textSecondary, fontSize: typography.body.fontSize, textAlign: 'center', lineHeight: 22 },

  detailsCard: { backgroundColor: glass.surface, borderColor: glass.border, borderWidth: 1, borderRadius: radii.xl, padding: spacing.xl },
  cardHeader: { color: glass.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: glass.border },
  label: { color: glass.textSecondary, fontSize: typography.caption.fontSize },
  value: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: spacing.md },
  codeValue: { color: glass.neonCyan, fontFamily: glass.monoFont, fontSize: typography.small.fontSize, fontWeight: '700' },

  /* Escalation section */
  escalationSection: { gap: spacing.md },
  escalationTitle: { color: glass.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', marginBottom: spacing.xs },
  escalationRow: { flexDirection: 'row', gap: spacing.md },
  escalationBtn: { flex: 1, borderRadius: radii.xl, overflow: 'hidden' },
  escalationBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm, borderRadius: radii.xl, borderWidth: 1, borderColor: glass.border },
  escalationIcon: { fontSize: 18 },
  escalationLabel: { fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  actionButton: { borderRadius: radii.lg, paddingVertical: spacing.lg, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: typography.body.fontSize, fontWeight: '800' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, maxHeight: '85%', borderWidth: 1, borderColor: glass.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  modalClose: { color: glass.textMuted, fontSize: 20, fontWeight: '600' },
  modalSectionTitle: { color: glass.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: spacing.md },

  issueOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, borderRadius: radii.lg, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: glass.border, marginBottom: spacing.sm, gap: spacing.md },
  issueOptionActive: { borderColor: glass.neonMagenta, backgroundColor: 'rgba(255,46,147,0.08)' },
  issueIcon: { fontSize: 18 },
  issueLabel: { flex: 1, color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  issueLabelActive: { color: glass.neonMagenta },
  issueCheck: { color: glass.neonMagenta, fontSize: 16, fontWeight: '800' },

  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.04)', color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
    borderRadius: radii.md, fontSize: typography.body.fontSize,
    borderWidth: 1, borderColor: glass.border, minHeight: 80, textAlignVertical: 'top',
  },

  modalSubmitBtn: { borderRadius: radii.lg, overflow: 'hidden', marginTop: spacing.xl },
  modalSubmitGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
  modalSubmitText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
