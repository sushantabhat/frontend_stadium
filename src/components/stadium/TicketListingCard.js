import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography, CATEGORY_COLORS } from '../../constants/theme';

export default function TicketListingCard({ section, seats, onSelect, isSelected }) {
  const catInfo = CATEGORY_COLORS[section.category] || { accent: '#888', label: section.category };
  const availableCount = section.availableSeats || 0;
  const lowestPrice = section.pricePerTicket || 0;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(section)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionId}>{section.sectionId}</Text>
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionLabel}>{section.label}</Text>
          <Text style={styles.sectionCategory}>
            {catInfo.label} · {availableCount} available
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rows</Text>
          <Text style={styles.detailValue}>
            {Array.isArray(section.rows) ? section.rows.join(', ') : '—'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Seats</Text>
          <Text style={styles.detailValue}>{section.totalSeats}</Text>
        </View>
        <View style={[styles.detailItem, styles.priceItem]}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={[styles.priceValue, { color: catInfo.accent }]}>
            {lowestPrice > 0 ? `€${lowestPrice}` : '—'}
          </Text>
        </View>
      </View>

      {availableCount > 0 && (
        <TouchableOpacity
          style={[styles.buyBtn, { backgroundColor: catInfo.accent }]}
          onPress={() => onSelect(section)}
          activeOpacity={0.8}
        >
          <Text style={styles.buyBtnText}>SELECT</Text>
        </TouchableOpacity>
      )}

      {availableCount === 0 && (
        <View style={styles.soldOutBadge}>
          <Text style={styles.soldOutText}>SOLD OUT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionBadge: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}35`,
  },
  sectionId: {
    color: colors.primaryLight,
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  sectionCategory: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    color: colors.textSecondary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '600',
  },
  priceItem: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
  },
  buyBtn: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#000',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
  soldOutBadge: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
  },
  soldOutText: {
    color: colors.textMuted,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
