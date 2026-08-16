import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

export default function SettingsScreen({ navigation }) {
  const { backgroundMode, setBackgroundMode, modes } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPEARANCE</Text>
          <Text style={styles.sectionDesc}>Choose your preferred background color.</Text>
          {Object.entries(modes).map(([key, mode]) => (
            <TouchableOpacity
              key={key}
              style={[styles.optionCard, backgroundMode === key && styles.optionCardActive]}
              onPress={() => setBackgroundMode(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorSwatch, { backgroundColor: mode.background }]} />
              <Text style={[styles.optionLabel, backgroundMode === key && styles.optionLabelActive]}>
                {mode.label}
              </Text>
              {backgroundMode === key && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.huge },
  section: { marginBottom: spacing.xxl },
  sectionLabel: {
    color: glass.textMuted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: spacing.sm,
  },
  sectionDesc: {
    color: glass.textSecondary, fontSize: typography.small.fontSize,
    marginBottom: spacing.lg, lineHeight: 18,
  },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: glass.card, borderRadius: radii.xl,
    borderWidth: 1, borderColor: glass.border,
    padding: spacing.xl, marginBottom: spacing.md,
    gap: spacing.lg,
  },
  optionCardActive: {
    borderColor: glass.brandPurple,
    backgroundColor: `${glass.brandPurple}12`,
  },
  colorSwatch: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1, borderColor: glass.border,
  },
  optionLabel: {
    flex: 1, color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize, fontWeight: '600',
  },
  optionLabelActive: { color: glass.brandPurple, fontWeight: '700' },
  checkMark: { color: glass.brandPurple, fontSize: 16, fontWeight: '800' },
});
