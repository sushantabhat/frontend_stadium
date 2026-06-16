import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { io } from 'socket.io-client';
import ScreenHeader from '../../components/ScreenHeader';
import BookingProgress from '../../components/BookingProgress';
import { API_BASE_URL } from '../../constants/config';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMatchById, fetchMatchSeats } from '../../services/matchService';
import { lockSeats } from '../../services/bookingService';
import { fetchSmartSeatRecommendations } from '../../services/aiService';

export default function SeatSelectionScreen({ route, navigation }) {
  const { matchId } = route.params;

  const [match, setMatch] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.emit('join_match', matchId);

    socket.on('seat_update', (updatedSeat) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.id === updatedSeat.id ? { ...seat, ...updatedSeat } : seat
        )
      );
    });

    return () => {
      socket.emit('leave_match', matchId);
      socket.off('seat_update');
      socket.disconnect();
    };
  }, [matchId]);

  // Load Match and Seats
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const matchData = await fetchMatchById(matchId);
      setMatch(matchData);

      const seatsData = await fetchMatchSeats(matchId);
      setSeats(seatsData);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load stadium layout');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group seats by rows for visual rendering
  const seatGrid = useMemo(() => {
    const rows = {};
    seats.forEach((seat) => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });
    return Object.entries(rows).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  // Handle seat toggling
  const handleSelectSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') {
      return; // Cannot select booked or already locked seats
    }

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // AI Recommendation Trigger
  const handleAiRecommend = async () => {
    setIsAiLoading(true);
    try {
      const recommended = await fetchSmartSeatRecommendations(matchId, selectedCategory, 2);
      if (recommended.length === 0) {
        Alert.alert('AI Helper', 'No available seats found in this category.');
        return;
      }

      // Check if any recommended seats are currently locked/booked
      const validRecs = recommended.filter(
        (rec) =>
          !seats.find((s) => s.id === rec._id && (s.status === 'locked' || s.status === 'booked'))
      );

      if (validRecs.length === 0) {
        Alert.alert('AI Helper', 'The best recommended seats are locked. Please try again.');
        return;
      }

      const formattedRecs = validRecs.map((r) => ({
        id: r._id,
        seatLabel: r.seatLabel,
        price: r.price,
        category: r.category,
        score: r.score,
        explanation: r.explanation,
      }));

      setSelectedSeats(formattedRecs);

      // Build detailed message with explanations
      const seatDetails = formattedRecs.map((s) => {
        const explanation = s.explanation || 'Good seat selection';
        return `${s.seatLabel} - ${explanation}`;
      }).join('\n');

      Alert.alert(
        'AI Recommended Seats',
        `We selected the best seats for you:\n\n${seatDetails}`
      );
    } catch {
      Alert.alert('Error', 'Failed to fetch AI seat recommendations');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Lock seats and proceed to checkout
  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one seat to book.');
      return;
    }

    setIsSubmitting(true);
    const seatIds = selectedSeats.map((s) => s.id);
    try {
      // Call lock API
      await lockSeats(matchId, seatIds);

      // Navigate to Booking Details Checkout Screen
      navigation.navigate('Booking', {
        matchId,
        selectedSeats,
      });
    } catch (error) {
      Alert.alert('Booking Error', error.response?.data?.message || 'Could not lock selected seats');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate selected total price
  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Select Seats" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BookingProgress currentStep="select" />
      <ScreenHeader
        title={`${match?.teamA} vs ${match?.teamB}`}
        subtitle="Select your preferred stadium seats"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stadium screen banner */}
        <View style={styles.pitchScreen}>
          <Text style={styles.pitchText}>CRICKET FIELD / PITCH DIRECTION</Text>
          <View style={styles.pitchLine} />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.seatLegendCircle, { backgroundColor: colors.success }]} />
            <Text style={styles.legendLabel}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.seatLegendCircle, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendLabel}>Locked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.seatLegendCircle, { backgroundColor: colors.borderSoft }]} />
            <Text style={styles.legendLabel}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.seatLegendCircle, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendLabel}>Selected</Text>
          </View>
        </View>

        {/* Seat grid layout */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridOuter}>
          <View style={styles.gridInner}>
            {seatGrid.map(([rowLabel, rowSeats]) => (
              <View key={rowLabel} style={styles.rowWrapper}>
                <Text style={styles.rowLabelText}>{rowLabel}</Text>
                <View style={styles.rowSeatsContainer}>
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    let seatBg = colors.success;

                    if (seat.status === 'booked') {
                      seatBg = colors.borderSoft;
                    } else if (seat.status === 'locked') {
                      seatBg = colors.warning;
                    } else if (isSelected) {
                      seatBg = colors.primary;
                    }

                    return (
                      <TouchableOpacity
                        key={seat.id}
                        style={[styles.seatButton, { backgroundColor: seatBg }]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectSeat(seat)}
                        disabled={seat.status === 'booked' || seat.status === 'locked'}
                      >
                        <Text style={styles.seatLabelText}>{seat.number}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.rowLabelText}>{rowLabel}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Category Pricing Guide */}
        <View style={styles.pricingGuide}>
          <Text style={styles.guideTitle}>Ticket Pricing</Text>
          <View style={styles.pricingPillsRow}>
            <View style={[styles.pricingPill, { borderColor: '#E2E8F0' }]}>
              <Text style={styles.pricingPillText}>VIP: ₹{match?.pricing.vip}</Text>
            </View>
            <View style={[styles.pricingPill, { borderColor: colors.primaryLight }]}>
              <Text style={styles.pricingPillText}>Premium: ₹{match?.pricing.premium}</Text>
            </View>
            <View style={[styles.pricingPill, { borderColor: colors.success }]}>
              <Text style={styles.pricingPillText}>General: ₹{match?.pricing.general}</Text>
            </View>
          </View>
        </View>

        {/* AI Recommendations Panel */}
        <View style={styles.aiPanel}>
          <Text style={styles.aiPanelTitle}>🤖 AI Smart Seat Selection</Text>
          <Text style={styles.aiPanelDesc}>
            Let our algorithm find the best viewing angles close to the pitch center.
          </Text>

          <View style={styles.categorySelectorRow}>
            {['vip', 'premium', 'general'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catSelectorBtn,
                  selectedCategory === cat ? styles.catSelectorBtnActive : null,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.catSelectorText,
                    selectedCategory === cat ? styles.catSelectorTextActive : null,
                  ]}
                >
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.aiBtn}
            activeOpacity={0.8}
            onPress={handleAiRecommend}
            disabled={isAiLoading}
          >
            {isAiLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.aiBtnText}>Select 2 Best Available Seats</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Selected Seats summary & Checkout CTA */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutLabel}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
          </Text>
          <Text style={styles.selectedLabels}>
            {selectedSeats.length > 0
              ? selectedSeats.map((s) => s.seatLabel).join(', ')
              : 'None'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.8}
          onPress={handleProceed}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutBtnText}>Pay ₹{totalAmount}</Text>
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
    paddingBottom: 120,
  },
  pitchScreen: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pitchText: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pitchLine: {
    height: 3,
    backgroundColor: colors.primary,
    width: '50%',
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  seatLegendCircle: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },
  gridOuter: {
    paddingBottom: spacing.lg,
  },
  gridInner: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabelText: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    fontWeight: '800',
    width: 16,
    textAlign: 'center',
  },
  rowSeatsContainer: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  seatButton: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatLabelText: {
    color: '#FFFFFF',
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
  },
  pricingGuide: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  guideTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.captionMedium.fontSize,
    marginBottom: spacing.md,
  },
  pricingPillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pricingPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  pricingPillText: {
    color: colors.textPrimary,
    fontSize: typography.small.fontSize,
    fontWeight: '800',
  },
  aiPanel: {
    marginTop: spacing.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  aiPanelTitle: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: typography.bodyMedium.fontSize,
    marginBottom: spacing.xs,
  },
  aiPanelDesc: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  categorySelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  catSelectorBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  catSelectorBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  catSelectorText: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  catSelectorTextActive: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
  aiBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.xl,
  },
  checkoutSummary: {
    flex: 1,
  },
  checkoutLabel: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
  },
  selectedLabels: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    marginTop: spacing.xxs,
  },
  checkoutBtn: {
    flex: 1,
    maxWidth: 160,
    marginTop: 0,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...shadows.primary,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
  },
});
