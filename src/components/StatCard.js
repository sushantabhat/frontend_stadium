import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../constants/theme';

export default function StatCard({ icon, label, value, color, subtitle, large }) {
  const accentColor = color || colors.primary;

  return (
    <View style={[styles.card, large && styles.cardLarge]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}20` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, large && styles.valueLarge, { color: accentColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  cardLarge: {
    padding: spacing.xl,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 20 },
  value: {
    fontSize: typography.h2.fontSize,
    fontWeight: '900',
    marginBottom: spacing.xxs,
  },
  valueLarge: {
    fontSize: 32,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
});
