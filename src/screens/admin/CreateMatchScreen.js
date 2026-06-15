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
import { colors, commonStyles } from '../../constants/theme';

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
            navigation.replace('MatchDetail', { matchId: match.id }),
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
          <Text style={styles.sectionTitle}>Event Info</Text>
          <Text style={commonStyles.inputLabel}>Match Title</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="T20 Final - Season Opener"
            placeholderTextColor="#666"
            value={form.title}
            onChangeText={(v) => updateField('title', v)}
          />

          <Text style={commonStyles.inputLabel}>Team A</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="India"
            placeholderTextColor="#666"
            value={form.teamA}
            onChangeText={(v) => updateField('teamA', v)}
          />

          <Text style={commonStyles.inputLabel}>Team B</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="Australia"
            placeholderTextColor="#666"
            value={form.teamB}
            onChangeText={(v) => updateField('teamB', v)}
          />

          <Text style={commonStyles.inputLabel}>Venue</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="Smart Stadium Arena"
            placeholderTextColor="#666"
            value={form.venue}
            onChangeText={(v) => updateField('venue', v)}
          />

          <Text style={commonStyles.inputLabel}>Match Date (ISO)</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="2026-08-15T18:00:00.000Z"
            placeholderTextColor="#666"
            value={form.matchDate}
            onChangeText={(v) => updateField('matchDate', v)}
          />

          <Text style={commonStyles.inputLabel}>Description</Text>
          <TextInput
            style={[commonStyles.inputField, styles.textArea]}
            placeholder="Optional match description"
            placeholderTextColor="#666"
            multiline
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
          />

          <Text style={styles.sectionTitle}>Pricing (₹)</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={commonStyles.inputLabel}>VIP</Text>
              <TextInput
                style={commonStyles.inputField}
                keyboardType="numeric"
                value={form.vipPrice}
                onChangeText={(v) => updateField('vipPrice', v)}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={commonStyles.inputLabel}>Premium</Text>
              <TextInput
                style={commonStyles.inputField}
                keyboardType="numeric"
                value={form.premiumPrice}
                onChangeText={(v) => updateField('premiumPrice', v)}
              />
            </View>
          </View>

          <Text style={commonStyles.inputLabel}>General</Text>
          <TextInput
            style={commonStyles.inputField}
            keyboardType="numeric"
            value={form.generalPrice}
            onChangeText={(v) => updateField('generalPrice', v)}
          />

          <Text style={styles.sectionTitle}>Seat Layout</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={commonStyles.inputLabel}>Total Rows</Text>
              <TextInput
                style={commonStyles.inputField}
                keyboardType="numeric"
                value={form.rows}
                onChangeText={(v) => updateField('rows', v)}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={commonStyles.inputLabel}>Seats / Row</Text>
              <TextInput
                style={commonStyles.inputField}
                keyboardType="numeric"
                value={form.seatsPerRow}
                onChangeText={(v) => updateField('seatsPerRow', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={commonStyles.inputLabel}>VIP Rows</Text>
              <TextInput
                style={commonStyles.inputField}
                keyboardType="numeric"
                value={form.vipRows}
                onChangeText={(v) => updateField('vipRows', v)}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={commonStyles.inputLabel}>Premium Rows</Text>
              <TextInput
                style={commonStyles.inputField}
                keyboardType="numeric"
                value={form.premiumRows}
                onChangeText={(v) => updateField('premiumRows', v)}
              />
            </View>
          </View>

          <Text style={styles.hint}>
            Total seats: {Number(form.rows || 0) * Number(form.seatsPerRow || 0)} · General rows are
            auto-calculated from remaining rows.
          </Text>

          <TouchableOpacity
            style={commonStyles.primaryButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Create Match & Seats</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
});
