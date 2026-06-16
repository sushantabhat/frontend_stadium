import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { createMatch } from '../../services/matchService';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

const DEFAULT_FORM = {
  title: '',
  teamA: '',
  teamB: '',
  venue: '',
  matchDate: '',
  description: '',
  vipPrice: '2500',
  premiumPrice: '1500',
  generalPrice: '800',
  rows: '10',
  seatsPerRow: '20',
  vipRows: '2',
  premiumRows: '3',
};

export default function CreateMatchScreen({ navigation }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.sectionTitle}>Event Info</Text>
            </View>

            <Text style={styles.inputLabel}>Match Title</Text>
            <TextInput
              style={styles.inputField}
              placeholder="T20 Final - Season Opener"
              placeholderTextColor={colors.textSecondary}
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team A</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="India"
                  placeholderTextColor={colors.textSecondary}
                  value={form.teamA}
                  onChangeText={(v) => updateField('teamA', v)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Team B</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Australia"
                  placeholderTextColor={colors.textSecondary}
                  value={form.teamB}
                  onChangeText={(v) => updateField('teamB', v)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Venue</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Smart Stadium Arena"
              placeholderTextColor={colors.textSecondary}
              value={form.venue}
              onChangeText={(v) => updateField('venue', v)}
            />

            <Text style={styles.inputLabel}>Match Date (ISO)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="2026-08-15T18:00:00.000Z"
              placeholderTextColor={colors.textSecondary}
              value={form.matchDate}
              onChangeText={(v) => updateField('matchDate', v)}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              placeholder="Optional match description"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.success }]} />
              <Text style={styles.sectionTitle}>Pricing (₹)</Text>
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

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.warning }]} />
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
                Total seats: {Number(form.rows || 0) * Number(form.seatsPerRow || 0)} · General rows are
                auto-calculated from remaining rows.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Match & Seats</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
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
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  hintCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: typography.body.fontSize,
  },
});
