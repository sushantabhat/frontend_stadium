import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const date = match.matchDate ? new Date(match.matchDate) : new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const time = date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: true });
  const statusConfig = getStatusConfig(match.status);
  const available = match.seatStats?.available ?? match.totalSeats ?? 0;
  const total = match.seatStats?.total ?? match.totalSeats ?? 0;
  const soldPct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const tint = TINT_THEMES[tintIndex % TINT_THEMES.length];

  if (variant === 'hero') {
    const hasBanner = Boolean(match.imageUrl);
    return (
      <TouchableOpacity style={styles.heroCard} onPress={onPress} activeOpacity={0.92}>
        <View style={styles.heroInner}>
          {hasBanner && (
            <Image source={{ uri: match.imageUrl }} style={styles.heroBanner} resizeMode="cover" />
          )}
          <LinearGradient colors={hasBanner ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)'] : tint} style={[styles.heroOverlay, !hasBanner && { backgroundColor: 'transparent' }]}>
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

            {/* Teams — with logos if available */}
            <View style={styles.heroTeamsRow}>
              <View style={styles.heroTeam}>
                {match.teamALogo ? (
                  <Image source={{ uri: match.teamALogo }} style={styles.heroTeamLogo} resizeMode="contain" />
                ) : (
                  <Text style={styles.heroTeamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
                )}
                <Text style={styles.heroTeamName}>{match.teamA}</Text>
              </View>
              <View style={styles.heroVsBadge}>
                <Text style={styles.heroVs}>VS</Text>
              </View>
              <View style={styles.heroTeam}>
                {match.teamBLogo ? (
                  <Image source={{ uri: match.teamBLogo }} style={styles.heroTeamLogo} resizeMode="contain" />
                ) : (
                  <Text style={styles.heroTeamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
                )}
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
        </View>

        {/* Overlapping badge — breaks the card edge */}
        {available > 0 && available <= 20 && (
          <View style={styles.fewSeatsBadge}>
            <Text style={styles.fewSeatsText}>🔥 Only {available} left!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Horizontal variant — full-bleed image card
  const hasThumb = Boolean(match.imageUrl);
  const pricing = match.pricing || {};
  const lowestPrice = Math.min(pricing.vip || Infinity, pricing.premium || Infinity, pricing.general || Infinity);

  return (
    <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.hCardInner}>
        {/* Full background image or gradient fallback */}
        {hasThumb ? (
          <Image source={{ uri: match.imageUrl }} style={styles.hBgImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={tint} style={styles.hBgImage} />
        )}
        <LinearGradient
          colors={hasThumb
            ? ['rgba(7,8,11,0.3)', 'rgba(7,8,11,0.92)']
            : ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
          style={styles.hOverlay}
          locations={hasThumb ? [0, 0.6] : undefined}
        >
          {/* Top row: status + availability */}
          <View style={styles.hTopRow}>
            <View style={styles.hTopLeft}>
              <View style={[styles.hStatusDot, { backgroundColor: statusConfig.bg }]} />
              <Text style={[styles.hStatus, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
            {available === 0 && total > 0 ? (
              <View style={[styles.hAvailBadge, { backgroundColor: 'rgba(255,23,68,0.25)' }]}>
                <Text style={[styles.hAvailText, { color: '#FF5252' }]}>SOLD OUT</Text>
              </View>
            ) : available > 0 && available <= 50 ? (
              <View style={[styles.hAvailBadge, { backgroundColor: 'rgba(255,179,0,0.2)' }]}>
                <Text style={[styles.hAvailText, { color: '#FFB300' }]}>Only {available} left</Text>
              </View>
            ) : available > 0 ? (
              <View style={[styles.hAvailBadge, { backgroundColor: 'rgba(0,212,170,0.2)' }]}>
                <Text style={[styles.hAvailText, { color: '#00D4AA' }]}>Seats Available</Text>
              </View>
            ) : null}
          </View>

          {/* Middle: teams + title */}
          <View style={styles.hMiddle}>
            <View style={styles.hTeamsRow}>
              {match.teamALogo ? (
                <Image source={{ uri: match.teamALogo }} style={styles.hTeamLogo} resizeMode="contain" />
              ) : (
                <Text style={styles.hTeamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
              )}
              <Text style={styles.hTeams}>{match.teamA} vs {match.teamB}</Text>
              {match.teamBLogo ? (
                <Image source={{ uri: match.teamBLogo }} style={styles.hTeamLogo} resizeMode="contain" />
              ) : (
                <Text style={styles.hTeamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
              )}
            </View>
            <Text style={styles.hTitle} numberOfLines={1}>{match.title}</Text>
          </View>

          {/* Bottom row: venue + date + price */}
          <View style={styles.hBottomRow}>
            <Text style={styles.hVenue} numberOfLines={1}>📍 {match.venue}</Text>
            <View style={styles.hBottomRight}>
              {match.matchDate && (
                <Text style={styles.hDate}>
                  {new Date(match.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              )}
              {lowestPrice !== Infinity && lowestPrice > 0 && (
                <View style={styles.hPricePill}>
                  <Text style={styles.hPriceText}>Rs.{lowestPrice.toLocaleString()}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
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
    position: 'relative',
  },
  heroBanner: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderRadius: radii.xxl,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.xl,
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
  heroTeamLogo: {
    width: 56,
    height: 56,
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

  // ========= HORIZONTAL (full-bleed image) =========
  hCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  hCardInner: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  hBgImage: {
    width: '100%',
    height: 150,
    borderRadius: radii.xl,
  },
  hOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  hTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  hAvailBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  hAvailText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hMiddle: {
    alignItems: 'flex-start',
    gap: 2,
  },
  hTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  hTeamEmoji: {
    fontSize: 18,
  },
  hTeamLogo: {
    width: 24,
    height: 24,
  },
  hTeams: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
  },
  hTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
  hBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hVenue: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.tiny.fontSize,
    flex: 1,
  },
  hBottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },
  hPricePill: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  hPriceText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
  },
});
