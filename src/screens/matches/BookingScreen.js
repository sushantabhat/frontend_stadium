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
        try {
          const suggestions = await fetchDynamicPricingSuggestions(matchId);
          setPricingSuggestions(suggestions);
        } catch {
          setPricingSuggestions(null);
        }
      } catch {
        Alert.alert('Error', 'Failed to load checkout details');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [matchId]);

  const totalAmount = useMemo(() => {
    if (!match || !selectedSeats) return 0;
    return selectedSeats.reduce((sum, seat) => {
      const basePrice = match.pricing?.[seat.category] || 0;
      const multiplier = pricingSuggestions?.multiplier || 1.0;
      return sum + basePrice * multiplier;
    }, 0);
  }, [match, selectedSeats, pricingSuggestions]);

  const handleCheckout = async () => {
    setIsPaying(true);
    try {
      const seatIds = selectedSeats.map(s => s.id || s._id);
      const result = await confirmBooking(matchId, seatIds);
      setIsBooked(true);
      setBookedTicket(result.ticket || result);
    } catch (err) {
      Alert.alert('Booking failed', err.response?.data?.message || err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    try {
      const seatIds = selectedSeats.map(s => s.id || s._id);
      await unlockSeats(matchId, seatIds);
    } catch {
      // silent
    }
    navigation.goBack();
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BookingProgress currentStep="review" />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  // Booked success state
  if (isBooked) {
    const ticket = bookedTicket || {};
    const qrUrl = ticket.ticketCode
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.ticketCode)}&color=FFFFFF&bgcolor=6C5CE7`
      : null;

    return (
      <View style={styles.container}>
        <BookingProgress currentStep="done" />
        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successCard}>
            <LinearGradient colors={colors.gradientPurple} style={styles.successGradient}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSubtitle}>Your tickets are ready</Text>

              {qrUrl && (
                <View style={styles.qrSection}>
                  <View style={styles.qrBox}>
                    <Image source={{ uri: qrUrl }} style={styles.qrImage} />
                  </View>
                  <Text style={styles.qrHint}>📱 Show this QR at the entry gate</Text>
                </View>
              )}

              <View style={styles.dividerDashed} />

              <View style={styles.ticketDetails}>
                <Text style={styles.detailLabel}>TICKET CODE</Text>
                <Text style={styles.detailValue}>{ticket.ticketCode || 'N/A'}</Text>
                <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>SEATS</Text>
                <Text style={styles.detailValue}>{selectedSeats.map(s => s.seatLabel).join(', ')}</Text>
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Details */}
        <View style={styles.card}>
          <LinearGradient colors={[`${colors.primary}18`, `${colors.primary}05`]} style={styles.cardGradient}>
            <Text style={styles.cardHeader}>EVENT DETAILS</Text>
            <Text style={styles.matchTitle}>{match?.title}</Text>
            <Text style={styles.matchMeta}>📍 {match?.venue}</Text>
            {match?.matchDate && (
              <Text style={styles.matchMeta}>📅 {new Date(match.matchDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(match.matchDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
            )}
          </LinearGradient>
        </View>

        {/* Selected Seats */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SELECTED SEATS ({selectedSeats.length})</Text>
          {selectedSeats.map((seat, idx) => {
            const basePrice = match?.pricing?.[seat.category] || 0;
            const price = basePrice * multiplier;
            return (
              <View key={idx} style={styles.seatRow}>
                <View style={styles.seatInfo}>
                  <Text style={styles.seatLabel}>{seat.seatLabel}</Text>
                  <Text style={styles.seatCategory}>{(seat.category || 'general').toUpperCase()}</Text>
                </View>
                <Text style={styles.seatPrice}>₹{Math.round(price)}</Text>
              </View>
            );
          })}
        </View>

        {/* Pricing Summary */}
        {multiplier !== 1.0 && (
          <View style={styles.demandCard}>
            <Text style={styles.demandIcon}>📈</Text>
            <View style={styles.demandInfo}>
              <Text style={styles.demandTitle}>Dynamic Pricing Active</Text>
              <Text style={styles.demandDesc}>High demand: {demandLevel} ({multiplier}x multiplier)</Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{Math.round(totalAmount)}</Text>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
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
  card: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden',
  },
  cardGradient: { padding: spacing.xl },
  cardHeader: {
    color: colors.textMuted, fontSize: 9, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: spacing.md,
  },
  matchTitle: {
    color: colors.textPrimary, fontSize: typography.h3.fontSize,
    fontWeight: '800', marginBottom: spacing.sm,
  },
  matchMeta: { color: colors.textSecondary, fontSize: typography.caption.fontSize, marginBottom: spacing.xs },

  // Seats
  seatRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle,
  },
  seatInfo: { flex: 1 },
  seatLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  seatCategory: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginTop: 2 },
  seatPrice: { color: colors.accent, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },

  // Demand
  demandCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warningSurface,
    borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: `${colors.warning}30`, gap: spacing.md,
  },
  demandIcon: { fontSize: 20 },
  demandInfo: { flex: 1 },
  demandTitle: { color: colors.warningLight, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  demandDesc: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },

  // Total
  totalCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.textSecondary, fontSize: typography.bodyMedium.fontSize, fontWeight: '600' },
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
  successIcon: { fontSize: 48, marginBottom: spacing.lg },
  successTitle: { color: '#FFF', fontSize: typography.h2.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  successSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: typography.caption.fontSize, marginBottom: spacing.xl },
  qrSection: { alignItems: 'center', marginBottom: spacing.xl },
  qrBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  qrImage: { width: 140, height: 140, borderRadius: radii.md },
  qrHint: { color: 'rgba(255,255,255,0.6)', fontSize: typography.small.fontSize },
  dividerDashed: {
    height: 1, borderStyle: 'dashed', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.xl, width: '100%',
  },
  ticketDetails: { width: '100%' },
  detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  detailValue: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
