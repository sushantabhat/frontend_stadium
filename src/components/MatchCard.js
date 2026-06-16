import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../constants/theme';
import { formatMatchDate, getStatusColor } from '../utils/date';

export default function MatchCard({ match, onPress }) {
  const available = match.seatStats?.available ?? 0;
  const total = match.seatStats?.total ?? match.totalSeats ?? 0;
  const occupancy = total > 0 ? ((total - available) / total) * 100 : 0;
  const lowestPrice = Math.min(match.pricing?.general || 0, match.pricing?.premium || 0, match.pricing?.vip || 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(match.status) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
          {match.status.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.teams}>
        {match.teamA} <Text style={styles.vsText}>vs</Text> {match.teamB}
      </Text>
      <Text style={styles.title}>{match.title}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoChip}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText} numberOfLines={1}>{match.venue}</Text>
        </View>
        <View style={styles.infoChip}>
          <Text style={styles.infoIcon}>🗓</Text>
          <Text style={styles.infoText}>{formatMatchDate(match.matchDate)}</Text>
        </View>
      </View>

      <View style={styles.occupancySection}>
        <View style={styles.occupancyHeader}>
          <Text style={styles.occupancyLabel}>Occupancy</Text>
          <Text style={styles.occupancyPercent}>{occupancy.toFixed(0)}%</Text>
        </View>
        <View style={styles.occupancyBarBg}>
          <View
            style={[
              styles.occupancyBarFill,
              {
                width: `${Math.min(occupancy, 100)}%`,
                backgroundColor: occupancy > 80 ? colors.danger : occupancy > 50 ? colors.warning : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.seatsInfo}>
          <Text style={styles.seatsAvailable}>{available}</Text>
          <Text style={styles.seatsLabel}>seats left</Text>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>₹{lowestPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: typography.tiny.fontWeight,
    letterSpacing: 1,
  },
  teams: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    marginBottom: spacing.xxs,
  },
  vsText: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  title: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    gap: spacing.xs + 2,
    flex: 1,
  },
  infoIcon: {
    fontSize: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '500',
    flex: 1,
  },
  occupancySection: {
    marginBottom: spacing.lg,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  occupancyLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },
  occupancyPercent: {
    color: colors.textSecondary,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  occupancyBarBg: {
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  seatsAvailable: {
    color: colors.success,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
  },
  seatsLabel: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    fontWeight: '500',
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '500',
  },
  priceValue: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
  },
});
