import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import BookingProgress from '../../components/BookingProgress';
import { colors, spacing, radii, typography, shadows, commonStyles } from '../../constants/theme';
import { fetchMatchById } from '../../services/matchService';
import { confirmBooking, unlockSeats } from '../../services/bookingService';
import { fetchDynamicPricingSuggestions } from '../../services/aiService';
import { formatMatchDate } from '../../utils/date';

export default function BookingScreen({ route, navigation }) {
  const { matchId, selectedSeats } = route.params;

  const [match, setMatch] = useState(null);
  const [pricingSuggestions, setPricingSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const matchData = await fetchMatchById(matchId);
        setMatch(matchData);

        try {
          const suggestionsData = await fetchDynamicPricingSuggestions(matchId);
          setPricingSuggestions(suggestionsData);
        } catch {
          setPricingSuggestions(null);
        }
      } catch {
        Alert.alert('Error', 'Failed to retrieve match checkout details');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      if (!isBooked) {
        const seatIds = selectedSeats.map((s) => s.id);
        unlockSeats(matchId, seatIds).catch((err) =>
          console.log('Failed to release seats lock:', err.message)
        );
      }
    };
  }, [matchId, selectedSeats, isBooked]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const handleCheckout = async () => {
    setIsPaying(true);
    const seatIds = selectedSeats.map((s) => s.id);
    try {
      await confirmBooking(matchId, seatIds);
      setIsBooked(true);

      Alert.alert(
        'Success 🏏',
        'Your tickets have been booked successfully. You can find them in the "My Tickets" tab.',
        [
          {
            text: 'View Tickets',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'FanDashboard' },
                  { name: 'MyTickets' },
                ],
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Checkout Failed', error.response?.data?.message || 'Payment processing failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Checkout" onBack={handleCancel} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      </View>
    );
  }

  const demandLevel = pricingSuggestions?.demandLevel || 'Normal';
  const multiplier = pricingSuggestions?.multiplier || 1.0;

  return (
    <View style={styles.container}>
      <BookingProgress currentStep={isBooked ? 'done' : 'pay'} />
      <ScreenHeader title="Confirm Booking" onBack={handleCancel} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>EVENT DETAILS</Text>
          <Text style={styles.matchTitle}>{match?.title}</Text>
          <Text style={styles.matchMeta}>📍 {match?.venue}</Text>
          <Text style={styles.matchMeta}>🗓 {match ? formatMatchDate(match.matchDate) : ''}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>SELECTED SEATS</Text>
          {selectedSeats.map((seat) => (
            <View key={seat.id} style={styles.seatRow}>
              <View style={styles.seatBadge}>
                <Text style={styles.seatLabel}>{seat.seatLabel}</Text>
              </View>
              <Text style={styles.seatCategory}>
                {seat.category.toUpperCase()}
              </Text>
              <Text style={styles.seatPrice}>₹{seat.price}</Text>
            </View>
          ))}
        </View>

        {multiplier > 1.0 ? (
          <View style={styles.aiAlert}>
            <Text style={styles.aiAlertTitle}>📈 AI Pricing Alert: {demandLevel} Demand</Text>
            <Text style={styles.aiAlertText}>
              Stadium seat occupancy is currently trending. A demand pricing multiplier of{' '}
              <Text style={styles.highlight}>{multiplier}x</Text> is recommended, but your locked seats
              have been secured at their initial lock pricing!
            </Text>
            {pricingSuggestions?.factors && (
              <View style={styles.pricingFactors}>
                <Text style={styles.factorTitle}>Pricing Factors:</Text>
                {pricingSuggestions.factors.demandLevel && (
                  <Text style={styles.factorItem}>• Demand: {pricingSuggestions.factors.demandLevel}</Text>
                )}
                {pricingSuggestions.factors.urgency && (
                  <Text style={styles.factorItem}>• Timing: {pricingSuggestions.factors.urgency}</Text>
                )}
                {pricingSuggestions.factors.dayFactor && (
                  <Text style={styles.factorItem}>• {pricingSuggestions.factors.dayFactor}</Text>
                )}
                {pricingSuggestions.factors.matchDaySurge && (
                  <Text style={styles.factorItem}>• Match day surge applied</Text>
                )}
              </View>
            )}
            {pricingSuggestions?.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {(pricingSuggestions.confidence * 100).toFixed(0)}%
              </Text>
            )}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardHeader}>PAYMENT BREAKDOWN</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tickets Cost</Text>
            <Text style={styles.billValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Convenience Fee</Text>
            <Text style={styles.billValue}>₹0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            🔒 Seats are reserved for you for 5 minutes. If you go back or close the app, your holds
            will be released.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={isPaying}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.primaryButton, styles.payBtn]}
          onPress={handleCheckout}
          disabled={isPaying}
          activeOpacity={0.8}
        >
          {isPaying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    color: colors.textMuted,
    ...typography.small,
    letterSpacing: 1.2,
    marginBottom: spacing.lg,
  },
  matchTitle: {
    color: colors.textPrimary,
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  matchMeta: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: `${colors.border}50`,
  },
  seatBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radii.sm,
  },
  seatLabel: {
    color: '#FFFFFF',
    ...typography.tiny,
    letterSpacing: 0,
  },
  seatCategory: {
    color: colors.textSecondary,
    ...typography.captionMedium,
    flex: 1,
    marginLeft: spacing.lg,
  },
  seatPrice: {
    color: colors.textPrimary,
    ...typography.bodyMedium,
  },
  aiAlert: {
    backgroundColor: `${colors.info}15`,
    borderColor: colors.info,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  aiAlertTitle: {
    color: colors.info,
    ...typography.small,
    letterSpacing: 0,
    textTransform: 'none',
    marginBottom: spacing.xs,
  },
  aiAlertText: {
    color: colors.textSecondary,
    ...typography.caption,
    lineHeight: typography.caption.lineHeight + 4,
  },
  highlight: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  pricingFactors: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${colors.info}30`,
  },
  factorTitle: {
    color: colors.textSecondary,
    ...typography.tiny,
    letterSpacing: 0,
    textTransform: 'none',
    marginBottom: spacing.xs,
  },
  factorItem: {
    color: colors.textMuted,
    ...typography.tiny,
    lineHeight: typography.tiny.lineHeight + 4,
    letterSpacing: 0,
    textTransform: 'none',
  },
  confidenceText: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize - 1,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  billLabel: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  billValue: {
    color: colors.textPrimary,
    ...typography.bodyMedium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.primaryLight,
    ...typography.h3,
  },
  warningBox: {
    paddingHorizontal: spacing.lg,
  },
  warningText: {
    color: colors.textMuted,
    ...typography.small,
    textAlign: 'center',
    letterSpacing: 0,
    textTransform: 'none',
    lineHeight: typography.small.lineHeight + 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    gap: spacing.lg,
    ...shadows.lg,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  cancelBtnText: {
    color: colors.textPrimary,
    ...typography.bodyMedium,
  },
  payBtn: {
    flex: 2,
    marginTop: 0,
  },
});
