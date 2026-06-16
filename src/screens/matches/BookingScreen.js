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
import { colors, commonStyles } from '../../constants/theme';
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

        // Fetch dynamic pricing analytics (simulated AI demand pricing)
        try {
          const suggestionsData = await fetchDynamicPricingSuggestions(matchId);
          setPricingSuggestions(suggestionsData);
        } catch {
          // Fallback if AI endpoint fails (staff/admin only permissions)
          setPricingSuggestions(null);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to retrieve match checkout details');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Clean up locks when user navigates away without booking
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
      await confirmBooking(matchId, seatIds, totalAmount);
      setIsBooked(true);

      Alert.alert(
        'Success 🏏',
        'Your tickets have been booked successfully. You can find them in the "My Tickets" tab.',
        [
          {
            text: 'View Tickets',
            onPress: () => {
              // Reset navigation stack to FanDashboard and go to MyTickets
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

  // Calculate dynamic multiplier display
  const demandLevel = pricingSuggestions?.demandLevel || 'Normal';
  const multiplier = pricingSuggestions?.multiplier || 1.0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Confirm Booking" onBack={handleCancel} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Match Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>EVENT DETAILS</Text>
          <Text style={styles.matchTitle}>{match?.title}</Text>
          <Text style={styles.matchMeta}>📍 {match?.venue}</Text>
          <Text style={styles.matchMeta}>🗓 {match ? formatMatchDate(match.matchDate) : ''}</Text>
        </View>

        {/* Selected Seats Details */}
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

        {/* AI Dynamic Pricing Alert */}
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

        {/* Billing details */}
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

      {/* Checkout Payment CTAs */}
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
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  matchTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  matchMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: `${colors.border}50`,
  },
  seatBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  seatLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  seatCategory: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  seatPrice: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  aiAlert: {
    backgroundColor: `${colors.info}15`,
    borderColor: colors.info,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  aiAlertTitle: {
    color: colors.info,
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  aiAlertText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  highlight: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  pricingFactors: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.info}30`,
  },
  factorTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  factorItem: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 18,
  },
  confidenceText: {
    color: colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  billValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 18,
  },
  warningBox: {
    paddingHorizontal: 12,
  },
  warningText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  payBtn: {
    flex: 2,
    marginTop: 0,
  },
});
