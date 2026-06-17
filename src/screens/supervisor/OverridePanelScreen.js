import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

/* ─── Mock locked seats data ───
 * In production: GET /api/admin/locked-seats */
const MOCK_LOCKED_SEATS = [
  { id: 's1', match: 'ICC T20 Finals', seat: 'A-14', category: 'VIP', lockedBy: 'Rahul S.', lockedAt: '2026-06-18T18:30:00Z', status: 'orphaned' },
  { id: 's2', match: 'ICC T20 Finals', seat: 'B-07', category: 'Premium', lockedBy: 'System', lockedAt: '2026-06-18T17:45:00Z', status: 'active' },
  { id: 's3', match: 'IPL Match 1', seat: 'C-22', category: 'General', lockedBy: 'Amit K.', lockedAt: '2026-06-17T14:00:00Z', status: 'orphaned' },
];

export default function OverridePanelScreen({ navigation }) {
  const [ticketCode, setTicketCode] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [activeSection, setActiveSection] = useState('unlock');

  /* ── Force unlock handler (mock) ── */
  const handleForceUnlock = (seat) => {
    Alert.alert(
      'Force Unlock',
      `Release lock on ${seat.seat} (${seat.category})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlock', onPress: () => Alert.alert('Unlocked', `${seat.seat} has been released.`) },
      ]
    );
  };

  /* ── Manual entry approval (mock) ── */
  const handleManualEntry = () => {
    if (!ticketCode.trim()) {
      Alert.alert('Required', 'Enter a valid ticket code.');
      return;
    }
    Alert.alert(
      'Approve Manual Entry',
      `Allow entry for ticket ${ticketCode.trim()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => { setTicketCode(''); setManualNote(''); Alert.alert('Approved', 'Manual entry logged.'); } },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ═══ SECTION TOGGLE ═══ */}
      <View style={styles.toggleBar}>
        <TouchableOpacity style={styles.toggleItem} onPress={() => setActiveSection('unlock')} activeOpacity={0.7}>
          {activeSection === 'unlock' ? (
            <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.toggleGradient}>
              <Text style={styles.toggleTextActive}>🔓 Seat Overrides</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.toggleText}>🔓 Seat Overrides</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleItem} onPress={() => setActiveSection('manual')} activeOpacity={0.7}>
          {activeSection === 'manual' ? (
            <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.toggleGradient}>
              <Text style={styles.toggleTextActive}>📝 Manual Entry</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.toggleText}>📝 Manual Entry</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ═══ SEAT OVERRIDE SECTION ═══ */}
        {activeSection === 'unlock' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Locked Seats</Text>
              <Text style={styles.sectionSubtitle}>Force unlock orphaned or stuck seat locks</Text>
            </View>

            {MOCK_LOCKED_SEATS.map((seat) => (
              <View key={seat.id} style={styles.seatCard}>
                <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.seatInner}>
                  <View style={styles.seatInfo}>
                    <View style={styles.seatHeader}>
                      <Text style={styles.seatLabel}>{seat.seat}</Text>
                      <View style={[styles.categoryPill, { backgroundColor: seat.category === 'VIP' ? 'rgba(255,215,0,0.15)' : seat.category === 'Premium' ? 'rgba(138,43,226,0.15)' : 'rgba(255,255,255,0.06)' }]}>
                        <Text style={[styles.categoryText, { color: seat.category === 'VIP' ? glass.neonAmber : seat.category === 'Premium' ? glass.neonPurple : glass.textMuted }]}>{seat.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.seatMatch}>{seat.match}</Text>
                    <Text style={styles.seatMeta}>Locked by: {seat.lockedBy} · {new Date(seat.lockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: seat.status === 'orphaned' ? glass.statusDangerFill : glass.statusWarningFill }]}>
                      <Text style={[styles.statusText, { color: seat.status === 'orphaned' ? glass.statusDangerText : glass.statusWarningText }]}>
                        {seat.status === 'orphaned' ? 'ORPHANED' : 'ACTIVE LOCK'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.unlockBtn} onPress={() => handleForceUnlock(seat)} activeOpacity={0.7}>
                    <LinearGradient colors={[glass.statusDangerFill, 'rgba(255,23,68,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.unlockBtnInner}>
                      <Text style={styles.unlockBtnText}>Force{'\n'}Unlock</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}
          </>
        )}

        {/* ═══ MANUAL ENTRY SECTION ═══ */}
        {activeSection === 'manual' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manual Entry Approval</Text>
              <Text style={styles.sectionSubtitle}>Approve entry when API is unreachable</Text>
            </View>

            <View style={styles.card}>
              <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
                <Text style={styles.cardHeader}>TICKET CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ticket code (e.g., TKT-95476f)"
                  placeholderTextColor={glass.textMuted}
                  value={ticketCode}
                  onChangeText={setTicketCode}
                  autoCapitalize="characters"
                />

                <Text style={styles.cardHeader}>NOTES (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Reason for manual entry..."
                  placeholderTextColor={glass.textMuted}
                  value={manualNote}
                  onChangeText={setManualNote}
                  multiline
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleManualEntry} activeOpacity={0.85}>
                  <LinearGradient colors={[glass.neonCyan, glass.neonPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGradient}>
                    <Text style={styles.submitBtnText}>✅ Approve Manual Entry</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View style={styles.card}>
              <LinearGradient colors={[glass.surface, 'rgba(18,21,34,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
                <Text style={styles.cardHeader}>SYSTEM HEALTH</Text>
                {[
                  { label: 'API Status', status: 'Online', color: glass.statusSuccessText },
                  { label: 'Database', status: 'Connected', color: glass.statusSuccessText },
                  { label: 'Socket.io', status: 'Active', color: glass.statusSuccessText },
                ].map((item, idx, arr) => (
                  <View key={item.label} style={[styles.healthRow, idx < arr.length - 1 && styles.healthRowBorder]}>
                    <Text style={styles.healthLabel}>{item.label}</Text>
                    <View style={styles.healthRight}>
                      <View style={[styles.healthDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.healthStatus, { color: item.color }]}>{item.status}</Text>
                    </View>
                  </View>
                ))}
              </LinearGradient>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.huge + spacing.xxl },

  toggleBar: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  toggleItem: { flex: 1, borderRadius: radii.full, overflow: 'hidden', backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border },
  toggleGradient: { paddingVertical: spacing.sm + 2, borderRadius: radii.full, alignItems: 'center' },
  toggleText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600', paddingVertical: spacing.sm + 2, textAlign: 'center' },
  toggleTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  sectionSubtitle: { color: glass.textMuted, fontSize: typography.small.fontSize },

  seatCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  seatInner: { flexDirection: 'row', padding: spacing.xl, gap: spacing.lg },
  seatInfo: { flex: 1 },
  seatHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  seatLabel: { color: glass.neonCyan, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', fontFamily: glass.monoFont },
  categoryPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  categoryText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  seatMatch: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600', marginBottom: 2 },
  seatMeta: { color: glass.textMuted, fontSize: 9, fontFamily: glass.monoFont, marginBottom: spacing.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },

  unlockBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  unlockBtnInner: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, alignItems: 'center', justifyContent: 'center', borderRadius: radii.lg, borderWidth: 1, borderColor: glass.statusDangerFill },
  unlockBtnText: { color: glass.statusDangerText, fontSize: typography.captionMedium.fontSize, fontWeight: '700', textAlign: 'center', lineHeight: 18 },

  card: { marginHorizontal: spacing.xl, marginBottom: spacing.md, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  cardInner: { padding: spacing.xl },
  cardHeader: { color: glass.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: spacing.md },

  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
    borderRadius: radii.md, fontSize: typography.body.fontSize,
    borderWidth: 1, borderColor: glass.border, marginBottom: spacing.xl,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  submitBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  submitBtnGradient: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg },
  submitBtnText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  healthRowBorder: { borderBottomWidth: 1, borderBottomColor: glass.border },
  healthLabel: { color: glass.textSecondary, fontSize: typography.captionMedium.fontSize },
  healthRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  healthStatus: { fontSize: typography.small.fontSize, fontWeight: '700' },
});
