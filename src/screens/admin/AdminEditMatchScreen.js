import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { fetchMatchById, updateMatch } from '../../services/matchService';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

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
  const h = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
  return `${year}-${m}-${d}T${h}:${min}:00.000Z`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function parseDateToComponents(dateStr) {
  if (!dateStr) return { year: CURRENT_YEAR, month: new Date().getMonth(), day: new Date().getDate(), hour: 18, minute: 0 };
  try {
    const d = new Date(dateStr);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
    };
  } catch {
    return { year: CURRENT_YEAR, month: new Date().getMonth(), day: new Date().getDate(), hour: 18, minute: 0 };
  }
}

export default function AdminEditMatchScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasBookedSeats, setHasBookedSeats] = useState(false);

  const [form, setForm] = useState({
    title: '',
    teamA: '',
    teamB: '',
    venue: '',
    matchDate: '',
    description: '',
    imageUrl: '',
    teamALogo: '',
    teamBLogo: '',
    vipPrice: '',
    premiumPrice: '',
    generalPrice: '',
    rows: '',
    seatsPerRow: '',
    vipRows: '',
    premiumRows: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(CURRENT_YEAR);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);

  const maxDays = getDaysInMonth(pickerYear, pickerMonth);
  const clampedDay = Math.min(pickerDay, maxDays);

  const loadMatch = useCallback(async () => {
    setIsLoading(true);
    try {
      setError('');
      const match = await fetchMatchById(matchId);
      const hasSeats = (match.seatStats?.booked || 0) + (match.seatStats?.locked || 0) > 0;
      setHasBookedSeats(hasSeats);

      setForm({
        title: match.title || '',
        teamA: match.teamA || '',
        teamB: match.teamB || '',
        venue: match.venue || '',
        matchDate: match.matchDate || '',
        description: match.description || '',
        imageUrl: match.imageUrl || '',
        teamALogo: match.teamALogo || '',
        teamBLogo: match.teamBLogo || '',
        vipPrice: String(match.pricing?.vip ?? ''),
        premiumPrice: String(match.pricing?.premium ?? ''),
        generalPrice: String(match.pricing?.general ?? ''),
        rows: String(match.seatLayout?.rows ?? ''),
        seatsPerRow: String(match.seatLayout?.seatsPerRow ?? ''),
        vipRows: String(match.seatLayout?.vipRows ?? ''),
        premiumRows: String(match.seatLayout?.premiumRows ?? ''),
      });

      const comps = parseDateToComponents(match.matchDate);
      setPickerYear(comps.year);
      setPickerMonth(comps.month);
      setPickerDay(comps.day);
      setPickerHour(comps.hour);
      setPickerMinute(comps.minute);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load match');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useFocusEffect(useCallback(() => { loadMatch(); }, [loadMatch]));

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = () => {
    const iso = formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute);
    updateField('matchDate', iso);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    const required = ['title', 'teamA', 'teamB', 'venue', 'matchDate'];
    const missing = required.filter((field) => !form[field].trim());

    if (missing.length > 0) {
      Alert.alert('Missing fields', 'Please fill title, teams, venue, and match date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        teamA: form.teamA.trim(),
        teamB: form.teamB.trim(),
        venue: form.venue.trim(),
        matchDate: form.matchDate.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        teamALogo: form.teamALogo.trim(),
        teamBLogo: form.teamBLogo.trim(),
        pricing: {
          vip: Number(form.vipPrice),
          premium: Number(form.premiumPrice),
          general: Number(form.generalPrice),
        },
      };

      if (!hasBookedSeats) {
        payload.seatLayout = {
          rows: Number(form.rows),
          seatsPerRow: Number(form.seatsPerRow),
          vipRows: Number(form.vipRows),
          premiumRows: Number(form.premiumRows),
        };
      }

      const result = await updateMatch(matchId, payload);

      const msg = result.seatsRegenerated
        ? 'Match updated and seats regenerated.'
        : 'Match updated successfully.';

      Alert.alert('Success', msg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update match');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Match" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={glass.brandPurple} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Match" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadMatch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Edit Match"
        subtitle="Update event details and pricing"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* ═══ EVENT INFO ═══ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.brandPurple }]} />
              <Text style={styles.sectionTitle}>Event Info</Text>
            </View>

            <Text style={styles.inputLabel}>Match Title</Text>
            <TextInput
              style={styles.inputField}
              placeholder="T20 Final - Season Opener"
              placeholderTextColor={glass.textMuted}
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team A</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nepal"
                  placeholderTextColor={glass.textMuted}
                  value={form.teamA}
                  onChangeText={(v) => updateField('teamA', v)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team B</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="India"
                  placeholderTextColor={glass.textMuted}
                  value={form.teamB}
                  onChangeText={(v) => updateField('teamB', v)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Venue</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Smart Stadium Arena"
              placeholderTextColor={glass.textMuted}
              value={form.venue}
              onChangeText={(v) => updateField('venue', v)}
            />

            <Text style={styles.inputLabel}>Match Date & Time</Text>
            <TouchableOpacity
              style={styles.datePickerTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerIcon}>📅</Text>
              <View style={styles.datePickerTextWrap}>
                {form.matchDate ? (
                  <>
                    <Text style={styles.datePickerValue}>
                      {formatDisplayDate(form.matchDate)}
                    </Text>
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

          {/* ═══ MATCH IMAGES ═══ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#00E5FF' }]} />
              <Text style={styles.sectionTitle}>Match Images</Text>
            </View>

            <Text style={styles.inputLabel}>Match Banner URL (optional)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="https://example.com/match-banner.jpg"
              placeholderTextColor={glass.textMuted}
              value={form.imageUrl}
              onChangeText={(v) => updateField('imageUrl', v)}
              autoCapitalize="none"
              keyboardType="url"
            />
            {form.imageUrl.trim() ? (
              <Image source={{ uri: form.imageUrl.trim() }} style={styles.imagePreview} resizeMode="cover" />
            ) : null}

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team A Logo URL</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="https://example.com/team-a.png"
                  placeholderTextColor={glass.textMuted}
                  value={form.teamALogo}
                  onChangeText={(v) => updateField('teamALogo', v)}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                {form.teamALogo.trim() ? (
                  <Image source={{ uri: form.teamALogo.trim() }} style={styles.logoPreview} resizeMode="contain" />
                ) : null}
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team B Logo URL</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="https://example.com/team-b.png"
                  placeholderTextColor={glass.textMuted}
                  value={form.teamBLogo}
                  onChangeText={(v) => updateField('teamBLogo', v)}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                {form.teamBLogo.trim() ? (
                  <Image source={{ uri: form.teamBLogo.trim() }} style={styles.logoPreview} resizeMode="contain" />
                ) : null}
              </View>
            </View>
          </View>

          {/* ═══ PRICING ═══ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.statusSuccessText }]} />
              <Text style={styles.sectionTitle}>Pricing (Rs.)</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>VIP</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={form.vipPrice}
                  onChangeText={(v) => updateField('vipPrice', v)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Premium</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={form.premiumPrice}
                  onChangeText={(v) => updateField('premiumPrice', v)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>General</Text>
            <TextInput
              style={styles.inputField}
              keyboardType="numeric"
              value={form.generalPrice}
              onChangeText={(v) => updateField('generalPrice', v)}
            />
          </View>

          {/* ═══ SEAT LAYOUT ═══ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.statusWarningText }]} />
              <Text style={styles.sectionTitle}>Seat Layout</Text>
            </View>

            {hasBookedSeats ? (
              <View style={styles.lockedCard}>
                <Text style={styles.lockedIcon}>🔒</Text>
                <Text style={styles.lockedText}>
                  Seat layout is locked because some seats are booked or locked. Complete or cancel those bookings before modifying the layout.
                </Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Total Rows</Text>
                <TextInput
                  style={[styles.inputField, hasBookedSeats && styles.inputDisabled]}
                  keyboardType="numeric"
                  value={form.rows}
                  onChangeText={(v) => updateField('rows', v)}
                  editable={!hasBookedSeats}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Seats / Row</Text>
                <TextInput
                  style={[styles.inputField, hasBookedSeats && styles.inputDisabled]}
                  keyboardType="numeric"
                  value={form.seatsPerRow}
                  onChangeText={(v) => updateField('seatsPerRow', v)}
                  editable={!hasBookedSeats}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>VIP Rows</Text>
                <TextInput
                  style={[styles.inputField, hasBookedSeats && styles.inputDisabled]}
                  keyboardType="numeric"
                  value={form.vipRows}
                  onChangeText={(v) => updateField('vipRows', v)}
                  editable={!hasBookedSeats}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Premium Rows</Text>
                <TextInput
                  style={[styles.inputField, hasBookedSeats && styles.inputDisabled]}
                  keyboardType="numeric"
                  value={form.premiumRows}
                  onChangeText={(v) => updateField('premiumRows', v)}
                  editable={!hasBookedSeats}
                />
              </View>
            </View>

            <View style={styles.hintCard}>
              <Text style={styles.hint}>
                Total seats: {Number(form.rows || 0) * Number(form.seatsPerRow || 0)} · General
                rows are auto-calculated from remaining rows.
              </Text>
            </View>
          </View>

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
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══════════════════════════════════════════════════
         DATE / TIME PICKER MODAL
         ═══════════════════════════════════════════════════ */}
      <Modal visible={showDatePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowDatePicker(false)}
            activeOpacity={1}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Date & Time</Text>

            <View style={styles.datePreview}>
              <Text style={styles.datePreviewIcon}>📅</Text>
              <Text style={styles.datePreviewText}>
                {formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute)}
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
                      <Text style={[styles.pickerItemText, pickerYear === y && styles.pickerItemTextActive]}>
                        {y}
                      </Text>
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
                      <Text style={[styles.pickerItemText, pickerMonth === i && styles.pickerItemTextActive]}>
                        {m}
                      </Text>
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
                      <Text style={[styles.pickerItemText, clampedDay === d && styles.pickerItemTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={[styles.pickerRow, { marginTop: spacing.md }]}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>HOUR</Text>
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
                <Text style={styles.pickerLabel}>MINUTE</Text>
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
              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={() => setShowDatePicker(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetConfirmBtn}
                onPress={handleDateConfirm}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[glass.brandPurple, glass.neonPurple]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: glass.canvasStart,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  errorText: {
    color: glass.statusDangerText,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: glass.brandPurpleSurface,
    borderWidth: 1,
    borderColor: glass.brandPurple,
  },
  retryText: {
    color: glass.brandPurple,
    fontWeight: '700',
    fontSize: typography.bodyMedium.fontSize,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },

  sectionCard: {
    backgroundColor: glass.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
  },

  inputLabel: {
    color: glass.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  inputField: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  inputDisabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  logoPreview: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  datePickerIcon: {
    fontSize: 20,
  },
  datePickerTextWrap: {
    flex: 1,
  },
  datePickerValue: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    fontFamily: glass.monoFont,
  },
  datePickerPlaceholder: {
    color: glass.textMuted,
    fontSize: typography.body.fontSize,
  },
  datePickerHint: {
    color: glass.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  datePickerChevron: {
    color: glass.textMuted,
    fontSize: 20,
    fontWeight: '600',
  },

  lockedCard: {
    backgroundColor: 'rgba(255,179,0,0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  lockedIcon: {
    fontSize: 16,
  },
  lockedText: {
    color: glass.statusWarningText,
    fontSize: typography.small.fontSize,
    lineHeight: 18,
    flex: 1,
  },

  hintCard: {
    backgroundColor: 'rgba(0,229,255,0.06)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hint: {
    color: glass.textSecondary,
    fontSize: typography.small.fontSize,
    lineHeight: 18,
  },

  submitButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: spacing.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: typography.body.fontSize,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0D0F18',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.huge,
    borderWidth: 1,
    borderColor: glass.border,
    borderBottomWidth: 0,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: glass.textMuted,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },

  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  datePreviewIcon: {
    fontSize: 18,
  },
  datePreviewText: {
    color: glass.brandPurple,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
    fontFamily: glass.monoFont,
    flex: 1,
  },

  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerCol: {
    flex: 1,
  },
  pickerLabel: {
    color: glass.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 150,
  },
  pickerItem: {
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: 2,
  },
  pickerItemActive: {
    backgroundColor: glass.brandPurpleSurface,
    borderWidth: 1,
    borderColor: glass.brandPurple,
  },
  pickerItemText: {
    color: glass.textMuted,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '600',
  },
  pickerItemTextActive: {
    color: glass.brandPurple,
    fontWeight: '800',
  },

  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: glass.border,
  },
  sheetCancelText: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  sheetConfirmBtn: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  sheetConfirmGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  sheetConfirmText: {
    color: '#FFFFFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
  },
});
