import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

export default function EmptyState({ icon, title, description, actionText, onAction }) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      {title && <Text style={styles.title}>{title}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  icon: { fontSize: 48, marginBottom: spacing.lg },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    lineHeight: 20,
  },
});
