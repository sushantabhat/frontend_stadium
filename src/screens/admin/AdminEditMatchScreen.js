import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import PolygonEditor from '../../components/stadium/PolygonEditor';
import { fetchMatchById, updateMatch } from '../../services/matchService';
import { colors, spacing, radii, typography, glass, CATEGORY_COLORS } from '../../constants/theme';

const CATEGORY_OPTIONS = ['platinum', 'gold', 'silver', 'bronze', 'general', 'supporters'];

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
      timeZone: 'Asia/Kathmandu',
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
  });

  const [pricing, setPricing] = useState({
    platinum: '', gold: '', silver: '', bronze: '', general: '', supporters: '',
  });

  const [sections, setSections] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(CURRENT_YEAR);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [polygonEditorIndex, setPolygonEditorIndex] = useState(null);

  const maxDays = getDaysInMonth(pickerYear, pickerMonth);
  const clampedDay = Math.min(pickerDay, maxDays);

  const loadMatch = useCallback(async () => {
    setIsLoading(true);
    try {
      setError('');
      const match = await fetchMatchById(matchId);
      const hasSeats = (match.seatStats?.booked || 0) + (match.seatStats?.locked || 0) > 0;
      setHasBookedSeats(hasSeats);

      const pricingObj = match.pricing || {};
      setPricing({
        platinum: String(pricingObj.platinum ?? ''),
        gold: String(pricingObj.gold ?? ''),
        silver: String(pricingObj.silver ?? ''),
        bronze: String(pricingObj.bronze ?? ''),
        general: String(pricingObj.general ?? ''),
        supporters: String(pricingObj.supporters ?? ''),
      });

      setSections(
        (match.stadiumSections || []).map((s) => ({
          sectionId: s.sectionId || '',
          category: s.category || 'platinum',
          label: s.label || '',
          color: s.color || '#888888',
          pricePerTicket: String(s.pricePerTicket ?? ''),
          totalSeats: String(s.totalSeats ?? ''),
          rows: Array.isArray(s.rows) ? s.rows.join(',') : '',
          polygon: s.polygon || '',
        }))
      );

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
      const pricingObj = {};
      for (const [key, val] of Object.entries(pricing)) {
        pricingObj[key] = Number(val) || 0;
      }

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
        pricing: pricingObj,
      };

      if (!hasBookedSeats) {
        const stadiumSections = sections
          .filter((s) => s.sectionId.trim())
          .map((s) => ({
            sectionId: s.sectionId.trim(),
            category: s.category,
            label: s.label.trim() || s.sectionId.trim(),
            color: s.color || CATEGORY_COLORS[s.category]?.accent || '#E8E8E8',
            pricePerTicket: Number(s.pricePerTicket) || 0,
            totalSeats: Number(s.totalSeats) || 0,
            availableSeats: Number(s.totalSeats) || 0,
            rows: s.rows
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean),
            polygon: s.polygon || '',
          }));

        if (stadiumSections.length > 0) {
          payload.stadiumSections = stadiumSections;
        }
      }

      await updateMatch(matchId, payload);

      const hadStructuralChange = !hasBookedSeats && payload.stadiumSections?.length > 0;
      const msg = hadStructuralChange
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScreenHeader title="Edit Match" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={glass.brandPurple} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScreenHeader title="Edit Match" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadMatch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
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
                  onChangeText={(v) => setPricing((prev) => ({ ...prev, [cat]: v }))}
                  editable={!hasBookedSeats}
                />
              </View>
            ))}
          </View>

          {/* ═══ STADIUM SECTIONS ═══ */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.statusWarningText }]} />
              <Text style={styles.sectionTitle}>Stadium Sections</Text>
            </View>

            {hasBookedSeats ? (
              <View style={styles.lockedCard}>
                <Text style={styles.lockedIcon}>🔒</Text>
                <Text style={styles.lockedText}>
                  Sections are locked because some seats are booked or locked. Complete or cancel those bookings first.
                </Text>
              </View>
            ) : null}

            {sections.map((section, index) => (
              <View key={index} style={styles.sectionItem}>
                <View style={styles.sectionItemHeader}>
                  <Text style={styles.sectionItemTitle}>Section {index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => setSections((prev) => prev.filter((_, i) => i !== index))}
                    style={styles.removeBtn}
                  >
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
                      onChangeText={(v) => {
                        setSections((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], sectionId: v };
                          return next;
                        });
                      }}
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
                          onPress={() => {
                            setSections((prev) => {
                              const next = [...prev];
                              next[index] = { ...next[index], category: cat, color: CATEGORY_COLORS[cat].accent };
                              return next;
                            });
                          }}
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
                      onChangeText={(v) => {
                        setSections((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], pricePerTicket: v };
                          return next;
                        });
                      }}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.inputLabel}>Total Seats</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      value={section.totalSeats}
                      onChangeText={(v) => {
                        setSections((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], totalSeats: v };
                          return next;
                        });
                      }}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Row Labels (comma separated)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="A,B,C,D"
                  placeholderTextColor={glass.textMuted}
                  value={section.rows}
                  onChangeText={(v) => {
                    setSections((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], rows: v };
                      return next;
                    });
                  }}
                />

                <Text style={styles.inputLabel}>Stadium Map Shape</Text>
                {section.polygon ? (
                  <View style={styles.polygonBtns}>
                    <TouchableOpacity
                      style={styles.polygonEditBtn}
                      onPress={() => setPolygonEditorIndex(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.polygonEditText}>Edit Shape</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.polygonClearBtn}
                      onPress={() => {
                        setSections((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], polygon: '' };
                          return next;
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.polygonClearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.polygonDrawBtn}
                    onPress={() => setPolygonEditorIndex(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.polygonDrawText}>Draw on Stadium Map</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {!hasBookedSeats && (
              <TouchableOpacity
                style={styles.addSectionBtn}
                onPress={() => setSections((prev) => [...prev, { sectionId: '', category: 'platinum', label: '', color: '#E8E8E8', pricePerTicket: '3500', totalSeats: '20', rows: 'A,B,C', polygon: '' }])}
                activeOpacity={0.7}
              >
                <Text style={styles.addSectionBtnText}>+ Add Section</Text>
              </TouchableOpacity>
            )}

            {sections.length > 0 && (
              <View style={styles.hintCard}>
                <Text style={styles.hint}>
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

      {/* POLYGON EDITOR MODAL */}
      <Modal visible={polygonEditorIndex !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setPolygonEditorIndex(null)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetActions}>
              <Text style={styles.sheetTitle}>Draw Section Polygon</Text>
              <TouchableOpacity onPress={() => setPolygonEditorIndex(null)} activeOpacity={0.7}>
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
                  setTimeout(() => {
                    setSections((prev) => {
                      const next = [...prev];
                      next[polygonEditorIndex] = { ...next[polygonEditorIndex], polygon: path };
                      return next;
                    });
                  }, 0);
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

  priceRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm,
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
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
