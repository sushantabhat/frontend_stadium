import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated, PanResponder, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

/* ─── Default pricing configuration ─── */
const DEFAULT_CONFIG = {
  vipPrice: 2500,
  premiumPrice: 1500,
  generalPrice: 800,
  dynamicMultiplier: 1.0,
  seatLockTimeout: 10,
  autoCancelMinutes: 15,
  pushNotifications: true,
  emailAlerts: true,
  fraudAlertsToAdmin: true,
};

/* ──────────────────────────────────────────────────────────
 * Custom Range Slider Component
 * Uses PanResponder + Animated for drag-based value selection.
 * No external libraries required.
 * ────────────────────────────────────────────────────────── */
function GlassRangeSlider({ value, min, max, step = 1, onValueChange, accentColor = glass.neonCyan, label, unit = '' }) {
  const trackWidth = useRef(0);

  /* Calculate thumb position as percentage of track */
  const percentage = ((value - min) / (max - min)) * 100;

  /* Create pan responder for horizontal drag */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (trackWidth.current === 0) return;
        const dx = gestureState.dx;
        const range = max - min;
        const delta = (dx / trackWidth.current) * range;
        const raw = Math.round((value + delta) / step) * step;
        const clamped = Math.max(min, Math.min(max, raw));
        onValueChange(clamped);
      },
    })
  ).current;

  return (
    <View style={sliderStyles.container}>
      {label && (
        <View style={sliderStyles.labelRow}>
          <Text style={sliderStyles.label}>{label}</Text>
          <Text style={[sliderStyles.value, { color: accentColor }]}>
            {unit}{typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
        </View>
      )}
      {/* Track */}
      <View
        style={sliderStyles.trackBg}
        {...panResponder.panHandlers}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
      >
        {/* Filled portion */}
        <View
          style={[
            sliderStyles.trackFill,
            { width: `${percentage}%`, backgroundColor: accentColor },
          ]}
        />
        {/* Thumb */}
        <View
          style={[
            sliderStyles.thumb,
            { left: `${percentage}%`, backgroundColor: accentColor },
          ]}
        >
          <View style={[sliderStyles.thumbInner, { borderColor: accentColor }]} />
        </View>
      </View>
      {/* Min/Max labels */}
      <View style={sliderStyles.rangeRow}>
        <Text style={sliderStyles.rangeText}>{unit}{min}</Text>
        <Text style={sliderStyles.rangeText}>{unit}{max}</Text>
      </View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Custom Toggle Switch Component
 * Glows bright mint-green when ON, matte slate when OFF.
 * ────────────────────────────────────────────────────────── */
function GlassToggle({ value, onToggle, label }) {
  return (
    <TouchableOpacity style={toggleStyles.row} onPress={onToggle} activeOpacity={0.7}>
      <Text style={toggleStyles.label}>{label}</Text>
      <View style={[toggleStyles.track, value && toggleStyles.trackActive]}>
        <View style={[toggleStyles.thumb, value && toggleStyles.thumbActive]} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminSettingsScreen({ navigation }) {
  /* ── State: configuration values ── */
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showSheet, setShowSheet] = useState(false);

  /* ── Helper: update a single config key ── */
  const updateConfig = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Value Configurator"
        subtitle="Pricing, rules & system parameters"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ═══ PRICING SLIDERS SECTION ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: glass.neonCyan }]} />
            <Text style={styles.sectionTitle}>Seat Pricing (₹)</Text>
          </View>
          <View style={styles.card}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <GlassRangeSlider
                label="VIP Seats"
                value={config.vipPrice}
                min={500}
                max={5000}
                step={100}
                unit="₹"
                accentColor={glass.neonAmber}
                onValueChange={(v) => updateConfig('vipPrice', v)}
              />
              <GlassRangeSlider
                label="Premium Seats"
                value={config.premiumPrice}
                min={300}
                max={3000}
                step={100}
                unit="₹"
                accentColor={glass.neonPurple}
                onValueChange={(v) => updateConfig('premiumPrice', v)}
              />
              <GlassRangeSlider
                label="General Seats"
                value={config.generalPrice}
                min={200}
                max={2000}
                step={50}
                unit="₹"
                accentColor={glass.statusSuccessText}
                onValueChange={(v) => updateConfig('generalPrice', v)}
              />
            </LinearGradient>
          </View>
        </View>

        {/* ═══ DYNAMIC PRICING ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: glass.neonMagenta }]} />
            <Text style={styles.sectionTitle}>Dynamic Pricing</Text>
          </View>
          <View style={styles.card}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <GlassRangeSlider
                label="Surge Multiplier"
                value={config.dynamicMultiplier}
                min={1.0}
                max={2.0}
                step={0.1}
                unit=""
                accentColor={glass.neonMagenta}
                onValueChange={(v) => updateConfig('dynamicMultiplier', v)}
              />
              <View style={styles.hintCard}>
                <Text style={styles.hint}>
                  When enabled, prices multiply dynamically based on demand.
                  Current: {config.dynamicMultiplier}x base rate.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* ═══ SYSTEM RULES ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: glass.statusWarningText }]} />
            <Text style={styles.sectionTitle}>System Rules</Text>
          </View>
          <View style={styles.card}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <GlassRangeSlider
                label="Seat Lock Timeout"
                value={config.seatLockTimeout}
                min={5}
                max={30}
                step={1}
                unit=""
                accentColor={glass.neonCyan}
                onValueChange={(v) => updateConfig('seatLockTimeout', v)}
              />
              <View style={styles.sliderUnitRow}>
                <Text style={styles.sliderUnit}>minutes</Text>
              </View>

              <GlassRangeSlider
                label="Auto-Cancel Unpaid"
                value={config.autoCancelMinutes}
                min={5}
                max={60}
                step={5}
                unit=""
                accentColor={glass.statusWarningText}
                onValueChange={(v) => updateConfig('autoCancelMinutes', v)}
              />
              <View style={styles.sliderUnitRow}>
                <Text style={styles.sliderUnit}>minutes</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* ═══ NOTIFICATION TOGGLES ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: glass.statusSuccessText }]} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.card}>
            <LinearGradient
              colors={[glass.surface, 'rgba(18,21,34,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <GlassToggle
                label="Push Notifications"
                value={config.pushNotifications}
                onToggle={() => updateConfig('pushNotifications', !config.pushNotifications)}
              />
              <View style={styles.toggleDivider} />
              <GlassToggle
                label="Email Alerts"
                value={config.emailAlerts}
                onToggle={() => updateConfig('emailAlerts', !config.emailAlerts)}
              />
              <View style={styles.toggleDivider} />
              <GlassToggle
                label="Fraud Alerts → Admin"
                value={config.fraudAlertsToAdmin}
                onToggle={() => updateConfig('fraudAlertsToAdmin', !config.fraudAlertsToAdmin)}
              />
            </LinearGradient>
          </View>
        </View>

        {/* ═══ SAVE BUTTON ═══ */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setShowSheet(true)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[glass.neonCyan, glass.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Review & Apply Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>

      {/* ═══ FLOATING BOTTOM SHEET ═══ */}
      <Animated.View
        style={[styles.sheetOverlay, { opacity: showSheet ? 1 : 0, pointerEvents: showSheet ? 'auto' : 'none' }]}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          onPress={() => setShowSheet(false)}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: showSheet ? 0 : 400 }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Confirm Configuration</Text>
          <Text style={styles.sheetSubtitle}>Review your changes before applying</Text>

          {/* Summary */}
          <View style={styles.sheetSummary}>
            <View style={styles.sheetSummaryRow}>
              <Text style={styles.sheetSummaryLabel}>VIP Price</Text>
              <Text style={styles.sheetSummaryValue}>₹{config.vipPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.sheetSummaryRow}>
              <Text style={styles.sheetSummaryLabel}>Premium Price</Text>
              <Text style={styles.sheetSummaryValue}>₹{config.premiumPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.sheetSummaryRow}>
              <Text style={styles.sheetSummaryLabel}>General Price</Text>
              <Text style={styles.sheetSummaryValue}>₹{config.generalPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.sheetSummaryRow}>
              <Text style={styles.sheetSummaryLabel}>Surge Multiplier</Text>
              <Text style={[styles.sheetSummaryValue, { color: glass.neonMagenta }]}>{config.dynamicMultiplier}x</Text>
            </View>
            <View style={styles.sheetSummaryRow}>
              <Text style={styles.sheetSummaryLabel}>Seat Lock</Text>
              <Text style={styles.sheetSummaryValue}>{config.seatLockTimeout}m</Text>
            </View>
          </View>

          {/* Action buttons */}
          <TouchableOpacity
            style={styles.sheetCancelBtn}
            onPress={() => setShowSheet(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetConfirmBtn}
            onPress={() => {
              setShowSheet(false);
              /* In production: POST config to backend API */
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[glass.neonCyan, glass.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sheetConfirmGradient}
            >
              <Text style={styles.sheetConfirmText}>Apply Configuration</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ═══ RANGE SLIDER STYLES ═══ */
const sliderStyles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  label: { color: glass.textSecondary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  value: { fontSize: typography.bodyMedium.fontSize, fontWeight: '800', fontFamily: glass.monoFont },
  trackBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4, position: 'relative', justifyContent: 'center',
  },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4 },
  thumb: {
    width: 24, height: 24, borderRadius: 12,
    position: 'absolute', top: -8, marginLeft: -12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  thumbInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#0D0F18', borderWidth: 2 },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  rangeText: { color: glass.textMuted, fontSize: 9, fontFamily: glass.monoFont },
});

/* ═══ TOGGLE SWITCH STYLES ═══ */
const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md,
  },
  label: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  track: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', padding: 3,
  },
  trackActive: { backgroundColor: glass.statusSuccessText },
  thumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: glass.textMuted,
  },
  thumbActive: { backgroundColor: '#FFFFFF', marginLeft: 20 },
});

