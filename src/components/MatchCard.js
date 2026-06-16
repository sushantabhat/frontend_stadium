import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, typography, shadows } from '../constants/theme';

const TEAM_EMOJIS = { India: '🇮🇳', Australia: '🇦🇺', England: '🏴', Pakistan: '🇵🇰', SouthAfrica: '🇿🇦', NewZealand: '🇳🇿', SriLanka: '🇱🇰', Bangladesh: '🇧🇩', WestIndies: '🌴', Afghanistan: '🇦🇫' };

function getStatusConfig(status) {
  switch (status) {
    case 'live': return { label: 'LIVE', color: colors.danger, bg: colors.dangerSurface };
    case 'upcoming': return { label: 'UPCOMING', color: colors.accent, bg: colors.accentSurface };
    case 'completed': return { label: 'COMPLETED', color: colors.textMuted, bg: colors.surfaceElevated };
    case 'cancelled': return { label: 'CANCELLED', color: colors.danger, bg: colors.dangerSurface };
    default: return { label: 'UPCOMING', color: colors.accent, bg: colors.accentSurface };
  }
}

export default function MatchCard({ match, onPress, variant = 'horizontal' }) {
  const date = new Date(match.matchDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const time = date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: true });
  const statusConfig = getStatusConfig(match.status);
  const available = match.seatStats?.available ?? match.totalSeats ?? 0;

  if (variant === 'hero') {
    return (
      <TouchableOpacity style={styles.heroCard} onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={[`${colors.primaryDark}CC`, `${colors.primary}99`, `${colors.primaryDark}66`]}
          style={styles.heroGradient}
        >
          <View style={styles.heroTop}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              {match.status === 'live' && <View style={styles.liveDot} />}
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{day}</Text>
              <Text style={styles.dateMonth}>{month}</Text>
            </View>
          </View>

          <View style={styles.heroTeams}>
            <Text style={styles.teamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <Text style={styles.teamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
          </View>

          <Text style={styles.heroTitle}>{match.title}</Text>
          <Text style={styles.heroVenue}>📍 {match.venue}</Text>

          <View style={styles.heroBottom}>
            <Text style={styles.heroTime}>⏰ {time}</Text>
            {available > 0 && (
              <View style={styles.seatsPill}>
                <View style={styles.seatsDot} />
                <Text style={styles.seatsText}>{available} seats left</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[`${colors.primaryDark}AA`, `${colors.primary}66`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hCardGradient}
      >
        <View style={styles.hCardLeft}>
          <View style={styles.hDateBadge}>
            <Text style={styles.hDateDay}>{day}</Text>
            <Text style={styles.hDateMonth}>{month}</Text>
          </View>
        </View>

        <View style={styles.hCardCenter}>
          <View style={[styles.statusBadgeSmall, { backgroundColor: statusConfig.bg }]}>
            {match.status === 'live' && <View style={styles.liveDotSmall} />}
            <Text style={[styles.statusTextSmall, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.hTeams}>{match.teamA} vs {match.teamB}</Text>
          <Text style={styles.hVenue}>📍 {match.venue}</Text>
          <Text style={styles.hTime}>{time}</Text>
        </View>

        <View style={styles.hCardRight}>
          {available > 0 ? (
            <View style={styles.hSeatsBadge}>
              <Text style={styles.hSeatsCount}>{available}</Text>
              <Text style={styles.hSeatsLabel}>seats</Text>
            </View>
          ) : (
            <Text style={styles.hSoldOut}>FULL</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Hero variant
  heroCard: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroGradient: {
    padding: spacing.xxl,
    minHeight: 280,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateDay: {
    color: '#FFF',
    fontSize: typography.h2.fontSize,
    fontWeight: '900',
  },
  dateMonth: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginVertical: spacing.lg,
  },
  teamEmoji: {
    fontSize: 44,
  },
  vsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: '#FFF',
    fontSize: typography.tiny.fontSize,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: typography.h2.fontSize,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  heroVenue: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.lg,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTime: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '600',
  },
  seatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,200,83,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  seatsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  seatsText: {
    color: colors.successLight,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },

  // Horizontal variant
  horizontalCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  hCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  hCardLeft: {},
  hDateBadge: {
    width: 52,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hDateDay: {
    color: '#FFF',
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
  },
  hDateMonth: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hCardCenter: {
    flex: 1,
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  statusTextSmall: {
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
  hVenue: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.tiny.fontSize,
    marginBottom: 2,
  },
  hTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.tiny.fontSize,
  },
  hCardRight: {
    alignItems: 'center',
  },
  hSeatsBadge: {
    backgroundColor: 'rgba(0,200,83,0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  hSeatsCount: {
    color: colors.successLight,
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
  },
  hSeatsLabel: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '600',
  },
  hSoldOut: {
    color: colors.dangerLight,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
