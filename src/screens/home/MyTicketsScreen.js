import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMyTickets } from '../../services/ticketService';

const CATEGORY_THEMES = {
  vip: { gradient: ['#FFD700', '#E6A800'], label: 'VIP' },
  category1: { gradient: ['#FFD700', '#E6A800'], label: 'CATEGORY 1' },
  category2: { gradient: ['#FF6B6B', '#E53935'], label: 'CATEGORY 2' },
  category3: { gradient: ['#6C5CE7', '#4834D4'], label: 'CATEGORY 3' },
  category4: { gradient: ['#EF5350', '#C62828'], label: 'CATEGORY 4' },
  supporters: { gradient: ['#2E7D32', '#1B5E20'], label: 'SUPPORTERS' },
  premium: { gradient: [colors.primary, '#5A4BD1'], label: 'PREMIUM' },
  general: { gradient: ['#6B7B8D', '#4A5568'], label: 'GENERAL' },
};

function getTicketDisplayStatus(ticket) {
  if (ticket.status === 'used') return 'used';
  const matchStatus = ticket.match?.status;
  if (matchStatus === 'cancelled') return 'invalid';
  const matchDate = ticket.match?.matchDate ? new Date(ticket.match.matchDate) : null;
  if (matchStatus === 'completed' || (matchDate && matchDate < new Date())) return 'invalid';
  return 'active';
}

const STATUS_CONFIG = {
  active: { label: 'VALID TICKET', bg: 'rgba(0,200,83,0.15)', color: '#69F0AE' },
  used: { label: 'ALREADY USED', bg: 'rgba(255,59,48,0.15)', color: '#FF6B6B' },
  invalid: { label: 'INVALID', bg: 'rgba(142,142,147,0.15)', color: '#8E8E93' },
};

