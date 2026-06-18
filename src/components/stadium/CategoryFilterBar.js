import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography, CATEGORY_COLORS } from '../../constants/theme';

export default function CategoryFilterBar({ sections, activeFilter, onFilterChange }) {
  const categoryCounts = {};
  (sections || []).forEach((section) => {
    const cat = section.category;
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { count: 0, available: 0 };
    }
    categoryCounts[cat].count += 1;
    categoryCounts[cat].available += section.availableSeats || 0;
  });

  const categories = Object.keys(categoryCounts).sort();

  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {categories.map((cat) => {
          const info = CATEGORY_COLORS[cat] || { accent: '#888', label: cat };
          const isActive = activeFilter === cat;
          const counts = categoryCounts[cat];

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                isActive && {
                  backgroundColor: info.accent,
                  borderColor: info.accent,
                },
              ]}
              onPress={() => onFilterChange(isActive ? null : cat)}
              activeOpacity={0.7}
            >
              <View style={[styles.dot, { backgroundColor: info.accent }]} />
              <Text
                style={[
                  styles.chipText,
                  isActive && { color: '#000' },
                ]}
              >
                {info.label}
              </Text>
              <Text
                style={[
                  styles.chipCount,
                  isActive && { color: '#000', opacity: 0.7 },
                ]}
              >
                ({counts.available})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  chipCount: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },
});
