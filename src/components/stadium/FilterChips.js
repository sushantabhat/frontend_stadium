import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography } from '../../constants/theme';

export default function FilterChips({ filters, onRemove, onClearAll }) {
  if (!filters || filters.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Text style={styles.labelText}>Filters:</Text>
      </View>
      <View style={styles.chips}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={styles.chip}
            onPress={() => onRemove(filter.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{filter.label}</Text>
            <Text style={styles.chipRemove}>✕</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
        <Text style={styles.clearAll}>Remove all filters</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    marginRight: spacing.xs,
  },
  labelText: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  chipRemove: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  clearAll: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
