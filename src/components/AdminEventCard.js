import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography, glass } from '../constants/theme';

function getSportIcon(match) {
  const text = `${match.title || ''} ${match.teamA || ''} ${match.teamB || ''}`.toLowerCase();
  if (text.includes('basket') || text.includes('laker') || text.includes('warrior') || text.includes('nba')) return '🏀';
  if (text.includes('football') || text.includes('soccer') || text.includes('fc ') || text.includes('united')) return '⚽';
  if (text.includes('tennis')) return '🎾';
  return '🏏';
}

function getStatusConfig(match) {
  const stats = match.seatStats || {};
  const available = stats.available ?? 0;

  switch (match.status) {
    case 'live':
      return { label: 'LIVE', dot: true, color: glass.statusDangerText, bg: glass.statusDangerFill };
    case 'upcoming':
      if (available === 0 && (stats.total || 0) > 0) {
        return { label: 'Sold Out', dot: false, color: glass.brandPurple, bg: glass.brandPurpleSurface };
      }
      if (available > 0) {
        return { label: 'On Sale', dot: false, color: glass.statusSuccessText, bg: glass.statusSuccessFill };
      }
      return { label: 'Upcoming', dot: false, color: glass.statusWarningText, bg: glass.statusWarningFill };
    case 'completed':
      return { label: 'Completed', dot: false, color: glass.textMuted, bg: 'rgba(255,255,255,0.06)' };
    case 'cancelled':
      return { label: 'Cancelled', dot: false, color: glass.textMuted, bg: 'rgba(255,255,255,0.06)' };
    default:
      return { label: 'Upcoming', dot: false, color: glass.statusWarningText, bg: glass.statusWarningFill };
  }
}

export function computeEventRevenue(match) {
  const stats = match.seatStats || {};
  const pricing = match.pricing || {};
  const total = stats.total || match.totalSeats || 0;
  const booked = stats.booked || 0;
  if (total === 0 || booked === 0) return 0;

  const vipRatio = (stats.vip || 0) / total;
  const premiumRatio = (stats.premium || 0) / total;
  const bookedVip = Math.round(booked * vipRatio);
  const bookedPremium = Math.round(booked * premiumRatio);
  const bookedGeneral = Math.max(0, booked - bookedVip - bookedPremium);

  return (
    bookedVip * (pricing.vip || 0) +
    bookedPremium * (pricing.premium || 0) +
    bookedGeneral * (pricing.general || 0)
  );
}

export function getOccupancyStats(match) {
  const stats = match.seatStats || {};
  const total = stats.total || match.totalSeats || 0;
  const sold = stats.booked || 0;
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  return { total, sold, pct };
}

function formatEventDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AdminEventCard({ match, onManage, onEdit, onDelete }) {
  const status = getStatusConfig(match);
  const revenue = computeEventRevenue(match);
  const { total, sold, pct } = getOccupancyStats(match);
  const title = match.title || `${match.teamA} vs ${match.teamB}`;

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to cancel "${title}"? This cannot be undone.`,
      [
        { text: 'Keep Event', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.sportIconWrap}>
              <Text style={styles.sportIcon}>{getSportIcon(match)}</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.eventTitle} numberOfLines={1}>{title}</Text>
              {match.venue ? (
                <Text style={styles.eventVenue} numberOfLines={1}>📍 {match.venue}</Text>
              ) : null}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            {status.dot && <View style={styles.statusDot} />}
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.revenueValue}>₹{revenue.toLocaleString()}</Text>
        <Text style={styles.metaLine}>
          {formatEventDate(match.matchDate)}
          {total > 0 ? ` · ${total.toLocaleString()} capacity` : ''}
        </Text>

        <View style={styles.occupancyHeader}>
          <Text style={styles.occupancyLabel}>Occupancy</Text>
          <Text style={styles.occupancyStats}>
            {pct}% · {sold.toLocaleString()} sold
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onManage} activeOpacity={0.7}>
            <Text style={styles.actionText}>Manage</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.actionText, styles.actionDelete]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.card,
  },
  cardInner: {
    padding: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sportIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: glass.brandPurpleSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportIcon: { fontSize: 22 },
  cardHeaderText: { flex: 1 },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    marginBottom: 2,
  },
  eventVenue: {
    color: glass.textMuted,
    fontSize: typography.small.fontSize,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: glass.statusDangerText,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  revenueValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  metaLine: {
    color: glass.textMuted,
    fontSize: typography.small.fontSize,
    marginBottom: spacing.lg,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  occupancyLabel: {
    color: glass.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  occupancyStats: {
    color: glass.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: glass.occupancyTeal,
    borderRadius: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: glass.border,
    paddingTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: glass.border,
  },
  actionText: {
    color: glass.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  actionDelete: {
    color: glass.statusDangerText,
  },
});