export default function MyTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try { setTickets(await fetchMyTickets()); } catch {} finally { setIsLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  const renderTicket = ({ item }) => {
    const category = (item.seat?.category || 'general').toLowerCase();
    const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.general;
    const matchDate = item.match?.matchDate ? new Date(item.match.matchDate) : null;
    const displayStatus = getTicketDisplayStatus(item);
    const statusCfg = STATUS_CONFIG[displayStatus];
    const isActive = displayStatus === 'active';

    return (
      <TouchableOpacity
        style={[styles.ticketWrapper, !isActive && styles.ticketDimmed]}
        onPress={() => {
          if (item.match?._id || item.match?.id) {
            navigation.navigate('MatchDetail', { matchId: item.match._id || item.match.id });
          }
        }}
        activeOpacity={isActive ? 0.88 : 1}
        disabled={!isActive}
      >
        <LinearGradient colors={theme.gradient} style={styles.accentStripe} />

        <LinearGradient
          colors={[`${colors.gradientStart}F0`, `${colors.gradientEnd}F0`]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.ticketCard}
        >
          {/* Top Section */}
          <View style={styles.ticketTop}>
            <View style={styles.ticketBrandRow}>
              <Text style={styles.ticketBrandText}>SMART STADIUM</Text>
              <View style={[styles.catBadge, { backgroundColor: `${theme.gradient[0]}30` }]}>
                <Text style={[styles.catText, { color: theme.gradient[0] }]}>{theme.label}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.matchTitle} numberOfLines={1}>{item.match?.title}</Text>

          <View style={styles.teamsRow}>
            <Text style={styles.teamText}>{item.match?.teamA || 'TBA'}</Text>
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <Text style={styles.teamText}>{item.match?.teamB || 'TBA'}</Text>
          </View>

          {matchDate && (
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeText}>
                {matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.dateTimeText}>
                {matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
          )}

          <View style={styles.perforatedContainer}>
            <View style={styles.perforatedLine} />
          </View>

          <View style={styles.detailsGrid}>
            {[
              { label: 'SEAT', value: item.seat?.seatLabel || 'N/A' },
              { label: 'PRICE', value: `Rs.${item.seat?.price || '—'}` },
              { label: 'VENUE', value: item.match?.venue || '\u2014', flex: true },
            ].map((d) => (
              <View key={d.label} style={[styles.detailCell, d.flex && { flex: 1.5 }]}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{d.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.perforatedContainer}>
            <View style={styles.perforatedLine} />
          </View>

          {/* QR Section — only for active tickets */}
          {isActive ? (
            <View style={styles.qrSection}>
              <View style={styles.qrBox}>
                <QRCode
                  value={item.ticketCode}
                  size={120}
                  color="#FFFFFF"
                  backgroundColor="transparent"
                  level="M"
                />
                <View style={[styles.qrCorner, styles.qrCornerTL]} />
                <View style={[styles.qrCorner, styles.qrCornerTR]} />
                <View style={[styles.qrCorner, styles.qrCornerBL]} />
                <View style={[styles.qrCorner, styles.qrCornerBR]} />
              </View>
              <Text style={styles.ticketCode}>{item.ticketCode}</Text>
              <Text style={styles.qrHint}>Show this QR at the entry gate</Text>
            </View>
          ) : (
            <View style={styles.qrSection}>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>
                  {displayStatus === 'used' ? 'This ticket has been scanned' : 'This ticket is no longer valid'}
                </Text>
              </View>
            </View>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusBannerText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </LinearGradient>

        <View style={[styles.notch, styles.notchLeft]} />
        <View style={[styles.notch, styles.notchRight]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item._id || item.ticketCode}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>My Tickets</Text>
            <Text style={styles.pageSubtitle}>Present QR codes at the entry gate</Text>
            {tickets.length > 0 && (
              <View style={styles.ticketCount}>
                <Text style={styles.ticketCountText}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>{'🎫'}</Text>
              </View>
              <Text style={styles.emptyTitle}>No Tickets Yet</Text>
              <Text style={styles.emptyText}>Book a match to see your tickets here</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xxl }} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxxl },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, marginBottom: spacing.xl },
  pageTitle: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  pageSubtitle: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  ticketCount: { marginTop: spacing.md, backgroundColor: colors.primarySurface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, alignSelf: 'flex-start', borderWidth: 1, borderColor: `${colors.primary}25` },
  ticketCountText: { color: colors.primaryLight, fontSize: 9, fontWeight: '700' },

  // Ticket
  ticketWrapper: { marginHorizontal: spacing.xl, marginBottom: spacing.xl, position: 'relative' },
  ticketDimmed: { opacity: 0.5 },
  accentStripe: { height: 4, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl },
  ticketCard: {
    borderTopLeftRadius: 1, borderTopRightRadius: 1,
    borderBottomLeftRadius: radii.xxl, borderBottomRightRadius: radii.xxl,
    padding: spacing.xxl, ...shadows.lg,
  },
  notch: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.background, top: '50%', marginTop: -12,
  },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },

  ticketTop: { marginBottom: spacing.lg },
  ticketBrandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketBrandText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  catBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  catText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  matchTitle: { color: '#FFF', fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.sm },

  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  teamText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.bodyMedium.fontSize, fontWeight: '600' },
  vsBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  vsText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },

  dateTimeRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg },
  dateTimeText: { color: 'rgba(255,255,255,0.6)', fontSize: typography.small.fontSize, fontWeight: '500' },

  perforatedContainer: { marginVertical: spacing.md, marginHorizontal: -spacing.xxl },
  perforatedLine: {
    height: 0, borderWidth: 1, borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
  },

  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailCell: { flex: 1 },
  detailLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  detailValue: { color: '#FFF', fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  // QR
  qrSection: { alignItems: 'center', marginVertical: spacing.lg },
  qrBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm,
    position: 'relative',
  },
  qrCorner: { position: 'absolute', width: 12, height: 12, borderColor: 'rgba(255,255,255,0.3)' },
  qrCornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
  qrCornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
  qrCornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
  qrCornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  ticketCode: { color: 'rgba(255,255,255,0.7)', fontSize: typography.small.fontSize, fontWeight: '800', letterSpacing: 2, marginBottom: spacing.xs, fontFamily: 'Courier' },
  qrHint: { color: 'rgba(255,255,255,0.5)', fontSize: typography.small.fontSize, fontWeight: '500' },
  qrPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl,
    width: '100%', alignItems: 'center',
  },
  qrPlaceholderText: {
    color: 'rgba(255,255,255,0.4)', fontSize: typography.caption.fontSize,
    fontWeight: '600', textAlign: 'center',
  },

  // Status
  statusBanner: { borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: 'center' },
  statusBannerText: { fontSize: typography.tiny.fontSize, fontWeight: '800', letterSpacing: 1 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${colors.primary}20`,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700', marginBottom: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },
});
