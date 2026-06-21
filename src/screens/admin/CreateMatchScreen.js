import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import PolygonEditor from '../../components/stadium/PolygonEditor';
import { createMatch } from '../../services/matchService';
import { colors, spacing, radii, typography, glass, CATEGORY_COLORS } from '../../constants/theme';

const CATEGORY_OPTIONS = ['platinum', 'gold', 'silver', 'bronze', 'general', 'supporters'];

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
};

const DEFAULT_PRICING = {
  platinum: '3500',
  gold: '2500',
  silver: '1500',
  bronze: '800',
  general: '300',
  supporters: '150',
};

const EMPTY_SECTION = {
  sectionId: '',
  category: 'platinum',
  label: '',
  color: '#E8E8E8',
  pricePerTicket: '3500',
  totalSeats: '20',
  rows: 'A,B,C',
  polygon: '',
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
  const h = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
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
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(CURRENT_YEAR);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [polygonEditorIndex, setPolygonEditorIndex] = useState(null);

  const maxDays = getDaysInMonth(pickerYear, pickerMonth);
  const clampedDay = Math.min(pickerDay, maxDays);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updatePricing = (cat, value) => setPricing((prev) => ({ ...prev, [cat]: value }));

  const updateSection = (index, field, value) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'category') {
        const catKey = value;
        next[index].color = CATEGORY_COLORS[catKey]?.accent || '#888888';
        next[index].pricePerTicket = pricing[catKey] || '0';
      }
      return next;
    });
  };

  const addSection = () => {
    setSections((prev) => {
      const idx = prev.length;
      return [...prev, { ...EMPTY_SECTION, sectionId: `S${idx + 1}` }];
    });
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const openPolygonEditor = (index) => setPolygonEditorIndex(index);
  const closePolygonEditor = () => setPolygonEditorIndex(null);

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
      const pricingObj = {};
      for (const [key, val] of Object.entries(pricing)) {
        pricingObj[key] = Number(val) || 0;
      }

      const stadiumSections = sections
        .filter((s) => s.sectionId.trim())
        .map((s) => ({
          sectionId: s.sectionId.trim(),
          category: s.category,
          label: s.label.trim() || s.sectionId.trim(),
          color: s.color,
          polygon: s.polygon || '',
          pricePerTicket: Number(s.pricePerTicket) || 0,
          totalSeats: Number(s.totalSeats) || 0,
          availableSeats: Number(s.totalSeats) || 0,
          rows: s.rows
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean),
        }));

      const payload = {
        ...form,
        pricing: pricingObj,
      };

      if (stadiumSections.length > 0) {
        payload.stadiumSections = stadiumSections;
      } else {
        payload.seatLayout = { rows: 10, seatsPerRow: 20, vipRows: 2, premiumRows: 3 };
      }

      const match = await createMatch(payload);

      Alert.alert('Success', 'Match created with stadium layout.', [
        { text: 'View Match', onPress: () => navigation.replace('AdminMatchDetail', { matchId: match._id }) },
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
        subtitle="Define event details, pricing, and stadium layout"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* EVENT INFO */}
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

            <Text style={styles.inputLabel}>Match Banner URL</Text>
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
              </View>
            </View>
          </View>

          {/* PRICING */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.statusSuccessText }]} />
              <Text style={styles.sectionTitle}>Category Pricing</Text>
            </View>

            {CATEGORY_OPTIONS.map((cat) => (
              <View key={cat} style={styles.priceRow}>
                <View style={[styles.priceDot, { backgroundColor: CATEGORY_COLORS[cat].accent }]} />
                <Text style={styles.priceLabel}>{CATEGORY_COLORS[cat].label}</Text>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  value={pricing[cat]}
                  onChangeText={(v) => updatePricing(cat, v)}
                />
              </View>
            ))}
          </View>

          {/* STADIUM SECTIONS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.statusWarningText }]} />
              <Text style={styles.sectionTitle}>Stadium Sections</Text>
            </View>

            <Text style={styles.hint}>
              Define sections with SVG polygons for the interactive stadium map. Each section maps to a category.
            </Text>

            {sections.map((section, index) => (
              <View key={index} style={styles.sectionItem}>
                <View style={styles.sectionItemHeader}>
                  <Text style={styles.sectionItemTitle}>Section {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeSection(index)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.inputLabel}>Section ID</Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="318"
                      placeholderTextColor={glass.textMuted}
                      value={section.sectionId}
                      onChangeText={(v) => updateSection(index, 'sectionId', v)}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.categoryPicker}>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryChip,
                            section.category === cat && {
                              borderColor: CATEGORY_COLORS[cat].accent,
                              backgroundColor: CATEGORY_COLORS[cat].bg,
                            },
                          ]}
                          onPress={() => updateSection(index, 'category', cat)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat].accent }]} />
                          <Text
                            style={[
                              styles.categoryChipText,
                              section.category === cat && { color: CATEGORY_COLORS[cat].accent },
                            ]}
                          >
                            {CATEGORY_COLORS[cat].label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.inputLabel}>Price / Ticket</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={section.pricePerTicket}
                      onChangeText={(v) => updateSection(index, 'pricePerTicket', v)}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.inputLabel}>Total Seats</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={section.totalSeats}
                      onChangeText={(v) => updateSection(index, 'totalSeats', v)}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Row Labels (comma separated)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="A,B,C,D"
                  placeholderTextColor={glass.textMuted}
                  value={section.rows}
                  onChangeText={(v) => updateSection(index, 'rows', v)}
                />

                <Text style={styles.inputLabel}>Stadium Map Shape</Text>
                {section.polygon ? (
                  <View style={styles.polygonBtns}>
                    <TouchableOpacity
                      style={styles.polygonEditBtn}
                      onPress={() => openPolygonEditor(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.polygonEditText}>Edit Shape</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.polygonClearBtn}
                      onPress={() => updateSection(index, 'polygon', '')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.polygonClearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.polygonDrawBtn}
                    onPress={() => openPolygonEditor(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.polygonDrawText}>Draw on Stadium Map</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addSectionBtn} onPress={addSection} activeOpacity={0.7}>
              <Text style={styles.addSectionBtnText}>+ Add Section</Text>
            </TouchableOpacity>

            {sections.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>
                  {sections.length} section{sections.length > 1 ? 's' : ''} ·{' '}
                  {sections.reduce((sum, s) => sum + (Number(s.totalSeats) || 0), 0)} total seats
                </Text>
              </View>
            )}
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
                <Text style={styles.submitButtonText}>Create Match & Stadium</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
              <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleDateConfirm} activeOpacity={0.85}>
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

      {/* POLYGON EDITOR MODAL */}
      <Modal visible={polygonEditorIndex !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closePolygonEditor} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetActions}>
              <Text style={styles.sheetTitle}>Draw Section Polygon</Text>
              <TouchableOpacity onPress={closePolygonEditor} activeOpacity={0.7}>
                <Text style={styles.sheetCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
            {polygonEditorIndex !== null && sections[polygonEditorIndex] && (
              <PolygonEditor
                existingSections={sections.filter((_, i) => i !== polygonEditorIndex)}
                initialPolygon={sections[polygonEditorIndex].polygon || ''}
                sectionColor={sections[polygonEditorIndex].color || '#FFD700'}
                sectionLabel={`Section ${polygonEditorIndex + 1} — ${sections[polygonEditorIndex].sectionId || 'New'}`}
                onPolygonChange={(path) => {
                  setSections((prev) => {
                    const next = [...prev];
                    next[polygonEditorIndex] = { ...next[polygonEditorIndex], polygon: path };
                    return next;
                  });
                }}
              />
            )}
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
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  mono: { fontFamily: glass.monoFont, fontSize: 12 },

  imagePreview: {
    width: '100%', height: 160, borderRadius: radii.md,
    marginBottom: spacing.md, backgroundColor: 'rgba(255,255,255,0.04)',
  },

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

  sectionItem: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radii.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg, marginBottom: spacing.md,
  },
  sectionItemHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionItemTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.bodyMedium.fontSize },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,59,48,0.15)', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: colors.danger, fontSize: 12, fontWeight: '800' },

  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radii.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryChipText: { color: glass.textMuted, fontSize: 9, fontWeight: '700' },

  addSectionBtn: {
    paddingVertical: spacing.md, borderRadius: radii.md,
    borderWidth: 1.5, borderColor: glass.brandPurple, borderStyle: 'dashed',
    alignItems: 'center', marginBottom: spacing.md,
  },
  addSectionBtnText: { color: glass.brandPurple, fontWeight: '700', fontSize: typography.captionMedium.fontSize },

  summaryCard: {
    backgroundColor: 'rgba(123,97,255,0.08)', borderRadius: radii.md,
    padding: spacing.md,
  },
  summaryText: { color: glass.brandPurple, fontSize: typography.small.fontSize, fontWeight: '700', textAlign: 'center' },

  submitButton: { borderRadius: radii.lg, overflow: 'hidden' },
  submitGradient: { paddingVertical: spacing.lg, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: typography.body.fontSize },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    padding: spacing.xxl, paddingBottom: spacing.huge,
    borderWidth: 1, borderColor: glass.border, borderBottomWidth: 0,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: glass.textMuted, alignSelf: 'center', marginBottom: spacing.xl },
  sheetTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.lg },

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
  sheetConfirmGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
  sheetConfirmText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  polygonBtns: { flexDirection: 'row', gap: spacing.sm },
  polygonEditBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.4)',
  },
  polygonEditText: { color: glass.brandPurple, fontSize: 10, fontWeight: '700' },
  polygonClearBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  polygonClearText: { color: '#FF3B30', fontSize: 10, fontWeight: '700' },
  polygonDrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.border,
    borderStyle: 'dashed',
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  polygonDrawText: { color: glass.brandPurple, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
});
