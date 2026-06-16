import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

export default function SectionHeader({ title, subtitle, actionText, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  left: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  action: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
});
