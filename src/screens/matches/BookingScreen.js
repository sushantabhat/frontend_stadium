import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import BookingProgress from '../../components/BookingProgress';
import EsewaPaymentModal from '../../components/EsewaPaymentModal';
import KhaltiPaymentModal from '../../components/KhaltiPaymentModal';
import GradientButton from '../../components/GradientButton';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { formatInNepal, formatTimeInNepal } from '../../utils/date';
import { fetchMatchById } from '../../services/matchService';
import { unlockSeats, initiateEsewaPayment, verifyEsewaPayment, initiateKhaltiPayment, verifyKhaltiPayment } from '../../services/bookingService';
import { fetchDynamicPricingSuggestions } from '../../services/aiService';

export default function BookingScreen({ route, navigation }) {
  const { matchId, selectedSeats = [] } = route.params || {};
  const [match, setMatch] = useState(null);
  const [pricingSuggestions, setPricingSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedTickets, setBookedTickets] = useState([]);
  const [esewaData, setEsewaData] = useState(null);
  const [esewaVisible, setEsewaVisible] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [khaltiData, setKhaltiData] = useState(null);
  const [khaltiVisible, setKhaltiVisible] = useState(false);

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

  const handleEsewaPayment = async () => {
    setIsPaying(true);
    try {
      const seatIds = selectedSeats.map(s => s.id || s._id);
      const result = await initiateEsewaPayment(matchId, seatIds, Math.round(totalAmount));
      setEsewaData(result);
      setPendingPayment({ matchId, seatIds });
      setEsewaVisible(true);
    } catch (err) { Alert.alert('Payment Error', err.response?.data?.message || err.message); }
    finally { setIsPaying(false); }
  };

  const handleEsewaSuccess = async (encodedData) => {
    setEsewaVisible(false);
    setIsPaying(true);
    try {
      const result = await verifyEsewaPayment(
        encodedData,
        esewaData.transactionUuid,
        pendingPayment.matchId,
        pendingPayment.seatIds
      );
      setIsBooked(true);
      setBookedTickets(result.tickets || []);
    } catch (err) { Alert.alert('Verification failed', err.response?.data?.message || err.message); }
    finally { setIsPaying(false); }
  };

  const handleEsewaError = (msg) => {
    setEsewaVisible(false);
    Alert.alert('Payment Failed', msg);
  };

  const handleKhaltiPayment = async () => {
    setIsPaying(true);
    try {
      const seatIds = selectedSeats.map(s => s.id || s._id);
      const result = await initiateKhaltiPayment(matchId, seatIds, totalAmount);
      setKhaltiData(result);
      setPendingPayment({ matchId, seatIds });
      setKhaltiVisible(true);
    } catch (err) { Alert.alert('Payment Error', err.response?.data?.message || err.message); }
    finally { setIsPaying(false); }
  };

  const handleKhaltiSuccess = async (pidx) => {
    setKhaltiVisible(false);
    setIsPaying(true);
    try {
      const result = await verifyKhaltiPayment(pidx, pendingPayment.matchId, pendingPayment.seatIds);
      setIsBooked(true);
      setBookedTickets(result.tickets || []);
    } catch (err) { Alert.alert('Verification failed', err.response?.data?.message || err.message); }
    finally { setIsPaying(false); }
  };

  const handleKhaltiError = (msg) => {
    setKhaltiVisible(false);
    Alert.alert('Payment Failed', msg);
  };

  const handleCancel = async () => {
    try {
      await unlockSeats(matchId, selectedSeats.map(s => s.id || s._id));
    } catch {
      Alert.alert('Error', 'Failed to release seats. Please try again.');
      return;
    }
    navigation.goBack();
  };

  const handleDone = () => { navigation.popToTop(); };

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <BookingProgress currentStep="review" />
      <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    </SafeAreaView>
  );

  // Success State
  if (isBooked) {
    const firstTicket = bookedTickets[0] || {};

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
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

              {firstTicket.ticketCode ? (
                <View style={styles.qrSection}>
                  <View style={styles.qrBox}>
                    <QRCode
                      value={firstTicket.ticketCode}
                      size={140}
                      backgroundColor="transparent"
                      color="#FFFFFF"
                    />
                    <View style={[styles.qrCorner, styles.qrCornerTL]} />
                    <View style={[styles.qrCorner, styles.qrCornerTR]} />
                    <View style={[styles.qrCorner, styles.qrCornerBL]} />
                    <View style={[styles.qrCorner, styles.qrCornerBR]} />
                  </View>
                  <Text style={styles.qrHint}>📱 Show this QR at the entry gate</Text>
                </View>
              ) : null}

              <View style={styles.dividerDashed} />

                <View style={styles.ticketDetails}>
                  {bookedTickets.map((t, i) => (
                    <View key={t._id || i} style={i < bookedTickets.length - 1 ? styles.ticketDetailBorder : undefined}>
                      <View style={styles.ticketDetailRow}>
                        <View style={styles.ticketDetailCol}>
                          <Text style={styles.detailLabel}>TICKET {i + 1}</Text>
                          <Text style={styles.detailValue}>{t.ticketCode || 'N/A'}</Text>
                        </View>
                        <View style={styles.ticketDetailCol}>
                          <Text style={styles.detailLabel}>SEAT</Text>
                          <Text style={styles.detailValue}>{selectedSeats[i]?.seatLabel || 'N/A'}</Text>
                        </View>
                      </View>
                      {selectedSeats[i]?.gate ? (
                        <View style={styles.ticketDetailRow}>
                          <View style={styles.ticketDetailCol}>
                            <Text style={styles.detailLabel}>GATE</Text>
                            <Text style={styles.detailValue}>{selectedSeats[i].gate}</Text>
                          </View>
                          <View style={styles.ticketDetailCol} />
                        </View>
                      ) : null}
                    </View>
                  ))}
                  <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: spacing.md }}>
                    <View style={styles.ticketDetailRow}>
                      <View style={styles.ticketDetailCol}>
                        <Text style={styles.detailLabel}>TICKETS</Text>
                        <Text style={styles.detailValue}>{selectedSeats.length}</Text>
                      </View>
                      <View style={styles.ticketDetailCol}>
                        <Text style={styles.detailLabel}>AMOUNT PAID</Text>
                        <Text style={[styles.detailValue, { color: colors.accent }]}>Rs.{Math.round(totalAmount)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
            </LinearGradient>
          </View>

          <GradientButton title="Done" onPress={handleDone} style={{ marginHorizontal: spacing.xl, marginTop: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const demandLevel = pricingSuggestions?.demandLevel || 'Normal';
  const multiplier = pricingSuggestions?.multiplier || 1.0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <BookingProgress currentStep="pay" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Card */}
        <View style={styles.card}>
          <LinearGradient colors={[`${colors.primary}15`, `${colors.primary}05`]} style={styles.cardGradient}>
            {match?.imageUrl ? (
              <Image source={{ uri: match.imageUrl }} style={styles.cardBanner} resizeMode="cover" />
            ) : null}
            <Text style={styles.cardHeader}>EVENT DETAILS</Text>
            <View style={styles.eventTeamsRow}>
              {match?.teamALogo ? (
                <Image source={{ uri: match.teamALogo }} style={styles.eventTeamLogo} resizeMode="contain" />
              ) : null}
              <Text style={styles.matchTitle}>{match?.title}</Text>
              {match?.teamBLogo ? (
                <Image source={{ uri: match.teamBLogo }} style={styles.eventTeamLogo} resizeMode="contain" />
              ) : null}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>📍 {match?.venue}</Text>
            </View>
            {match?.matchDate && (
              <Text style={styles.metaText}>
                📅 {formatInNepal(match.matchDate, { weekday: 'long', month: 'long', day: 'numeric' })} at {formatTimeInNepal(match.matchDate, { hour: '2-digit', minute: '2-digit', hour12: true })}
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
            const categoryColors = { platinum: '#E8E8E8', gold: '#FFD700', silver: '#A8A8A8', bronze: '#CD7F32', general: '#5B9BD5', category1: '#FFD700', category2: '#FF6B6B', category3: '#A29BFE', category4: '#EF5350', supporters: '#81C784', premium: colors.primaryLight };
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
                <Text style={styles.seatPrice}>Rs.{Math.round(price)}</Text>
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
            <Text style={styles.summaryValue}>Rs.{Math.round(totalAmount / multiplier)}</Text>
          </View>
        {Math.abs(multiplier - 1.0) > 0.001 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Demand Surcharge</Text>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>+Rs.{Math.round(totalAmount - totalAmount / multiplier)}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs.{Math.round(totalAmount)}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.paymentMethodCard}>
          <Text style={styles.cardHeader}>PAYMENT METHOD</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'esewa' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('esewa')}
              activeOpacity={0.7}
            >
              <Text style={[styles.paymentOptionText, paymentMethod === 'esewa' && styles.paymentOptionTextActive]}>eSewa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'khalti' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('khalti')}
              activeOpacity={0.7}
            >
              <Text style={[styles.paymentOptionText, paymentMethod === 'khalti' && styles.paymentOptionTextActive]}>Khalti</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <EsewaPaymentModal
        visible={esewaVisible}
        formData={esewaData?.formData || {}}
        paymentUrl={esewaData?.paymentUrl || ''}
        onSuccess={handleEsewaSuccess}
        onError={handleEsewaError}
        onClose={() => setEsewaVisible(false)}
      />

      <KhaltiPaymentModal
        visible={khaltiVisible}
        paymentUrl={khaltiData?.paymentUrl || ''}
        onSuccess={handleKhaltiSuccess}
        onError={handleKhaltiError}
        onClose={() => setKhaltiVisible(false)}
      />

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <GradientButton
          title={isPaying ? 'Redirecting...' : `Pay via ${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} Rs.${Math.round(totalAmount)}`}
          onPress={paymentMethod === 'esewa' ? handleEsewaPayment : handleKhaltiPayment}
          disabled={isPaying}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  // Cards
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden' },
  cardGradient: { padding: spacing.xl, position: 'relative' },
  cardBanner: { width: '100%', height: 120, borderRadius: radii.lg, marginBottom: spacing.md },
  eventTeamsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  eventTeamLogo: { width: 28, height: 28 },
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

  // Payment Method
  paymentMethodCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  paymentOptions: { flexDirection: 'row', gap: spacing.md },
  paymentOption: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  paymentOptionActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
  paymentOptionText: { color: colors.textMuted, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  paymentOptionTextActive: { color: colors.primary },

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
  ticketDetailBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.sm, paddingBottom: spacing.sm },
});
