import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { formatTimeInNepal } from '../../utils/date';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../services/api';

export default function OverridePanelScreen({ navigation }) {
  const [ticketCode, setTicketCode] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [activeSection, setActiveSection] = useState('unlock');
  const [lockedSeats, setLockedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/locked-seats');
      setLockedSeats(data.seats || []);
    } catch (err) {
      console.log('Error fetching locked seats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleOverride = (seat, action) => {
    const actionNames = { unlock: 'Available', maintenance: 'Maintenance', vip: 'VIP' };
    Alert.alert(
      'Confirm Override',
      `Change seat ${seat.seatLabel} to ${actionNames[action]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              await api.post(`/api/admin/seats/${seat._id}/override`, { action });
              Alert.alert('Success', `Seat is now ${actionNames[action]}`);
              fetchSeats();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to override seat');
            }
          } 
        },
      ]
    );
  };

  const handleManualEntry = async () => {
    if (!ticketCode.trim()) {
      Alert.alert('Required', 'Enter a valid ticket code.');
      return;
    }
    try {
      await api.post('/api/admin/tickets/manual-entry', { ticketCode: ticketCode.trim(), notes: manualNote });
      Alert.alert('Approved', 'Manual entry successfully logged.');
      setTicketCode('');
      setManualNote('');
    } catch (err) {
      Alert.alert('Entry Failed', err.response?.data?.message || 'Invalid ticket code or already scanned.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <DashboardHeader
        topLabel="OVERRIDE PANEL"
        title="Manual Override"
        avatarLabel=""
      />

      {/* ═══ SECTION TOGGLE ═══ */}
      <View style={styles.toggleBar}>
        <TouchableOpacity style={styles.toggleItem} onPress={() => setActiveSection('unlock')} activeOpacity={0.7}>
          {activeSection === 'unlock' ? (
            <View style={styles.toggleGradient}>
              <Text style={styles.toggleTextActive}>🔓 Seat Overrides</Text>
            </View>
          ) : (
            <Text style={styles.toggleText}>🔓 Seat Overrides</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleItem} onPress={() => setActiveSection('manual')} activeOpacity={0.7}>
          {activeSection === 'manual' ? (
            <View style={styles.toggleGradient}>
              <Text style={styles.toggleTextActive}>📝 Manual Entry</Text>
            </View>
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
              
              <TextInput
                style={[styles.input, { marginTop: spacing.md, marginBottom: 0 }]}
                placeholder="Search by seat (A-14), user, or match..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : lockedSeats.filter(s => 
                (s.seatLabel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.lockedBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.match?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl }}>
                {searchQuery ? 'No seats match your search.' : 'No locked seats currently.'}
              </Text>
            ) : (
              lockedSeats.filter(s => 
                (s.seatLabel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.lockedBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.match?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).map((seat) => (
                <View key={seat._id} style={styles.seatCard}>
                  <View style={styles.seatInner}>
                    <View style={styles.seatInfo}>
                      <View style={styles.seatHeader}>
                        <Text style={styles.seatLabel}>{seat.seatLabel}</Text>
                        <View style={[styles.categoryPill, { backgroundColor: seat.category === 'vip' ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)' }]}>
                          <Text style={[styles.categoryText, { color: seat.category === 'vip' ? colors.accent : colors.textMuted }]}>{seat.category}</Text>
                        </View>
                      </View>
                      <Text style={styles.seatMatch}>{seat.match?.title || 'Unknown Match'}</Text>
                      <Text style={styles.seatMeta}>Locked by: {seat.lockedBy?.name || 'System'} · {seat.lockedUntil ? formatTimeInNepal(seat.lockedUntil, { hour: '2-digit', minute: '2-digit' }) : 'Indefinite'}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: colors.warningSurface }]}>
                        <Text style={[styles.statusText, { color: colors.warning }]}>LOCKED</Text>
                      </View>
                    </View>
                    <View style={styles.actionColumn}>
                      <TouchableOpacity style={[styles.unlockBtn, { backgroundColor: colors.successSurface, borderColor: colors.successSurface }]} onPress={() => handleOverride(seat, 'unlock')} activeOpacity={0.7}>
                        <Text style={[styles.unlockBtnText, { color: colors.success }]}>Unlock</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.unlockBtn, { backgroundColor: colors.warningSurface, borderColor: colors.warningSurface }]} onPress={() => handleOverride(seat, 'maintenance')} activeOpacity={0.7}>
                        <Text style={[styles.unlockBtnText, { color: colors.warning }]}>Maint</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.unlockBtn, { backgroundColor: colors.primarySurface, borderColor: colors.primarySurface }]} onPress={() => handleOverride(seat, 'vip')} activeOpacity={0.7}>
                        <Text style={[styles.unlockBtnText, { color: colors.primary }]}>VIP</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
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
              <View style={styles.cardInner}>
                <Text style={styles.cardHeader}>TICKET CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ticket code (e.g., TKT-95476f)"
                  placeholderTextColor={colors.textMuted}
                  value={ticketCode}
                  onChangeText={setTicketCode}
                  autoCapitalize="characters"
                />

                <Text style={styles.cardHeader}>NOTES (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Reason for manual entry..."
                  placeholderTextColor={colors.textMuted}
                  value={manualNote}
                  onChangeText={setManualNote}
                  multiline
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleManualEntry} activeOpacity={0.85}>
                  <View style={styles.submitBtnInner}>
                    <Text style={styles.submitBtnText}>✅ Approve Manual Entry</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardInner}>
                <Text style={styles.cardHeader}>SYSTEM HEALTH</Text>
                {[
                  { label: 'API Status', status: 'Online', color: colors.success },
                  { label: 'Database', status: 'Connected', color: colors.success },
                  { label: 'Socket.io', status: 'Active', color: colors.success },
                ].map((item, idx, arr) => (
                  <View key={item.label} style={[styles.healthRow, idx < arr.length - 1 && styles.healthRowBorder]}>
                    <Text style={styles.healthLabel}>{item.label}</Text>
                    <View style={styles.healthRight}>
                      <View style={[styles.healthDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.healthStatus, { color: item.color }]}>{item.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.huge + spacing.xxl },

  toggleBar: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  toggleItem: { flex: 1, borderRadius: radii.full, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  toggleGradient: { paddingVertical: spacing.sm + 2, borderRadius: radii.full, alignItems: 'center', backgroundColor: colors.primary },
  toggleText: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '600', paddingVertical: spacing.sm + 2, textAlign: 'center' },
  toggleTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  sectionSubtitle: { color: colors.textMuted, fontSize: typography.small.fontSize },

  seatCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border },
  seatInner: { flexDirection: 'row', padding: spacing.xl, gap: spacing.lg },
  seatInfo: { flex: 1 },
  seatHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  seatLabel: { color: colors.primary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  categoryPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  categoryText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  seatMatch: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600', marginBottom: 2 },
  seatMeta: { color: colors.textMuted, fontSize: 9, marginBottom: spacing.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },

  actionColumn: { justifyContent: 'center', gap: spacing.xs },
  unlockBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1, alignItems: 'center' },
  unlockBtnText: { fontSize: 10, fontWeight: '800' },

  card: { marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border },
  cardInner: { padding: spacing.xl },
  cardHeader: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: spacing.md },

  input: {
    backgroundColor: colors.surface, color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
    borderRadius: radii.md, fontSize: typography.body.fontSize,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  submitBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  submitBtnInner: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.primary },
  submitBtnText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  healthRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  healthLabel: { color: colors.textSecondary, fontSize: typography.captionMedium.fontSize },
  healthRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  healthStatus: { fontSize: typography.small.fontSize, fontWeight: '700' },
});
