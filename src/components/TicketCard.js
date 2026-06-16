import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, typography, shadows } from '../constants/theme';

export default function TicketCard({ ticket, showQR = true }) {
  const matchTitle = ticket.match?.title || ticket.matchTitle || 'Match';
  const teamA = ticket.match?.teamA || ticket.teamA || '';
  const teamB = ticket.match?.teamB || ticket.teamB || '';
  const venue = ticket.match?.venue || ticket.venue || '';
  const seatLabel = ticket.seat?.seatLabel || ticket.seatLabel || 'N/A';
  const category = (ticket.seat?.category || ticket.category || 'general').toUpperCase();
  const ticketCode = ticket.ticketCode || 'N/A';
  const matchDate = ticket.match?.matchDate || ticket.matchDate;

  let dateStr = '';
  let timeStr = '';
  if (matchDate) {
    const d = new Date(matchDate);
    dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Top section */}
        <View style={styles.topSection}>
          <Text style={styles.eventLabel}>SMART STADIUM</Text>
          <View style={[styles.categoryBadge, category === 'VIP' && styles.vipBadge]}>
            <Text style={[styles.categoryText, category === 'VIP' && styles.vipText]}>{category}</Text>
          </View>
        </View>

        {/* Match info */}
        <Text style={styles.matchTitle}>{matchTitle}</Text>
        <View style={styles.teamsRow}>
          <Text style={styles.teamName}>{teamA}</Text>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.teamName}>{teamB}</Text>
        </View>

        <View style={styles.dividerDashed} />

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>{dateStr || 'TBD'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TIME</Text>
            <Text style={styles.detailValue}>{timeStr || 'TBD'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SEAT</Text>
            <Text style={styles.detailValue}>{seatLabel}</Text>
          </View>
        </View>

        <View style={styles.dividerDashed} />

        {/* Venue */}
        <View style={styles.venueRow}>
          <Text style={styles.venueIcon}>📍</Text>
          <Text style={styles.venueText}>{venue}</Text>
        </View>

        {/* Ticket code */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>TICKET CODE</Text>
          <Text style={styles.codeValue}>{ticketCode}</Text>
        </View>

        {/* Entry message */}
        <View style={styles.entryBanner}>
          <Text style={styles.entryIcon}>📱</Text>
          <Text style={styles.entryText}>Show this at the entry gate</Text>
        </View>
      </LinearGradient>

      {/* Notch cutouts for ticket feel */}
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    ...shadows.lg,
  },
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

  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  eventLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  vipBadge: {
    backgroundColor: `${colors.accent}40`,
  },
  categoryText: {
    color: '#FFF',
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
  vipText: {
    color: colors.accent,
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
  teamName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  vsText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 2,
  },

  dividerDashed: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.lg,
    marginHorizontal: -spacing.xxl,
  },

  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  detailValue: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },

  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  venueIcon: { fontSize: 14 },
  venueText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.caption.fontSize,
    flex: 1,
  },

  codeSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  codeValue: {
    color: '#FFF',
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
    fontFamily: 'Courier',
    letterSpacing: 2,
  },

  entryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  entryIcon: { fontSize: 14 },
  entryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
});
