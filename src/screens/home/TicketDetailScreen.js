import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';
import QRCode from 'react-native-qrcode-svg';
import ScreenHeader from '../../components/ScreenHeader';
import { formatInNepal, formatTimeInNepal } from '../../utils/date';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

const CATEGORY_THEMES = {
  platinum: { gradient: ['#E8E8E8', '#D0D0D0'], label: 'PLATINUM' },
  gold: { gradient: ['#FFD700', '#E6A800'], label: 'GOLD' },
  silver: { gradient: ['#A8A8A8', '#888888'], label: 'SILVER' },
  bronze: { gradient: ['#CD7F32', '#A0652A'], label: 'BRONZE' },
  general: { gradient: ['#5B9BD5', '#4A7FBA'], label: 'GENERAL' },
  supporters: { gradient: ['#2E7D32', '#1B5E20'], label: 'SUPPORTERS' },
  premium: { gradient: [colors.primary, '#5A4BD1'], label: 'PREMIUM' },
  category1: { gradient: ['#FFD700', '#E6A800'], label: 'CATEGORY 1' },
  category2: { gradient: ['#FF6B6B', '#E53935'], label: 'CATEGORY 2' },
  category3: { gradient: ['#6C5CE7', '#4834D4'], label: 'CATEGORY 3' },
  category4: { gradient: ['#EF5350', '#C62828'], label: 'CATEGORY 4' },
};

export default function TicketDetailScreen({ route, navigation }) {
  useKeepAwake();
  const { ticket } = route.params;

  const category = (ticket.seat?.category || 'general').toLowerCase();
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.general;
  const matchDate = ticket.match?.matchDate ? new Date(ticket.match.matchDate) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Ticket" onBack={() => navigation.goBack()} />

      <View style={styles.cardWrap}>
        <LinearGradient colors={theme.gradient} style={styles.accentStripe} />
        <LinearGradient
          colors={[`${colors.gradientStart}F0`, `${colors.gradientEnd}F0`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <Text style={styles.brandText}>SMART STADIUM</Text>
            <View style={[styles.catBadge, { backgroundColor: `${theme.gradient[0]}30` }]}>
              <Text style={[styles.catText, { color: theme.gradient[0] }]}>{theme.label}</Text>
            </View>
          </View>

          <Text style={styles.matchTitle} numberOfLines={2}>{ticket.match?.title}</Text>

          <View style={styles.teamsRow}>
            <Text style={styles.teamText}>{ticket.match?.teamA || 'TBA'}</Text>
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <Text style={styles.teamText}>{ticket.match?.teamB || 'TBA'}</Text>
          </View>

          {matchDate && (
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>
                {formatInNepal(matchDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text style={styles.dateText}>
                {formatTimeInNepal(matchDate, { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.detailsGrid}>
            {[
              { label: 'SEAT', value: ticket.seat?.seatLabel || 'N/A' },
              ticket.seat?.gate ? { label: 'GATE', value: ticket.seat.gate } : null,
              { label: 'PRICE', value: `Rs.${ticket.seat?.price || '—'}` },
            ]
              .filter(Boolean)
              .map((d, i, arr) => (
                <View key={d.label} style={[styles.detailCell, i === arr.length - 1 && styles.detailCellLast]}>
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={styles.detailValue}>{d.value}</Text>
                </View>
              ))}
          </View>

          <View style={styles.venueRow}>
            <Text style={styles.venueText} numberOfLines={1}>{ticket.match?.venue || '—'}</Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrBox}>
              <QRCode value={ticket.ticketCode} size={200} color="#FFFFFF" backgroundColor="transparent" level="H" />
              <View style={[styles.qrCorner, styles.qrTL]} />
              <View style={[styles.qrCorner, styles.qrTR]} />
              <View style={[styles.qrCorner, styles.qrBL]} />
              <View style={[styles.qrCorner, styles.qrBR]} />
            </View>
            <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
            <Text style={styles.qrHint}>Show this QR at the entry gate</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: 'rgba(0,200,83,0.15)' }]}>
            <Text style={[styles.statusText, { color: '#69F0AE' }]}>VALID TICKET</Text>
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.screenBright}>Screen will stay bright for scanning</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  cardWrap: {
    flex: 1,
    marginHorizontal: spacing.xl,
    position: 'relative',
  },
  accentStripe: {
    height: 5,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    padding: spacing.xxl,
    ...shadows.lg,
  },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  brandText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  catBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  catText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  matchTitle: { color: '#FFF', fontSize: typography.h2.fontSize, fontWeight: '800', marginBottom: spacing.md },

  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  teamText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.bodyMedium.fontSize, fontWeight: '600' },
  vsBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  vsText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },

  dateRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.lg },
  dateText: { color: 'rgba(255,255,255,0.6)', fontSize: typography.captionMedium.fontSize, fontWeight: '500' },

  divider: { marginVertical: spacing.md, marginHorizontal: -spacing.xxl },
  dividerLine: { height: 0, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' },

  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  detailCell: { flex: 1 },
  detailCellLast: { alignItems: 'flex-end' },
  detailLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  detailValue: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  venueRow: { marginBottom: spacing.sm },
  venueText: { color: 'rgba(255,255,255,0.55)', fontSize: typography.captionMedium.fontSize, fontWeight: '500' },

  qrSection: { alignItems: 'center', marginVertical: spacing.lg },
  qrBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.lg,
    padding: spacing.xxl,
    marginBottom: spacing.md,
    position: 'relative',
  },
  qrCorner: { position: 'absolute', width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)' },
  qrTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
  qrTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
  qrBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
  qrBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  ticketCode: { color: 'rgba(255,255,255,0.7)', fontSize: typography.small.fontSize, fontWeight: '800', letterSpacing: 2, marginBottom: spacing.xs, fontFamily: 'Courier' },
  qrHint: { color: 'rgba(255,255,255,0.5)', fontSize: typography.small.fontSize, fontWeight: '500' },

  statusBadge: { borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: 'center', marginTop: 'auto' },
  statusText: { fontSize: typography.tiny.fontSize, fontWeight: '800', letterSpacing: 1 },

  screenBright: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    paddingVertical: spacing.md,
    letterSpacing: 0.3,
  },
});
