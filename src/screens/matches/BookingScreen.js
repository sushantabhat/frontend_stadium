import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BookingProgress from '../../components/BookingProgress';
import GradientButton from '../../components/GradientButton';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMatchById } from '../../services/matchService';
import { confirmBooking, unlockSeats } from '../../services/bookingService';
import { fetchDynamicPricingSuggestions } from '../../services/aiService';

export default function BookingScreen({ route, navigation }) {
  const { matchId, selectedSeats } = route.params;
  const [match, setMatch] = useState(null);
  const [pricingSuggestions, setPricingSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const matchData = await fetchMatchById(matchId);
        setMatch(matchData);
        try { setPricingSuggestions(await fetchDynamicPricingSuggestions(matchId)); } catch { setPricingSuggestions(null); }
      } catch { Alert.alert('Error', 'Failed to load checkout details'); }
      finally { setIsLoading(false); }
    }
    loadData();
  }, [matchId]);

  const totalAmount = useMemo(() => {
    if (!match || !selectedSeats) return 0;
    return selectedSeats.reduce((sum, seat) => {
      const basePrice = match.pricing?.[seat.category] || 0;
      return sum + basePrice * (pricingSuggestions?.multiplier || 1.0);
    }, 0);
  }, [match, selectedSeats, pricingSuggestions]);

  const handleCheckout = async () => {
    setIsPaying(true);
    try {
      const result = await confirmBooking(matchId, selectedSeats.map(s => s.id || s._id));
      setIsBooked(true);
      setBookedTicket(result.ticket || result);
    } catch (err) { Alert.alert('Booking failed', err.response?.data?.message || err.message); }
    finally { setIsPaying(false); }
  };

  const handleCancel = async () => {
    try { await unlockSeats(matchId, selectedSeats.map(s => s.id || s._id)); } catch {} navigation.goBack();
  };

  const handleDone = () => { navigation.popToTop(); };

  if (isLoading) return (
    <View style={styles.container}>
      <BookingProgress currentStep="review" />
      <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    </View>
  );

  // Success State
  if (isBooked) {
    const ticket = bookedTicket || {};
    const qrUrl = ticket.ticketCode
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.ticketCode)}&color=FFFFFF&bgcolor=6C5CE7`
      : null;

    return (
      <View style={styles.container}>
        <BookingProgress currentStep="done" />
        <ScrollView contentContainerStyle={styles.successScroll}>
          {/* Success Hero */}
          <View style={styles.successCard}>
            <LinearGradient colors={[`${colors.primary}DD`, `${colors.primaryDark}EE`]} style={styles.successGradient}>
              <View style={styles.successIconWrap}>
                <Text style={styles.successIcon}>✅</Text>
              </View>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSubtitle}>Your tickets are ready</Text>

              {qrUrl && (
                <View style={styles.qrSection}>
                  <View style={styles.qrBox}>
                    <Image source={{ uri: qrUrl }} style={styles.qrImage} />
                    <View style={[styles.qrCorner, styles.qrCornerTL]} />
                    <View style={[styles.qrCorner, styles.qrCornerTR]} />
                    <View style={[styles.qrCorner, styles.qrCornerBL]} />
                    <View style={[styles.qrCorner, styles.qrCornerBR]} />
                  </View>
                  <Text style={styles.qrHint}>📱 Show this QR at the entry gate</Text>
                </View>
              )}

              <View style={styles.dividerDashed} />

              <View style={styles.ticketDetails}>
                <View style={styles.ticketDetailRow}>
                  <View style={styles.ticketDetailCol}>
                    <Text style={styles.detailLabel}>TICKET CODE</Text>
                    <Text style={styles.detailValue}>{ticket.ticketCode || 'N/A'}</Text>
                  </View>
                  <View style={styles.ticketDetailCol}>
                    <Text style={styles.detailLabel}>AMOUNT PAID</Text>
                    <Text style={[styles.detailValue, { color: colors.accent }]}>₹{Math.round(totalAmount)}</Text>
                  </View>
                </View>
                <View style={{ marginTop: spacing.md }}>
                  <Text style={styles.detailLabel}>SEATS</Text>
                  <Text style={styles.detailValue}>{selectedSeats.map(s => s.seatLabel).join(', ')}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <GradientButton title="Done" onPress={handleDone} style={{ marginHorizontal: spacing.xl, marginTop: spacing.xl }} />
        </ScrollView>
      </View>
    );
  }

  const demandLevel = pricingSuggestions?.demandLevel || 'Normal';
  const multiplier = pricingSuggestions?.multiplier || 1.0;

  return (
    <View style={styles.container}>
      <BookingProgress currentStep="pay" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Card */}
        <View style={styles.card}>
          <LinearGradient colors={[`${colors.primary}15`, `${colors.primary}05`]} style={styles.cardGradient}>
            <Text style={styles.cardHeader}>EVENT DETAILS</Text>
            <Text style={styles.matchTitle}>{match?.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>📍 {match?.venue}</Text>
            </View>
            {match?.matchDate && (
              <Text style={styles.metaText}>
                📅 {new Date(match.matchDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(match.matchDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Seats Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SELECTED SEATS ({selectedSeats.length})</Text>
          {selectedSeats.map((seat, idx) => {
            const basePrice = match?.pricing?.[seat.category] || 0;
            const price = basePrice * multiplier;
            const categoryColors = { vip: '#FFD700', premium: colors.primaryLight, general: colors.info };
            const catColor = categoryColors[seat.category] || colors.info;
            return (
              <View key={seat.id || seat._id} style={[styles.seatRow, idx < selectedSeats.length - 1 && styles.seatRowBorder]}>
                <View style={styles.seatLeft}>
                  <View style={[styles.seatIndicator, { backgroundColor: catColor }]} />
                  <View>
                    <Text style={styles.seatLabel}>{seat.seatLabel}</Text>
                    <Text style={styles.seatCategory}>{(seat.category || 'general').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.seatPrice}>₹{Math.round(price)}</Text>
              </View>
            );
          })}
        </View>

        {/* Demand Alert */}
        {multiplier !== 1.0 && (
          <View style={styles.demandCard}>
            <LinearGradient colors={[`${colors.warning}15`, `${colors.warning}05`]} style={styles.demandInner}>
              <View style={styles.demandLeft}>
                <Text style={styles.demandIcon}>📈</Text>
                <View>
                  <Text style={styles.demandTitle}>Dynamic Pricing Active</Text>
                  <Text style={styles.demandDesc}>High demand: {demandLevel} ({multiplier}x multiplier)</Text>
                </View>
              </View>
              <Text style={styles.demandMultiplier}>×{multiplier}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</Text>
            <Text style={styles.summaryValue}>₹{Math.round(totalAmount / multiplier)}</Text>
          </View>
          {multiplier !== 1.0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Demand Surcharge</Text>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>+₹{Math.round(totalAmount - totalAmount / multiplier)}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{Math.round(totalAmount)}</Text>
          </View>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <GradientButton
          title={isPaying ? 'Processing...' : `Pay ₹${Math.round(totalAmount)}`}
          onPress={handleCheckout}
          disabled={isPaying}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  // Cards
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden' },
  cardGradient: { padding: spacing.xl },
  cardHeader: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: spacing.md },
  matchTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.sm },
  metaRow: { marginBottom: spacing.xs },
  metaText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, marginBottom: spacing.xs },

  // Seats
  seatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  seatRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  seatLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  seatIndicator: { width: 4, height: 28, borderRadius: 2 },
  seatLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  seatCategory: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginTop: 2 },
  seatPrice: { color: colors.accent, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  // Demand
  demandCard: { borderRadius: radii.lg, marginBottom: spacing.lg, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.warning}25` },
  demandInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  demandLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  demandIcon: { fontSize: 20 },
  demandTitle: { color: colors.warningLight, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  demandDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  demandMultiplier: { color: colors.warning, fontSize: typography.h2.fontSize, fontWeight: '900' },

  // Summary
  summaryCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  summaryLabel: { color: colors.textSecondary, fontSize: typography.captionMedium.fontSize, fontWeight: '500' },
  summaryValue: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.md },
  totalLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  totalValue: { color: colors.accent, fontSize: typography.h2.fontSize, fontWeight: '900' },

  // Sticky CTA
  stickyCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, paddingBottom: spacing.xxxl,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  cancelBtn: {
    paddingVertical: spacing.lg + 2, paddingHorizontal: spacing.xl,
    borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { color: colors.textMuted, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  // Success
  successScroll: { padding: spacing.xl, paddingTop: spacing.xxl },
  successCard: { borderRadius: radii.xxl, overflow: 'hidden', ...shadows.lg },
  successGradient: { padding: spacing.xxl, alignItems: 'center' },
  successIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: { fontSize: 32 },
  successTitle: { color: '#FFF', fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xs },
  successSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: typography.caption.fontSize, marginBottom: spacing.xl },
  qrSection: { alignItems: 'center', marginBottom: spacing.xl },
  qrBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm, position: 'relative' },
  qrImage: { width: 140, height: 140, borderRadius: radii.md },
  qrCorner: { position: 'absolute', width: 12, height: 12, borderColor: 'rgba(255,255,255,0.3)' },
  qrCornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
  qrCornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
  qrCornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
  qrCornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  qrHint: { color: 'rgba(255,255,255,0.6)', fontSize: typography.small.fontSize },
  dividerDashed: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginVertical: spacing.xl, width: '100%' },
  ticketDetails: { width: '100%' },
  ticketDetailRow: { flexDirection: 'row', gap: spacing.xl },
  ticketDetailCol: { flex: 1 },
  detailLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  detailValue: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
