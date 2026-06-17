import React, { useState } from 'react';
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
import ScreenHeader from '../../components/ScreenHeader';
import { createMatch } from '../../services/matchService';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

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
  vipPrice: '2500',
  premiumPrice: '1500',
  generalPrice: '800',
  rows: '10',
  seatsPerRow: '20',
  vipRows: '2',
  premiumRows: '3',
};

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

export default function CreateMatchScreen({ navigation }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [pickerYear, setPickerYear] = useState(CURRENT_YEAR);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);

  const maxDays = getDaysInMonth(pickerYear, pickerMonth);
  const clampedDay = Math.min(pickerDay, maxDays);

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
      const match = await createMatch({
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
        seatLayout: {
          rows: Number(form.rows),
          seatsPerRow: Number(form.seatsPerRow),
          vipRows: Number(form.vipRows),
          premiumRows: Number(form.premiumRows),
        },
      });

      Alert.alert('Success', 'Match created with stadium seats.', [
        {
          text: 'View Match',
          onPress: () =>
            navigation.replace('AdminMatchDetail', { matchId: match._id }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create match');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Create Match"
        subtitle="Define event details, pricing, and seat layout"
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

            {/* ═══ DATE / TIME PICKER ═══ */}
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

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Total Rows</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={form.rows}
                  onChangeText={(v) => updateField('rows', v)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Seats / Row</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={form.seatsPerRow}
                  onChangeText={(v) => updateField('seatsPerRow', v)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>VIP Rows</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={form.vipRows}
                  onChangeText={(v) => updateField('vipRows', v)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Premium Rows</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={form.premiumRows}
                  onChangeText={(v) => updateField('premiumRows', v)}
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
                <Text style={styles.submitButtonText}>Create Match & Seats</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══════════════════════════════════════════════════
         DATE / TIME PICKER MODAL
         Glassmorphic bottom sheet with scroll selectors
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

            {/* Date preview */}
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewIcon}>📅</Text>
              <Text style={styles.datePreviewText}>
                {formatDateISO(pickerYear, pickerMonth, clampedDay, pickerHour, pickerMinute)}
              </Text>
            </View>

            {/* Year + Month + Day */}
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

            {/* Hour + Minute */}
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

            {/* Actions */}
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },

  /* ── Section Card ── */
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

  /* ── Form Fields ── */
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

  /* ── Date Picker Trigger ── */
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

  /* ── Hint Card ── */
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

  /* ── Submit Button ── */
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

  /* ═══ DATE PICKER MODAL ═══ */
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

  /* Date preview */
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

  /* Picker columns */
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

  /* Sheet actions */
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
