import React, { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import ImagePickerField from '../../components/ImagePickerField';
import { createMatch } from '../../services/matchService';
import { fetchVenues } from '../../services/venueService';
import api from '../../services/api';
import { colors, spacing, radii, typography, glass, CATEGORY_COLORS } from '../../constants/theme';

const CATEGORY_OPTIONS = ['platinum', 'gold', 'silver', 'bronze', 'general', 'supporters'];
const MATCH_STAGES = ['League Stage', 'Qualifier / Decider', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
const CRICKET_FORMATS = ['T20', 'ODI', 'T10'];

const DEFAULT_FORM = {
  title: '',
  teamA: '',
  teamB: '',
  venue: '',
  matchDate: '',
  description: '',
  imageUrl: '',
  teamALogo: '',
  teamBLogo: '',
  match_stage: 'League Stage',
  cricket_format: 'T20',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateISO(year, month, day, hour, minute) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const totalMinutes = hour * 60 + minute - (5 * 60 + 45);
  const adjHour = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
  const adjMinute = ((totalMinutes % 60) + 60) % 60;
  const h = String(adjHour).padStart(2, '0');
  const min = String(adjMinute).padStart(2, '0');
  return `${year}-${m}-${d}T${h}:${min}:00.000Z`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu',
    });
  } catch { return dateStr; }
}

