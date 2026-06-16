import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, typography, shadows, spacing } from '../constants/theme';

export default function GradientButton({ title, onPress, colors: gradientColors, style, textStyle, disabled, icon }) {
  const gradient = gradientColors || colors.gradientPurple;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.wrapper, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon ? (
          <Text style={styles.iconText}>{icon}</Text>
        ) : null}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.primary,
  },
  gradient: {
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconText: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});