/* ═══ MAIN SCREEN STYLES ═══ */
const styles = StyleSheet.create({
  /* ── Canvas ── */
  container: { flex: 1, backgroundColor: glass.canvasStart },
  scroll: { paddingTop: spacing.md },

  /* ── Section ── */
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800' },

  /* ── Glass Card ── */
  card: { borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  cardInner: { padding: spacing.xl },

  /* ── Hints ── */
  hintCard: {
    backgroundColor: 'rgba(0,229,255,0.06)', borderRadius: radii.md,
    padding: spacing.md, marginTop: spacing.sm,
  },
  hint: { color: glass.textSecondary, fontSize: typography.small.fontSize, lineHeight: 18 },

  sliderUnitRow: { marginTop: -spacing.sm, marginBottom: spacing.xl },
  sliderUnit: { color: glass.textMuted, fontSize: 9, fontFamily: glass.monoFont },

  /* ── Save Button ── */
  saveButton: { borderRadius: radii.lg, overflow: 'hidden' },
  saveButtonGradient: { paddingVertical: spacing.lg, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: typography.body.fontSize },

  /* ═══ BOTTOM SHEET ═══ */
  sheetOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    padding: spacing.xxl, paddingBottom: spacing.huge,
    borderWidth: 1, borderColor: glass.border,
    borderBottomWidth: 0,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: glass.textMuted, alignSelf: 'center', marginBottom: spacing.xl,
  },
  sheetTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  sheetSubtitle: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.xl },

  /* Summary rows */
  sheetSummary: { marginBottom: spacing.xl },
  sheetSummaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: glass.border,
  },
  sheetSummaryLabel: { color: glass.textSecondary, fontSize: typography.caption.fontSize },
  sheetSummaryValue: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', fontFamily: glass.monoFont },

  /* Action buttons */
  sheetCancelBtn: {
    paddingVertical: spacing.lg, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: glass.border,
    marginBottom: spacing.md,
  },
  sheetCancelText: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  sheetConfirmBtn: { borderRadius: radii.md, overflow: 'hidden' },
  sheetConfirmGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
  sheetConfirmText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
