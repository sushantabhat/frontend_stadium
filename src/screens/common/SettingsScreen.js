import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme, useColors } from '../../context/ThemeContext';
import { spacing, radii, typography } from '../../constants/theme';

export default function SettingsScreen({ navigation }) {
  const { backgroundMode, setBackgroundMode, modes } = useTheme();
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Choose your preferred background color.</Text>
          {Object.entries(modes).map(([key, mode]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                backgroundMode === key && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
              ]}
              onPress={() => setBackgroundMode(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorSwatch, { backgroundColor: mode.background, borderColor: colors.borderLight }]} />
              <Text style={[
                styles.optionLabel,
                { color: colors.textPrimary },
                backgroundMode === key && { color: colors.primary, fontWeight: '700' },
              ]}>
                {mode.label}
              </Text>
              {backgroundMode === key && <Text style={[styles.checkMark, { color: colors.primary }]}>✓</Text>}
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
    fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: spacing.sm,
  },
  sectionDesc: {
    fontSize: typography.small.fontSize,
    marginBottom: spacing.lg, lineHeight: 18,
  },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.xl, marginBottom: spacing.md,
    gap: spacing.lg,
  },
  colorSwatch: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1,
  },
  optionLabel: {
    flex: 1,
    fontSize: typography.captionMedium.fontSize, fontWeight: '600',
  },
  checkMark: { fontSize: 16, fontWeight: '800' },
});