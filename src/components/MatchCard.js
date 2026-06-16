import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, typography, shadows } from '../constants/theme';

const TEAM_EMOJIS = { India: '🇮🇳', Australia: '🇦🇺', England: '🏴', Pakistan: '🇵🇰', SouthAfrica: '🇿🇦', NewZealand: '🇳🇿', SriLanka: '🇱🇰', Bangladesh: '🇧🇩', WestIndies: '🌴', Afghanistan: '🇦🇫' };

const TINT_THEMES = [
  ['#1a0533', '#0d1b3e', '#162040'],
  ['#0d2137', '#0a1628', '#111d35'],
  ['#1c1030', '#0e1a3a', '#141530'],
  ['#0a1e30', '#0d1432', '#161838'],
];

function getStatusConfig(status) {
  switch (status) {
    case 'live': return { label: 'LIVE', color: colors.danger, bg: colors.danger, pulse: true };
    case 'upcoming': return { label: 'UPCOMING', color: colors.accent, bg: colors.accent };
    case 'completed': return { label: 'FINAL', color: colors.textMuted, bg: colors.surfaceHighlight };
    case 'cancelled': return { label: 'CANCELLED', color: colors.danger, bg: colors.danger };
    default: return { label: 'UPCOMING', color: colors.accent, bg: colors.accent };
  }
}

export default function MatchCard({ match, onPress, variant = 'horizontal', tintIndex = 0 }) {
  const date = new Date(match.matchDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const time = date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: true });
  const statusConfig = getStatusConfig(match.status);
  const available = match.seatStats?.available ?? match.totalSeats ?? 0;
  const total = match.seatStats?.total ?? match.totalSeats ?? 0;
  const soldPct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const tint = TINT_THEMES[tintIndex % TINT_THEMES.length];

  if (variant === 'hero') {
    return (
      <TouchableOpacity style={styles.heroCard} onPress={onPress} activeOpacity={0.92}>
        <LinearGradient colors={tint} style={styles.heroInner}>
          {/* Overlapping live badge */}
          <View style={styles.heroTop}>
            <View style={styles.heroDateBlock}>
              <Text style={styles.heroDay}>{day}</Text>
              <Text style={styles.heroMonth}>{month}</Text>
            </View>
            <View style={[styles.liveBadge, statusConfig.pulse && styles.livePulse]}>
              {statusConfig.pulse && <View style={styles.liveDot} />}
              <Text style={styles.liveText}>{statusConfig.label}</Text>
            </View>
          </View>

          {/* Teams — asymmetric layout */}
          <View style={styles.heroTeamsRow}>
            <View style={styles.heroTeam}>
              <Text style={styles.heroTeamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
              <Text style={styles.heroTeamName}>{match.teamA}</Text>
            </View>
            <View style={styles.heroVsBadge}>
              <Text style={styles.heroVs}>VS</Text>
            </View>
            <View style={styles.heroTeam}>
              <Text style={styles.heroTeamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
              <Text style={styles.heroTeamName}>{match.teamB}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{match.title}</Text>
          <Text style={styles.heroVenue}>📍 {match.venue}</Text>

          {/* Bottom bar with progress */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroTime}>⏰ {time}</Text>
            {total > 0 && (
              <View style={styles.heroSoldWrap}>
                <View style={styles.heroSoldBar}>
                  <View style={[styles.heroSoldFill, { width: `${soldPct}%` }]} />
                </View>
                <Text style={styles.heroSoldText}>{soldPct}% sold</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Overlapping badge — breaks the card edge */}
        {available > 0 && available <= 20 && (
          <View style={styles.fewSeatsBadge}>
            <Text style={styles.fewSeatsText}>🔥 Only {available} left!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Horizontal variant
  return (
    <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.92}>
      <LinearGradient colors={tint} style={styles.hCardInner}>
        {/* Date block — large, prominent */}
        <View style={styles.hDateBlock}>
          <Text style={styles.hDay}>{day}</Text>
          <Text style={styles.hMonth}>{month}</Text>
          <Text style={styles.hTime}>{time}</Text>
        </View>

        {/* Content */}
        <View style={styles.hContent}>
          <View style={styles.hTop}>
            <View style={[styles.hStatusDot, { backgroundColor: statusConfig.bg }]} />
            <Text style={[styles.hStatus, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.hTeams}>{match.teamA} vs {match.teamB}</Text>
          <Text style={styles.hTitle} numberOfLines={1}>{match.title}</Text>
          <Text style={styles.hVenue} numberOfLines={1}>📍 {match.venue}</Text>
        </View>

        {/* Availability pill — right aligned */}
        <View style={styles.hAvailWrap}>
          {available > 0 ? (
            <>
              <Text style={styles.hAvailCount}>{available}</Text>
              <Text style={styles.hAvailLabel}>seats{'\n'}left</Text>
            </>
          ) : (
            <Text style={styles.hSoldOut}>SOLD{'\n'}OUT</Text>
          )}
        </View>
      </LinearGradient>

      {/* Overlapping few-seats badge */}
      {available > 0 && available <= 15 && (
        <View style={styles.hFewBadge}>
          <Text style={styles.hFewText}>🔥</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ========= HERO =========
  heroCard: {
    borderRadius: radii.xxl,
    overflow: 'visible',
    ...shadows.lg,
  },
  heroInner: {
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  heroDateBlock: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minWidth: 64,
  },
  heroDay: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  heroMonth: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.danger}CC`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  livePulse: {
    backgroundColor: `${colors.danger}DD`,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // Teams — asymmetric
  heroTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  heroTeam: {
    alignItems: 'center',
    flex: 1,
  },
  heroTeamEmoji: {
    fontSize: 42,
    marginBottom: spacing.sm,
  },
  heroTeamName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroVsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVs: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#FFF',
    fontSize: typography.h2.fontSize,
    fontWeight: '900',
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  heroVenue: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.xl,
  },

  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '600',
  },
  heroSoldWrap: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  heroSoldBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  heroSoldFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  heroSoldText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '600',
  },

  // Overlapping badge
  fewSeatsBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.xl,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    ...shadows.accent,
  },
  fewSeatsText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },

  // ========= HORIZONTAL =========
  hCard: {
    borderRadius: radii.xl,
    overflow: 'visible',
    ...shadows.md,
  },
  hCardInner: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  hDateBlock: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.lg,
  },
  hDay: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  hMonth: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  hTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  hContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  hTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  hStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hStatus: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hTeams: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
    marginBottom: 2,
  },
  hTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.small.fontSize,
    marginBottom: 2,
  },
  hVenue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: typography.tiny.fontSize,
  },

  hAvailWrap: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,200,83,0.15)',
  },
  hAvailCount: {
    color: colors.successLight,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  hAvailLabel: {
    color: colors.success,
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  hSoldOut: {
    color: colors.dangerLight,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  // Overlapping fire badge
  hFewBadge: {
    position: 'absolute',
    top: -6,
    right: spacing.md,
    backgroundColor: colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.accent,
  },
  hFewText: {
    fontSize: 12,
  },
});