export default function CreateMatchScreen({ navigation }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(CURRENT_YEAR);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [errors, setErrors] = useState({});

  const [venues, setVenues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [matchPricing, setMatchPricing] = useState({});
  const [teamPickerVisible, setTeamPickerVisible] = useState(false);
  const [teamPickerTarget, setTeamPickerTarget] = useState('A');

  const maxDays = getDaysInMonth(pickerYear, pickerMonth);
  const clampedDay = Math.min(pickerDay, maxDays);

  useFocusEffect(useCallback(() => {
    fetchVenues().then(setVenues).catch(() => {});
    fetchTeams();
  }, []));

  const fetchTeams = async () => {
    try {
      const res = await api.get('/api/teams');
      setTeams(res.data || []);
    } catch (err) {
      console.log('Fetch teams error', err);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const selectVenue = (venue) => {
    setSelectedVenue(venue);
    updateField('venue', venue.name);
    const vp = {};
    for (const cat of CATEGORY_OPTIONS) {
      vp[cat] = venue.pricing?.[cat] != null ? String(venue.pricing[cat]) : '0';
    }
    setMatchPricing(vp);
    setShowVenuePicker(false);
  };

  const handleDateConfirm = () => {
    const iso = formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute);
    if (new Date(iso) <= new Date()) {
      setErrors((prev) => ({ ...prev, matchDate: 'Date & time must be in the future' }));
      return;
    }
    updateField('matchDate', iso);
    setShowDatePicker(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.teamA.trim()) newErrors.teamA = 'Team A is required';
    if (!form.teamB.trim()) newErrors.teamB = 'Team B is required';
    if (!form.venue.trim()) newErrors.venue = 'Venue is required';
    if (!form.matchDate) newErrors.matchDate = 'Date & time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (selectedVenue) {
        const pricingObj = {};
        for (const [key, val] of Object.entries(matchPricing)) {
          pricingObj[key] = Number(val) || 0;
        }
        payload.pricing = pricingObj;
        payload.venueGates = selectedVenue.gates || [];
        const stadiumSections = (selectedVenue.stadiumSections || []).map((s) => ({
          sectionId: s.sectionId,
          category: s.category,
          label: s.label || s.sectionId,
          color: s.color,
          polygon: s.polygon || '',
          pricePerTicket: Number(s.pricePerTicket) || 0,
          totalSeats: Number(s.totalSeats) || 0,
          availableSeats: Number(s.totalSeats) || 0,
          rows: Array.isArray(s.rows) ? s.rows : [],
          gate: s.gate || '',
        }));
        if (stadiumSections.length > 0) {
          payload.stadiumSections = stadiumSections;
        } else {
          payload.seatLayout = selectedVenue.seatLayout || { rows: 10, seatsPerRow: 20, vipRows: 2, premiumRows: 3 };
        }
      }
      const match = await createMatch(payload);
      Alert.alert('Success', 'Match created.', [
        { text: 'View Match', onPress: () => navigation.replace('AdminMatchDetail', { matchId: match._id }) },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create match');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Create Match"
        subtitle="Define event details and select a venue"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.brandPurple }]} />
              <Text style={styles.sectionTitle}>Event Info</Text>
            </View>

            <Text style={styles.inputLabel}>Match Title</Text>
            <TextInput
              style={[styles.inputField, errors.title && styles.inputError]}
              placeholder="T20 Final - Season Opener"
              placeholderTextColor={glass.textMuted}
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team A</Text>
                <TouchableOpacity
                  style={[styles.inputField, errors.teamA && styles.inputError, { justifyContent: 'center' }]}
                  onPress={() => { setTeamPickerTarget('A'); setTeamPickerVisible(true); }}
                >
                  <Text style={{ color: form.teamA ? colors.textPrimary : glass.textMuted }}>
                    {form.teamA || 'Select Team A'}
                  </Text>
                </TouchableOpacity>
                {errors.teamA && <Text style={styles.errorText}>{errors.teamA}</Text>}
              </View>

              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team B</Text>
                <TouchableOpacity
                  style={[styles.inputField, errors.teamB && styles.inputError, { justifyContent: 'center' }]}
                  onPress={() => { setTeamPickerTarget('B'); setTeamPickerVisible(true); }}
                >
                  <Text style={{ color: form.teamB ? colors.textPrimary : glass.textMuted }}>
                    {form.teamB || 'Select Team B'}
                  </Text>
                </TouchableOpacity>
                {errors.teamB && <Text style={styles.errorText}>{errors.teamB}</Text>}
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.halfField}>
                <ImagePickerField
                  label="Team A Logo"
                  value={form.teamALogo}
                  onUpload={(url) => updateField('teamALogo', url)}
                />
              </View>
              <View style={styles.halfField}>
                <ImagePickerField
                  label="Team B Logo"
                  value={form.teamBLogo}
                  onUpload={(url) => updateField('teamBLogo', url)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Match Stage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg, paddingBottom: 4 }}>
              {MATCH_STAGES.map(stage => (
                <TouchableOpacity
                  key={stage}
                  style={[styles.pill, form.match_stage === stage && styles.pillActive]}
                  onPress={() => updateField('match_stage', stage)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, form.match_stage === stage && styles.pillTextActive]}>{stage}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Venue</Text>
            <TouchableOpacity
              style={[styles.datePickerTrigger, errors.venue && styles.inputError]}
              onPress={() => setShowVenuePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerIcon}>🏟️</Text>
              <View style={styles.datePickerTextWrap}>
                {selectedVenue ? (
                  <>
                    <Text style={styles.datePickerValue}>{selectedVenue.name}</Text>
                    <Text style={styles.datePickerHint}>{selectedVenue.location || 'Tap to change'}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.datePickerPlaceholder}>Select venue</Text>
                    <Text style={styles.datePickerHint}>{venues.length} venues available</Text>
                  </>
                )}
              </View>
              <Text style={styles.datePickerChevron}>›</Text>
            </TouchableOpacity>
            {errors.venue && <Text style={styles.errorText}>{errors.venue}</Text>}

            <Text style={styles.inputLabel}>Match Date & Time</Text>
            <TouchableOpacity
              style={[styles.datePickerTrigger, errors.matchDate && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerIcon}>📅</Text>
              <View style={styles.datePickerTextWrap}>
                {form.matchDate ? (
                  <>
                    <Text style={styles.datePickerValue}>{formatDisplayDate(form.matchDate)}</Text>
                    <Text style={styles.datePickerHint}>Tap to change</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.datePickerPlaceholder}>Select date & time</Text>
                    <Text style={styles.datePickerHint}>Tap to open picker</Text>
                  </>
                )}
              </View>
              <Text style={styles.datePickerChevron}>›</Text>
            </TouchableOpacity>
            {errors.matchDate && <Text style={styles.errorText}>{errors.matchDate}</Text>}

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              placeholder="Optional match description"
              placeholderTextColor={glass.textMuted}
              multiline
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
            />
          </View>

          {/* MATCH IMAGES */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#00E5FF' }]} />
              <Text style={styles.sectionTitle}>Match Images</Text>
            </View>

            <ImagePickerField
              label="Match Banner"
              value={form.imageUrl}
              onUpload={(url) => updateField('imageUrl', url)}
            />
          </View>

          {/* PRICING OVERRIDE */}
          {selectedVenue && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: glass.statusSuccessText }]} />
                <Text style={styles.sectionTitle}>Ticket Pricing</Text>
              </View>
              <Text style={styles.hint}>Override prices from venue defaults for this match.</Text>

              {CATEGORY_OPTIONS.map((cat) => {
                const catData = CATEGORY_COLORS[cat];
                return (
                  <View key={cat} style={styles.priceRow}>
                    <View style={[styles.priceDot, { backgroundColor: catData?.accent }]} />
                    <Text style={styles.priceLabel}>{catData?.label}</Text>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="numeric"
                      value={matchPricing[cat] || '0'}
                      onChangeText={(v) => setMatchPricing((prev) => ({ ...prev, [cat]: v }))}
                    />
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[glass.brandPurple, glass.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Match</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* VENUE PICKER MODAL */}
      <Modal visible={showVenuePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowVenuePicker(false)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Venue</Text>
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {venues.length === 0 ? (
                <Text style={styles.hint}>No venues found. Create one in Venues tab first.</Text>
              ) : (
                venues.map((v) => (
                  <TouchableOpacity
                    key={v._id}
                    style={[styles.venueOption, selectedVenue?._id === v._id && styles.venueOptionActive]}
                    onPress={() => selectVenue(v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.venueOptionName}>{v.name}</Text>
                    <Text style={styles.venueOptionMeta}>
                      {v.location || 'No location'} · {v.stadiumSections?.length || 0} sections
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={[styles.sheetActions, { marginTop: spacing.lg }]}>
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowVenuePicker(false)} activeOpacity={0.7}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER MODAL */}
      <Modal visible={showDatePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Date & Time</Text>

            <View style={styles.datePreview}>
              <Text style={styles.datePreviewIcon}>📅</Text>
              <Text style={styles.datePreviewText}>
                {formatDisplayDate(formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute))}
              </Text>
            </View>

            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>YEAR</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.pickerItem, pickerYear === y && styles.pickerItemActive]}
                      onPress={() => setPickerYear(y)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, pickerYear === y && styles.pickerItemTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>MONTH</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerItem, pickerMonth === i && styles.pickerItemActive]}
                      onPress={() => setPickerMonth(i)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, pickerMonth === i && styles.pickerItemTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>DAY</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {DAYS.filter((d) => d <= maxDays).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.pickerItem, clampedDay === d && styles.pickerItemActive]}
                      onPress={() => setPickerDay(d)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, clampedDay === d && styles.pickerItemTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={[styles.pickerRow, { marginTop: spacing.md }]}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>HOUR (NPT)</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.pickerItem, pickerHour === h && styles.pickerItemActive]}
                      onPress={() => setPickerHour(h)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, pickerHour === h && styles.pickerItemTextActive]}>
                        {String(h).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>MINUTE (NPT)</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerItem, pickerMinute === m && styles.pickerItemActive]}
                      onPress={() => setPickerMinute(m)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, pickerMinute === m && styles.pickerItemTextActive]}>
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.sheetActions}>
              {(() => {
                const previewIso = formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute);
                const isPast = new Date(previewIso) <= new Date();
                return isPast ? <Text style={styles.pastDateWarning}>Cannot select a past date</Text> : null;
              })()}
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetConfirmBtn, new Date(formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute)) <= new Date() && styles.sheetConfirmBtnDisabled]}
                onPress={handleDateConfirm}
                activeOpacity={0.85}
                disabled={new Date(formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute)) <= new Date()}
              >
                <LinearGradient
                  colors={new Date(formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute)) <= new Date() ? ['#555', '#444'] : [glass.brandPurple, glass.neonPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sheetConfirmGradient}
                >
                  <Text style={styles.sheetConfirmText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TEAM PICKER MODAL */}
      <Modal visible={teamPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setTeamPickerVisible(false)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Team {teamPickerTarget}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {teams
                .map(t => (
                <TouchableOpacity
                  key={t._id}
                  style={styles.teamOption}
                  onPress={() => {
                    if (teamPickerTarget === 'A') {
                      updateField('teamA', t.name);
                      updateField('teamALogo', t.logoUrl);
                    } else {
                      updateField('teamB', t.name);
                      updateField('teamBLogo', t.logoUrl);
                    }
                    setTeamPickerVisible(false);
                  }}
                >
                  {t.logoUrl && !t.logoUrl.includes('wikipedia') ? (
                    <Image source={{ uri: t.logoUrl }} style={styles.teamOptionLogo} />
                  ) : (
                    <View style={[styles.teamOptionLogo, { backgroundColor: 'rgba(123,97,255,0.15)', borderWidth: 1, borderColor: glass.brandPurple, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: glass.brandPurple, fontSize: 12, fontWeight: '800' }}>{t.shortName || t.name.substring(0, 3).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={styles.teamOptionText}>{t.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.teamOption} 
                onPress={() => {
                  Alert.alert("Manage Teams", "To add a new team, go to the Teams Database in your dashboard.");
                }}
              >
                <View style={[styles.teamOptionLogo, { backgroundColor: 'transparent', borderWidth: 1, borderColor: glass.brandPurple, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{color: glass.brandPurple}}>+</Text>
                </View>
                <Text style={[styles.teamOptionText, { color: glass.brandPurple }]}>Add New Team</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },

  sectionCard: {
    backgroundColor: glass.card, borderRadius: radii.xl,
    borderWidth: 1, borderColor: glass.border,
    padding: spacing.xl, marginBottom: spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },

  hint: { color: glass.textSecondary, fontSize: typography.small.fontSize, lineHeight: 18, marginBottom: spacing.lg },

  priceRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  priceDot: { width: 12, height: 12, borderRadius: 6 },
  priceLabel: { color: colors.textSecondary, fontSize: typography.body.fontSize, fontWeight: '600', flex: 1 },
  priceInput: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md,
    borderWidth: 1, borderColor: glass.border, padding: spacing.sm,
    color: colors.textPrimary, fontSize: typography.body.fontSize,
    width: 80, textAlign: 'right', fontFamily: glass.monoFont,
  },

  inputLabel: {
    color: glass.textMuted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1, marginBottom: spacing.sm, textTransform: 'uppercase',
  },
  inputField: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md,
    borderWidth: 1, borderColor: glass.border, padding: spacing.md,
    color: colors.textPrimary, fontSize: typography.body.fontSize,
    marginBottom: spacing.md, minHeight: 48,
  },
  inputError: { borderColor: '#FF4757' },
  errorText: { color: '#FF4757', fontSize: 11, fontWeight: '600', marginBottom: spacing.md, marginTop: -spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  pill: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2,
    borderRadius: radii.full, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: glass.border, marginRight: spacing.sm,
  },
  pillActive: { backgroundColor: glass.brandPurpleSurface, borderColor: glass.brandPurple },
  pillText: { color: glass.textSecondary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  pillTextActive: { color: glass.brandPurple, fontWeight: '800' },

  datePickerTrigger: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md,
    borderWidth: 1, borderColor: glass.border, padding: spacing.md,
    marginBottom: spacing.md, gap: spacing.md,
  },
  datePickerIcon: { fontSize: 20 },
  datePickerTextWrap: { flex: 1 },
  datePickerValue: { color: colors.textPrimary, fontSize: typography.body.fontSize, fontWeight: '600', fontFamily: glass.monoFont },
  datePickerPlaceholder: { color: glass.textMuted, fontSize: typography.body.fontSize },
  datePickerHint: { color: glass.textMuted, fontSize: 9, marginTop: 2 },
  datePickerChevron: { color: glass.textMuted, fontSize: 20, fontWeight: '600' },

  submitButton: { borderRadius: radii.lg, overflow: 'hidden' },
  submitGradient: { paddingVertical: spacing.lg, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: typography.body.fontSize },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    padding: spacing.xxl, paddingBottom: spacing.huge,
    borderWidth: 1, borderColor: glass.border, borderBottomWidth: 0,
    maxHeight: '85%', marginTop: 'auto'
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: glass.textMuted, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.lg },

  venueOption: {
    backgroundColor: glass.card, borderRadius: radii.lg,
    borderWidth: 1, borderColor: glass.border,
    padding: spacing.lg, marginBottom: spacing.sm,
  },
  venueOptionActive: { borderColor: glass.brandPurple, backgroundColor: 'rgba(123,97,255,0.08)' },
  venueOptionName: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: 4 },
  venueOptionMeta: { color: glass.textSecondary, fontSize: typography.small.fontSize },

  datePreview: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md,
    borderWidth: 1, borderColor: glass.border, padding: spacing.md, marginBottom: spacing.xl,
  },
  datePreviewIcon: { fontSize: 18 },
  datePreviewText: { color: glass.brandPurple, fontSize: typography.captionMedium.fontSize, fontWeight: '700', fontFamily: glass.monoFont, flex: 1 },

  pickerRow: { flexDirection: 'row', gap: spacing.sm },
  pickerCol: { flex: 1 },
  pickerLabel: { color: glass.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm, textAlign: 'center' },
  pickerScroll: { maxHeight: 150 },
  pickerItem: { paddingVertical: spacing.sm + 2, borderRadius: radii.md, alignItems: 'center', marginBottom: 2 },
  pickerItemActive: { backgroundColor: glass.brandPurpleSurface, borderWidth: 1, borderColor: glass.brandPurple },
  pickerItemText: { color: glass.textMuted, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  pickerItemTextActive: { color: glass.brandPurple, fontWeight: '800' },

  sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  sheetCancelBtn: {
    flex: 1, paddingVertical: spacing.lg, borderRadius: radii.md,
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: glass.border,
  },
  sheetCancelText: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  sheetConfirmBtn: { flex: 1, borderRadius: radii.md, overflow: 'hidden' },
  sheetConfirmBtnDisabled: { opacity: 0.5 },
  sheetConfirmGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
  sheetConfirmText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  pastDateWarning: { color: '#FF4757', fontSize: typography.small.fontSize, fontWeight: '600', textAlign: 'center', flex: 1, marginTop: spacing.md },
  teamOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  teamOptionLogo: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.md },
  teamOptionText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },

  filterTabs: { flexDirection: 'row', marginBottom: spacing.lg, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.md, padding: 4 },
  filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.sm },
  filterTabActive: { backgroundColor: glass.brandPurple },
  filterTabText: { color: glass.textMuted, fontSize: 14, fontWeight: '600' },
  filterTabTextActive: { color: colors.textPrimary, fontWeight: '700' },

  sectionCardInner: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radii.md,
    borderWidth: 1, borderColor: glass.border, paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  stepperRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  stepperLabelWrap: { flex: 1 },
  stepperLabelTitle: { color: colors.textPrimary, fontSize: typography.body.fontSize, fontWeight: '700' },
  stepperLabelHint: { color: glass.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperBtn: { 
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  stepperBtnText: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', lineHeight: 20 },
  stepperValue: { color: glass.brandPurple, fontSize: 18, fontWeight: '800', width: 24, textAlign: 'center' },
});
