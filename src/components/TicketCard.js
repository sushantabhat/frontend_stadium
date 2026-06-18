import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, typography } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

const CATEGORY_THEMES = {
  VIP: { gradient: ['#FFD700', '#E6C200'], accent: '#FFD700', label: 'VIP' },
  CATEGORY1: { gradient: ['#FFD700', '#E6C200'], accent: '#FFD700', label: 'CATEGORY 1' },
  CATEGORY2: { gradient: ['#FF6B6B', '#E53935'], accent: '#FF6B6B', label: 'CATEGORY 2' },
  CATEGORY3: { gradient: ['#6C5CE7', '#4834D4'], accent: '#A29BFE', label: 'CATEGORY 3' },
  CATEGORY4: { gradient: ['#EF5350', '#C62828'], accent: '#EF5350', label: 'CATEGORY 4' },
  SUPPORTERS: { gradient: ['#2E7D32', '#1B5E20'], accent: '#81C784', label: 'SUPPORTERS' },
  PREMIUM: { gradient: ['#6C5CE7', '#4834D4'], accent: '#A29BFE', label: 'PREMIUM' },
  GENERAL: { gradient: ['#374151', '#1F2937'], accent: '#9CA3AF', label: 'GENERAL' },
};

function PerforatedEdge() {
  const dotCount = 28;
  const dotSize = 8;
  const gap = (CARD_WIDTH - spacing.xxl * 2) / dotCount;

  return (
    <View style={styles.perforation}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.perfDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              marginLeft: i === 0 ? 0 : gap - dotSize,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function TicketCard({ ticket, showQR = true }) {
  const matchTitle = ticket.match?.title || ticket.matchTitle || 'Match';
  const teamA = ticket.match?.teamA || ticket.teamA || '';
  const teamB = ticket.match?.teamB || ticket.teamB || '';
  const venue = ticket.match?.venue || ticket.venue || '';
  const seatLabel = ticket.seat?.seatLabel || ticket.seatLabel || 'N/A';
  const category = (ticket.seat?.category || ticket.category || 'general').toUpperCase();
  const ticketCode = ticket.ticketCode || 'N/A';
  const matchDate = ticket.match?.matchDate || ticket.matchDate;
  const status = (ticket.status || 'VALID').toUpperCase();

  const catTheme = CATEGORY_THEMES[category] || CATEGORY_THEMES.GENERAL;


  let dateStr = '';
  let timeStr = '';
  if (matchDate) {
    const d = new Date(matchDate);
    dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <View style={styles.wrapper}>
      {/* Top section — event info */}
      <LinearGradient
        colors={catTheme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topHalf}
      >
        {/* Background texture — subtle diagonal lines */}
        <View style={styles.texture} />

        {/* Header row */}
        <View style={styles.topRow}>
          <Text style={styles.brand}>SMART STADIUM</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{status}</Text>
          </View>
        </View>

        {/* Match info */}
        <Text style={styles.matchTitle} numberOfLines={1}>{matchTitle}</Text>
        <View style={styles.teamsRow}>
          <Text style={styles.team}>{teamA}</Text>
          <Text style={styles.vs}>VS</Text>
          <Text style={styles.team}>{teamB}</Text>
        </View>

        {/* Category badge */}
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{catTheme.label}</Text>
        </View>
      </LinearGradient>

      {/* Perforated edge */}
      <PerforatedEdge />

      {/* Bottom section — details */}
      <View style={styles.bottomHalf}>
        {/* Details grid */}
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>{dateStr || 'TBD'}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>TIME</Text>
            <Text style={styles.detailValue}>{timeStr || 'TBD'}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>SEAT</Text>
            <Text style={styles.detailValue}>{seatLabel}</Text>
          </View>
        </View>

        {/* Venue */}
        <View style={styles.venueRow}>
          <Text style={styles.venueIcon}>📍</Text>
          <Text style={styles.venueText} numberOfLines={1}>{venue}</Text>
        </View>

        {/* Ticket code — monospace, prominent */}
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>TICKET CODE</Text>
          <Text style={styles.codeValue}>{ticketCode}</Text>
        </View>

        {/* Entry instruction */}
        <View style={styles.entryRow}>
          <Text style={styles.entryIcon}>📱</Text>
          <Text style={styles.entryText}>Show this at the entry gate</Text>
        </View>
      </View>

      {/* Side notch cutouts */}
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    position: 'relative',
  },

  // Top half
  topHalf: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.xxl,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brand: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  statusPillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  matchTitle: {
    color: '#FFF',
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  team: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  vs: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },

  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  catBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Perforated edge
  perforation: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    marginHorizontal: spacing.xxl - 4,
  },
  perfDot: {
    backgroundColor: colors.background,
  },

  // Bottom half
  bottomHalf: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    padding: spacing.xxl,
    paddingTop: spacing.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detail: { flex: 1 },
  detailDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },

  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
  },
  venueIcon: { fontSize: 13 },
  venueText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    flex: 1,
  },

  codeBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  codeValue: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
    fontFamily: 'Courier',
    letterSpacing: 3,
  },

  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.primary}15`,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
  },
  entryIcon: { fontSize: 13 },
  entryText: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },

  // Notch cutouts
  notch: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    top: '50%',
    marginTop: -12,
  },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },
});
