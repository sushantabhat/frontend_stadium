import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchShifts, createShift, deleteShift, fetchUsers } from '../../services/adminService';
import { fetchMatches } from '../../services/matchService';

export default function StaffShiftManagementScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [shifts, setShifts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [pickerGate, setPickerGate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState('');

  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const [shiftsRes, matchRes, userRes] = await Promise.allSettled([
        fetchShifts(),
        fetchMatches(),
        fetchUsers('staff'),
      ]);
      if (shiftsRes.status === 'fulfilled') setShifts(shiftsRes.value || []);
      if (matchRes.status === 'fulfilled') setMatches(matchRes.value || []);
      if (userRes.status === 'fulfilled') setStaff(userRes.value || []);
    } catch (e) {
      console.log('Shift load error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { refreshing, onRefresh } = useRefresh(() => loadData(true));

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kathmandu' });
  };

  const selectedMatch = matches.find(m => m._id === selectedMatchId);
  const matchShifts = shifts.filter(s => s.match?._id === selectedMatchId);
  const gates = selectedMatch?.venueGates?.length
    ? selectedMatch.venueGates
    : [...new Set((selectedMatch?.stadiumSections || []).map(s => s.gate).filter(Boolean))];

  const getShiftsForGate = (gateName) => matchShifts.filter(s => s.gate === gateName);
  const filteredStaff = staff.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const openStaffPicker = (gateName) => {
    setPickerGate(gateName);
    setSearch('');
    setShowStaffPicker(true);
  };

  const handleAssign = async (staffId) => {
    if (!selectedMatchId || !pickerGate) return;
    setAssigning(true);
    try {
      await createShift({
        staff: staffId,
        match: selectedMatchId,
        gate: pickerGate,
        date: selectedMatch?.matchDate,
      });
      setShowStaffPicker(false);
      setPickerGate('');
      setSearch('');
      await loadData(true);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = (shiftId, staffName) => {
    Alert.alert('Remove Staff', `Remove ${staffName} from this gate?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await deleteShift(shiftId); await loadData(true); } catch (e) { Alert.alert('Error', 'Failed'); }
      }},
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="STAFF SHIFTS"
          title="Shift Management"
          avatarColors={[colors.primary, glass.brandPurple]}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('AdminProfile')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.xxl }} />
          ) : (
            <>
              <Text style={styles.label}>SELECT MATCH</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchRow}>
                {matches.map(m => {
                  const active = m._id === selectedMatchId;
                  return (
                    <TouchableOpacity
                      key={m._id}
                      style={[styles.matchChip, active && styles.matchChipActive]}
                      onPress={() => setSelectedMatchId(m._id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.matchChipTitle, active && styles.matchChipTitleActive]} numberOfLines={1}>{m.title}</Text>
                      <Text style={[styles.matchChipSub, active && styles.matchChipSubActive]}>{formatDate(m.matchDate)}</Text>
                    </TouchableOpacity>
                  );
                })}
                {matches.length === 0 && <Text style={styles.emptyText}>No matches found</Text>}
              </ScrollView>

              {selectedMatch && (
                <>
                  <View style={styles.matchInfo}>
                    <View style={styles.matchInfoTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchInfoVenue}>{selectedMatch.venue || 'Unknown Venue'}</Text>
                        <Text style={styles.matchInfoDate}>{formatDate(selectedMatch.matchDate)}</Text>
                      </View>
                      <TouchableOpacity style={styles.doneBtn} onPress={() => setSelectedMatchId(null)} activeOpacity={0.7}>
                        <Text style={styles.doneBtnText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {gates.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <Text style={styles.emptyTitle}>No gates defined</Text>
                      <Text style={styles.emptyDesc}>Add gates to this venue in Venue Editor</Text>
                    </View>
                  ) : (
                    gates.map((gateName) => {
                      const gateShifts = getShiftsForGate(gateName);
                      return (
                        <View key={gateName} style={styles.gateCard}>
                          <View style={styles.gateCardHeader}>
                            <View style={styles.gateIcon}>
                              <Text style={styles.gateIconText}>🚪</Text>
                            </View>
                            <Text style={styles.gateName}>{gateName}</Text>
                            <Text style={styles.gateCount}>{gateShifts.length} assigned</Text>
                          </View>

                          {gateShifts.length > 0 && (
                            <View style={styles.gateStaffList}>
                              {gateShifts.map((shift) => (
                                <View key={shift._id} style={styles.gateStaffRow}>
                                  <View style={styles.staffAvatar}>
                                    <Text style={styles.staffAvatarText}>
                                      {(shift.staff?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </Text>
                                  </View>
                                  <View style={styles.staffInfo}>
                                    <Text style={styles.staffName}>{shift.staff?.name || 'Unknown'}</Text>
                                    <Text style={styles.staffEmail}>{shift.staff?.email || ''}</Text>
                                  </View>
                                  <TouchableOpacity
                                    style={styles.removeBtn}
                                    onPress={() => handleRemove(shift._id, shift.staff?.name || 'Staff')}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.removeBtnText}>✕</Text>
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          )}

                          {gateShifts.length === 0 && (
                            <Text style={styles.gateEmpty}>No staff assigned</Text>
                          )}

                          <TouchableOpacity
                            style={styles.addStaffBtn}
                            onPress={() => openStaffPicker(gateName)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.addStaffBtnText}>+ Add Staff</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </>
              )}

              {!selectedMatch && !isLoading && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyTitle}>Select a match</Text>
                  <Text style={styles.emptyDesc}>Pick a match above to manage gate assignments</Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: spacing.xxxl + 80 }} />
        </ScrollView>

        <Modal visible={showStaffPicker} transparent animationType="slide" onRequestClose={() => { setShowStaffPicker(false); setSearch(''); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { setShowStaffPicker(false); setSearch(''); }}>
                  <Text style={styles.backBtn}>← Close</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add to {pickerGate}</Text>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search staff..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              <ScrollView style={styles.optionList}>
                {filteredStaff.map(u => {
                  const alreadyAssigned = matchShifts.some(s => s.staff?._id === u._id);
                  return (
                    <TouchableOpacity
                      key={u._id}
                      style={[styles.optionItem, alreadyAssigned && styles.optionItemDisabled]}
                      onPress={() => !alreadyAssigned && handleAssign(u._id)}
                      disabled={alreadyAssigned || assigning}
                      activeOpacity={alreadyAssigned ? 1 : 0.7}
                    >
                      <View style={styles.staffAvatar}>
                        <Text style={styles.staffAvatarText}>
                          {(u.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionText, alreadyAssigned && styles.optionTextDisabled]}>{u.name}</Text>
                        <Text style={styles.optionSub}>{u.email}</Text>
                      </View>
                      {alreadyAssigned ? (
                        <Text style={styles.assignedLabel}>Assigned</Text>
                      ) : assigning ? (
                        <ActivityIndicator color={colors.primary} size="small" />
                      ) : (
                        <Text style={styles.addLabel}>Add</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
                {filteredStaff.length === 0 && <Text style={styles.emptyText}>No staff found</Text>}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.huge },

  label: { color: colors.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700', paddingHorizontal: spacing.xl, marginBottom: spacing.sm },

  matchRow: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.lg },
  matchChip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minWidth: 160 },
  matchChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  matchChipTitle: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', marginBottom: 2 },
  matchChipTitleActive: { color: '#FFF' },
  matchChipSub: { color: colors.textMuted, fontSize: typography.small.fontSize },
  matchChipSubActive: { color: 'rgba(255,255,255,0.7)' },

  matchInfo: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  matchInfoTop: { flexDirection: 'row', alignItems: 'center' },
  matchInfoVenue: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  matchInfoDate: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  doneBtnText: { color: '#FFF', fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  gateCard: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, marginHorizontal: spacing.xl, marginBottom: spacing.lg, overflow: 'hidden' },
  gateCardHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  gateIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  gateIconText: { fontSize: 18 },
  gateName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '800', flex: 1 },
  gateCount: { color: colors.textMuted, fontSize: typography.small.fontSize },

  gateStaffList: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  gateStaffRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  staffAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  staffAvatarText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  staffInfo: { flex: 1 },
  staffName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  staffEmail: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 1 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,71,87,0.15)', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FF4757', fontSize: 12, fontWeight: '800' },

  gateEmpty: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', paddingVertical: spacing.lg },

  addStaffBtn: { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingVertical: spacing.md, alignItems: 'center' },
  addStaffBtnText: { color: colors.primary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  emptyDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', paddingHorizontal: spacing.xxl },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xxl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  backBtn: { color: colors.primary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', flex: 1 },

  searchInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, color: colors.textPrimary, fontSize: 14, marginBottom: spacing.md },

  optionList: { maxHeight: 400 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  optionItemDisabled: { opacity: 0.5 },
  optionText: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  optionTextDisabled: { color: colors.textMuted },
  optionSub: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  assignedLabel: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  addLabel: { color: colors.primary, fontSize: typography.captionMedium.fontSize, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', paddingVertical: spacing.xl },
});
