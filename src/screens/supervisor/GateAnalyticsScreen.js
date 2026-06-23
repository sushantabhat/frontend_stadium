import React, { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchVenues } from '../../services/venueService';
import { fetchMatches } from '../../services/matchService';
import { fetchGateStats } from '../../services/adminService';

export default function GateAnalyticsScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);

  const [venues, setVenues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [gates, setGates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(null);
  const [search, setSearch] = useState('');

  const initials = (userInfo?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const [venueData, matchData] = await Promise.all([
        fetchVenues(),
        fetchMatches(),
      ]);
      setVenues(venueData || []);
      setMatches(matchData || []);
    } catch (e) {
      console.log('Gate analytics load error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { refreshing, onRefresh } = useRefresh(() => loadData(true));

  const venueMatches = selectedVenue
    ? matches.filter(m => m.venue === selectedVenue.name)
    : [];

  const filteredVenues = venues.filter(v => !search || v.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredMatches = venueMatches.filter(m => !search || m.title?.toLowerCase().includes(search.toLowerCase()));

  const handleSelectVenue = (v) => {
    setSelectedVenue(v);
    setSelectedMatch(null);
    setGates([]);
    setShowPicker(null);
    setSearch('');
  };

  const handleSelectMatch = async (m) => {
    setSelectedMatch(m);
    setShowPicker(null);
    setSearch('');
    setGates([]);
    setIsLoading(true);
    try {
      const stats = await fetchGateStats(m._id);
      setGates(stats || []);
    } catch (e) {
      console.log('Gate stats error:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      timeZone: 'Asia/Kathmandu',
    });
  };

  const totalScans = gates.reduce((sum, g) => sum + (g.scanned || 0), 0);
  const onlineGates = (gates || []).filter(g => g.online).length;

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="ANALYTICS"
          title="Gate Analytics"
          avatarColors={[colors.primary, glass.brandPurple]}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('SupervisorProfile')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
        >
          {/* SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selection</Text>

            <Text style={styles.inputLabel}>Venue</Text>
            <TouchableOpacity style={styles.pickerField} onPress={() => { setShowPicker('venue'); setSearch(''); }}>
              <Text style={[styles.pickerFieldText, !selectedVenue && styles.placeholder]}>
                {selectedVenue ? selectedVenue.name : 'Tap to select venue...'}
              </Text>
              <Text style={styles.arrow}>▸</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Match</Text>
            <TouchableOpacity
              style={[styles.pickerField, !selectedVenue && styles.pickerDisabled]}
              onPress={() => {
                if (!selectedVenue) return;
                setShowPicker('match');
                setSearch('');
              }}
            >
              <Text style={[styles.pickerFieldText, !selectedMatch && styles.placeholder]}>
                {selectedMatch
                  ? `${selectedMatch.title} (${formatDate(selectedMatch.matchDate)})`
                  : selectedVenue
                    ? 'Tap to select match...'
                    : 'Select a venue first'}
              </Text>
              <Text style={styles.arrow}>▸</Text>
            </TouchableOpacity>
          </View>

          {/* GATE STATS */}
          {selectedMatch && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Gate Status</Text>
                <Text style={styles.sectionSub}>{selectedMatch.title}</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{gates.length}</Text>
                  <Text style={styles.summaryLabel}>Gates</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{totalScans}</Text>
                  <Text style={styles.summaryLabel}>Entries</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>{onlineGates}</Text>
                  <Text style={styles.summaryLabel}>Online</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={[styles.summaryValue, { color: gates.length - onlineGates > 0 ? colors.warning : colors.textMuted }]}>
                    {gates.length - onlineGates}
                  </Text>
                  <Text style={styles.summaryLabel}>Offline</Text>
                </View>
              </View>

              {isLoading ? (
                <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.xxl }} />
              ) : gates.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>📡</Text>
                  <Text style={styles.emptyTitle}>No gate data</Text>
                  <Text style={styles.emptyDesc}>No scans recorded for this match yet</Text>
                </View>
              ) : (
                gates.map((gate) => (
                  <View key={gate.gate} style={styles.gateCard}>
                    <View style={styles.gateInner}>
                      <View style={styles.gateLeft}>
                        <View style={[styles.gateStatusDot, { backgroundColor: gate.online ? colors.success : colors.textMuted }]} />
                        <View style={styles.gateInfo}>
                          <Text style={styles.gateName}>{gate.gate}</Text>
                        </View>
                      </View>
                      <View style={styles.gateRight}>
                        <Text style={styles.gateScans}>{gate.scanned}</Text>
                        <Text style={styles.gateScansLabel}>entries</Text>
                      </View>
                    </View>

                    {gate.staff?.length > 0 ? (
                      <View style={styles.gateStaffList}>
                        {gate.staff.map((name, idx) => (
                          <View key={idx} style={styles.gateStaffRow}>
                            <View style={styles.staffAvatar}>
                              <Text style={styles.staffAvatarText}>
                                {(name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </Text>
                            </View>
                            <Text style={styles.staffName}>{name}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.gateStaffEmpty}>No staff assigned</Text>
                    )}

                    <View style={styles.gateFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: gate.online ? 'rgba(46,213,115,0.12)' : 'rgba(255,255,255,0.05)' }]}>
                        <View style={[styles.statusDot, { backgroundColor: gate.online ? colors.success : colors.textMuted }]} />
                        <Text style={[styles.statusText, { color: gate.online ? colors.success : colors.textMuted }]}>
                          {gate.online ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                      {gate.lastScan && (
                        <Text style={styles.lastScan}>Last scan: {timeAgo(gate.lastScan)}</Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          <View style={{ height: spacing.xxxl + 80 }} />
        </ScrollView>
      </SafeAreaView>

      {/* PICKER MODAL */}
      <Modal visible={showPicker !== null} transparent animationType="slide" onRequestClose={() => setShowPicker(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowPicker(null); setSearch(''); }}>
                <Text style={styles.backBtn}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{showPicker === 'venue' ? 'Select Venue' : 'Select Match'}</Text>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder={showPicker === 'venue' ? 'Search venues...' : 'Search matches...'}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />

            <ScrollView style={styles.optionList}>
              {showPicker === 'venue' ? (
                filteredVenues.length === 0 ? (
                  <Text style={styles.emptyText}>No venues found</Text>
                ) : (
                  filteredVenues.map((v) => (
                    <TouchableOpacity
                      key={v._id}
                      style={[styles.optionItem, selectedVenue?._id === v._id && styles.optionItemActive]}
                      onPress={() => handleSelectVenue(v)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionText, selectedVenue?._id === v._id && styles.optionTextActive]}>
                          {v.name}
                        </Text>
                        <Text style={styles.optionSub}>{v.location || '—'} · {v.stadiumSections?.length || 0} sections</Text>
                      </View>
                      {selectedVenue?._id === v._id && <Text style={styles.check}>✓</Text>}
                    </TouchableOpacity>
                  ))
                )
              ) : (
                filteredMatches.length === 0 ? (
                  <Text style={styles.emptyText}>No matches for this venue</Text>
                ) : (
                  filteredMatches.map((m) => (
                    <TouchableOpacity
                      key={m._id}
                      style={[styles.optionItem, selectedMatch?._id === m._id && styles.optionItemActive]}
                      onPress={() => handleSelectMatch(m)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionText, selectedMatch?._id === m._id && styles.optionTextActive]}>
                          {m.title}
                        </Text>
                        <Text style={styles.optionSub}>{formatDate(m.matchDate)} · {m.venue}</Text>
                      </View>
                      {selectedMatch?._id === m._id && <Text style={styles.check}>✓</Text>}
                    </TouchableOpacity>
                  ))
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.huge },

  section: { marginBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },
  sectionSub: { color: colors.textMuted, fontSize: typography.small.fontSize },

  inputLabel: { color: colors.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.lg },
  pickerField: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md },
  pickerDisabled: { opacity: 0.4 },
  pickerFieldText: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  placeholder: { color: colors.textMuted },
  arrow: { color: colors.primary, fontSize: 16, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center',
  },
  summaryValue: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900' },
  summaryLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 2 },

  gateCard: {
    marginBottom: spacing.sm, backgroundColor: colors.surface,
    borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  gateInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl },
  gateLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  gateStatusDot: { width: 10, height: 10, borderRadius: 5 },
  gateInfo: { flex: 1 },
  gateName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  gateStaffList: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  gateStaffRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, gap: spacing.md },
  staffAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  staffAvatarText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  staffName: { color: colors.textSecondary, fontSize: typography.small.fontSize, fontWeight: '600' },
  gateStaffEmpty: { color: colors.textMuted, fontSize: 9, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm },
  gateRight: { alignItems: 'flex-end' },
  gateScans: { color: colors.primary, fontSize: typography.h3.fontSize, fontWeight: '900' },
  gateScansLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginTop: 1 },
  gateFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.borderSubtle,
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },
  lastScan: { color: colors.textMuted, fontSize: 9 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xxl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  backBtn: { color: colors.primary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  modalTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', flex: 1 },

  searchInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, color: colors.textPrimary, fontSize: 14, marginBottom: spacing.md },

  optionList: { maxHeight: 350 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  optionItemActive: { backgroundColor: colors.surfaceElevated, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.md },
  optionText: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  optionTextActive: { color: colors.primary, fontWeight: '800' },
  optionSub: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  check: { color: colors.primary, fontSize: 16, fontWeight: '800', marginLeft: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', paddingVertical: spacing.xl },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  emptyDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center' },
});
