import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import PolygonEditor from '../../components/stadium/PolygonEditor';
import { updateVenue, createVenue } from '../../services/venueService';
import { colors, spacing, radii, typography, glass, CATEGORY_COLORS } from '../../constants/theme';

const CATEGORY_OPTIONS = ['platinum', 'gold', 'silver', 'bronze', 'general', 'supporters'];
const CATEGORY_COLORS_ARRAY = Object.values(CATEGORY_COLORS);

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

function buildPricingFromVenue(venue) {
  const result = {};
  for (const cat of CATEGORY_OPTIONS) {
    result[cat] = venue.pricing?.[cat] != null ? String(venue.pricing[cat]) : '0';
  }
  return result;
}

function buildSectionsFromVenue(venue) {
  return (venue.stadiumSections || []).map((s) => ({
    sectionId: s.sectionId || '',
    category: s.category || 'platinum',
    label: s.label || '',
    color: s.color || '#888888',
    pricePerTicket: String(s.pricePerTicket ?? ''),
    totalSeats: String(s.totalSeats ?? ''),
    rows: Array.isArray(s.rows) ? s.rows.join(',') : '',
    polygon: s.polygon || '',
  }));
}

export default function VenueEditorScreen({ navigation, route }) {
  const { venue } = route.params || {};
  const isEditing = !!venue;

  const [venueName, setVenueName] = useState(venue?.name || '');
  const [venueLocation, setVenueLocation] = useState(venue?.location || '');
  const [pricing, setPricing] = useState(() => {
    if (venue) return buildPricingFromVenue(venue);
    const result = {};
    for (const cat of CATEGORY_OPTIONS) result[cat] = '0';
    return result;
  });
  const [sections, setSections] = useState(() => {
    if (venue) return buildSectionsFromVenue(venue);
    return [];
  });
  const [isSaving, setIsSaving] = useState(false);
  const [polygonEditorIndex, setPolygonEditorIndex] = useState(null);

  const updatePricing = (cat, value) => setPricing((prev) => ({ ...prev, [cat]: value }));

  const updateSection = (index, field, value) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'category') {
        const catIndex = CATEGORY_OPTIONS.indexOf(value);
        next[index].color = CATEGORY_COLORS_ARRAY[catIndex]?.accent || '#888888';
        next[index].pricePerTicket = pricing[value] || '0';
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

  const saveVenue = async () => {
    if (!venueName.trim()) {
      Alert.alert('Name required', 'Please enter a venue name.');
      return;
    }
    setIsSaving(true);
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
          rows: s.rows.split(',').map((r) => r.trim()).filter(Boolean),
        }));
      const seatLayout = stadiumSections.length === 0 ? { rows: 10, seatsPerRow: 20, vipRows: 2, premiumRows: 3 } : null;

      if (isEditing) {
        await updateVenue(venue._id, {
          name: venueName.trim(),
          location: venueLocation.trim(),
          pricing: pricingObj,
          stadiumSections,
          seatLayout,
        });
      } else {
        await createVenue({
          name: venueName.trim(),
          location: venueLocation.trim(),
          pricing: pricingObj,
          stadiumSections,
          seatLayout,
        });
      }
      Alert.alert('Saved', 'Venue saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save venue');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title={isEditing ? 'Edit Venue' : 'New Venue'}
        subtitle="Configure sections, pricing, and stadium map"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLabel}>Venue Name</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g. Tribhuvan University International Cricket Ground"
            placeholderTextColor={glass.textMuted}
            value={venueName}
            onChangeText={setVenueName}
          />

          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g. Kirtipur, Kathmandu"
            placeholderTextColor={glass.textMuted}
            value={venueLocation}
            onChangeText={setVenueLocation}
          />

          {/* PRICING */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: glass.statusSuccessText }]} />
              <Text style={styles.sectionTitle}>Category Pricing</Text>
            </View>

            {CATEGORY_OPTIONS.map((cat) => {
              const catIndex = CATEGORY_OPTIONS.indexOf(cat);
              return (
                <View key={cat} style={styles.priceRow}>
                  <View style={[styles.priceDot, { backgroundColor: CATEGORY_COLORS_ARRAY[catIndex]?.accent }]} />
                  <Text style={styles.priceLabel}>{CATEGORY_COLORS_ARRAY[catIndex]?.label}</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={pricing[cat]}
                    onChangeText={(v) => updatePricing(cat, v)}
                  />
                </View>
              );
            })}
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
                          {CATEGORY_OPTIONS.map((cat) => {
                            const catIndex = CATEGORY_OPTIONS.indexOf(cat);
                            return (
                              <TouchableOpacity
                                key={cat}
                                style={[
                                  styles.categoryChip,
                                  section.category === cat && {
                                    borderColor: CATEGORY_COLORS_ARRAY[catIndex]?.accent,
                                    backgroundColor: CATEGORY_COLORS_ARRAY[catIndex]?.bg,
                                  },
                                ]}
                                onPress={() => updateSection(index, 'category', cat)}
                                activeOpacity={0.7}
                              >
                                <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS_ARRAY[catIndex]?.accent }]} />
                                <Text
                                  style={[
                                    styles.categoryChipText,
                                    section.category === cat && { color: CATEGORY_COLORS_ARRAY[catIndex]?.accent },
                                  ]}
                                >
                                  {CATEGORY_COLORS_ARRAY[catIndex]?.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
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
                          onPress={() => setPolygonEditorIndex(index)}
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
                        onPress={() => setPolygonEditorIndex(index)}
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
            style={styles.saveBtn}
            onPress={saveVenue}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[glass.brandPurple, glass.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Venue</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* POLYGON EDITOR — sibling modal, not nested */}
      <Modal visible={polygonEditorIndex !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setPolygonEditorIndex(null)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Draw Section Polygon</Text>
              <TouchableOpacity onPress={() => setPolygonEditorIndex(null)} activeOpacity={0.7}>
                <Text style={styles.sheetCancelText}>Done</Text>
              </TouchableOpacity>
            </View>
            {polygonEditorIndex !== null && sections[polygonEditorIndex] && (
              <ScrollView showsVerticalScrollIndicator={false}>
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
              </ScrollView>
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
  hint: { color: glass.textSecondary, fontSize: typography.small.fontSize, lineHeight: 18, marginBottom: spacing.lg },

  sectionCard: {
    backgroundColor: glass.card, borderRadius: radii.xl,
    borderWidth: 1, borderColor: glass.border,
    padding: spacing.xl, marginBottom: spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },

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

  saveBtn: { borderRadius: radii.lg, overflow: 'hidden', marginTop: spacing.lg },
  saveBtnGradient: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: typography.body.fontSize },

  polygonBtns: { flexDirection: 'row', gap: spacing.sm },
  polygonEditBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm, alignItems: 'center',
    backgroundColor: 'rgba(108,92,231,0.15)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.4)',
  },
  polygonEditText: { color: glass.brandPurple, fontSize: 10, fontWeight: '700' },
  polygonClearBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm, alignItems: 'center',
    backgroundColor: 'rgba(255,59,48,0.1)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)',
  },
  polygonClearText: { color: '#FF3B30', fontSize: 10, fontWeight: '700' },
  polygonDrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md,
    borderWidth: 1, borderColor: glass.border, borderStyle: 'dashed',
    paddingVertical: spacing.xl, alignItems: 'center', marginTop: spacing.xs,
  },
  polygonDrawText: { color: glass.brandPurple, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    maxHeight: '85%',
    borderWidth: 1, borderColor: glass.border, borderBottomWidth: 0,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: glass.textMuted, alignSelf: 'center', marginBottom: spacing.xl },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xxl, paddingTop: spacing.sm,
  },
  sheetTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.lg },
  sheetCancelText: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
