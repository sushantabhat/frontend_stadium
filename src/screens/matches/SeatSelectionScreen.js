import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { io } from 'socket.io-client';
import ScreenHeader from '../../components/ScreenHeader';
import BookingProgress from '../../components/BookingProgress';
import StadiumMap from '../../components/stadium/StadiumMap';
import CategoryFilterBar from '../../components/stadium/CategoryFilterBar';
import TicketListingCard from '../../components/stadium/TicketListingCard';
import FilterChips from '../../components/stadium/FilterChips';
import { API_BASE_URL } from '../../constants/config';
import { colors, spacing, radii, typography, shadows, CATEGORY_COLORS } from '../../constants/theme';
import { fetchMatchById, fetchMatchSeats } from '../../services/matchService';
import { lockSeats } from '../../services/bookingService';

const { height: SCREEN_H } = Dimensions.get('window');

export default function SeatSelectionScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [quantity, setQuantity] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(true);
  const MAX_SLIDE = SCREEN_H * 0.42;
  const panelPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => panelAnim.stopAnimation(),
      onPanResponderMove: (_, g) => {
        let val;
        if (isOpenRef.current) {
          val = Math.max(0, Math.min(1, g.dy / MAX_SLIDE));
        } else {
          val = Math.max(0, Math.min(1, 1 + g.dy / MAX_SLIDE));
        }
        panelAnim.setValue(val);
      },
      onPanResponderRelease: (_, g) => {
        const isTap = Math.abs(g.dy) < 10;
        let shouldOpen;
        if (isTap) {
          shouldOpen = !isOpenRef.current;
        } else {
          const dist = isOpenRef.current ? g.dy : -g.dy;
          shouldOpen = dist < MAX_SLIDE * 0.3;
        }
        Animated.timing(panelAnim, {
          toValue: shouldOpen ? 0 : 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        isOpenRef.current = shouldOpen;
        setPanelOpen(shouldOpen);
      },
    })
  ).current;
  const [isCompact, setIsCompact] = useState(() => {
    const { height } = Dimensions.get('window');
    return height < 700;
  });

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.emit('join_match', matchId);
    socket.on('seat_update', (updatedSeat) => {
      setSeats((prev) => prev.map((s) => (s.id === updatedSeat.id ? { ...s, ...updatedSeat } : s)));
    });
    return () => {
      socket.emit('leave_match', matchId);
      socket.off('seat_update');
      socket.disconnect();
    };
  }, [matchId]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [matchData, seatsData] = await Promise.all([
        fetchMatchById(matchId),
        fetchMatchSeats(matchId),
      ]);
      setMatch(matchData);
      setSeats(seatsData);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load stadium');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sections = useMemo(() => {
    if (match?.stadiumSections && match.stadiumSections.length > 0) {
      return match.stadiumSections.map((section) => {
        const sectionSeats = seats.filter((s) => s.sectionId === section.sectionId);
        const available = sectionSeats.filter((s) => s.status === 'available').length;
        return {
          ...section,
          totalSeats: sectionSeats.length || section.totalSeats,
          availableSeats: available,
          seats: sectionSeats,
        };
      });
    }
    return [];
  }, [match, seats]);

  const filteredSections = useMemo(() => {
    if (!activeCategory) return sections;
    return sections.filter((s) => s.category === activeCategory);
  }, [sections, activeCategory]);

  const seatStats = useMemo(() => {
    const available = seats.filter((s) => s.status === 'available').length;
    const booked = seats.filter((s) => s.status === 'booked').length;
    const locked = seats.filter((s) => s.status === 'locked').length;
    return { total: seats.length, available, booked, locked };
  }, [seats]);

  const filters = useMemo(() => {
    const f = [];
    if (activeCategory) {
      const catInfo = CATEGORY_COLORS[activeCategory] || { label: activeCategory };
      f.push({ key: 'category', label: catInfo.label });
    }
    if (selectedSection) {
      f.push({ key: 'section', label: `${selectedSection.sectionId} (${selectedSection.availableSeats})` });
    }
    if (quantity) {
      f.push({ key: 'quantity', label: `${quantity} Ticket${quantity > 1 ? 's' : ''}` });
    }
    return f;
  }, [activeCategory, selectedSection, quantity]);

  const handleSectionSelect = useCallback((section) => {
    setSelectedSection((prev) => (prev?.sectionId === section.sectionId ? null : section));
    setSelectedSeats([]);
  }, []);

  const handleFilterRemove = useCallback((key) => {
    if (key === 'category') setActiveCategory(null);
    if (key === 'section') setSelectedSection(null);
    if (key === 'quantity') setQuantity(2);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveCategory(null);
    setSelectedSection(null);
    setSelectedSeats([]);
    setQuantity(2);
  }, []);

  const handleQuantityChange = useCallback((delta) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  }, []);

  const handleProceed = async () => {
    if (!selectedSection || selectedSection.availableSeats === 0) {
      Alert.alert('Selection Required', 'Please select a section with available seats.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sectionSeats = (selectedSection.seats || [])
        .filter((s) => s.status === 'available')
        .slice(0, quantity)
        .map((s) => ({
          id: s.id || s._id,
          seatLabel: s.seatLabel,
          category: s.category,
          sectionId: selectedSection.sectionId,
          price: selectedSection.pricePerTicket || match?.pricing?.[s.category] || 0,
        }));

      if (sectionSeats.length < quantity) {
        Alert.alert('Not Enough Seats', `Only ${sectionSeats.length} seats available in this section.`);
        setIsSubmitting(false);
        return;
      }

      await lockSeats(matchId, sectionSeats.map((s) => s.id));
      navigation.navigate('Booking', { matchId, selectedSeats: sectionSeats });
    } catch (error) {
      Alert.alert('Booking Error', error.response?.data?.message || 'Could not lock seats');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = useMemo(() => {
    if (!selectedSection) return 0;
    return selectedSection.pricePerTicket * quantity;
  }, [selectedSection, quantity]);

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

  const hasStadiumSections = sections.length > 0;

  return (
    <View style={styles.container}>
      <BookingProgress currentStep="select" />
      <ScreenHeader
        title={`${match?.teamA} vs ${match?.teamB}`}
        subtitle="Select your preferred section"
        onBack={() => navigation.goBack()}
      />

      {hasStadiumSections ? (
        <View style={styles.layout}>
          {/* Map Panel — fills all space, listing overlays from bottom */}
          <View style={styles.mapPanelFull}>
            <CategoryFilterBar
              sections={sections}
              activeFilter={activeCategory}
              onFilterChange={setActiveCategory}
            />

            <View style={styles.mapContainer}>
              <StadiumMap
                sections={filteredSections}
                selectedSection={selectedSection}
                onSectionPress={handleSectionSelect}
                showPrices={true}
              />
            </View>

            {/* Stats bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.success }]} />
                <Text style={styles.statNum}>{seatStats.available}</Text>
                <Text style={styles.statText}>Open</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.statNum}>{seatStats.locked}</Text>
                <Text style={styles.statText}>Locked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.borderLight }]} />
                <Text style={styles.statNum}>{seatStats.booked}</Text>
                <Text style={styles.statText}>Taken</Text>
              </View>
            </View>
          </View>

          {/* Bottom Sheet: Listings — overlays map, slides down on toggle */}
          <Animated.View
            style={[
              styles.listingOverlay,
                {
                  transform: [{
                    translateY: panelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, MAX_SLIDE],
                    }),
                  }],
                },
            ]}
          >
            <View
              style={styles.listingHandle}
              {...panelPan.panHandlers}
            >
              <View style={styles.bottomSheetHandle} />
            </View>

            <FilterChips
              filters={filters}
              onRemove={handleFilterRemove}
              onClearAll={handleClearFilters}
            />

            <ScrollView
              contentContainerStyle={styles.listingContent}
              showsVerticalScrollIndicator={false}
            >
              {(selectedSection ? [selectedSection] : filteredSections).map((section, idx) => (
                <TicketListingCard
                  key={section.sectionId || `section-${idx}`}
                  section={section}
                  seats={section.seats}
                  onSelect={handleSectionSelect}
                  isSelected={selectedSection?.sectionId === section.sectionId}
                />
              ))}

              {filteredSections.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No sections available</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No Stadium Layout</Text>
            <Text style={styles.emptyText}>
              This match does not have a stadium layout configured yet.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Checkout Bar */}
      {selectedSection && selectedSection.availableSeats > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.checkoutSummary}>
            <Text style={styles.checkoutSection}>
              Section {selectedSection.sectionId}
            </Text>
            <Text style={styles.checkoutDetails}>
              {quantity} × Rs.{selectedSection.pricePerTicket}
            </Text>
          </View>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQuantityChange(-1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQuantityChange(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkoutRight}>
            <Text style={styles.checkoutTotal}>Rs.{totalAmount}</Text>
            <TouchableOpacity
              style={[styles.payBtn, isSubmitting && styles.payBtnDisabled]}
              activeOpacity={0.8}
              onPress={handleProceed}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.payBtnText}>BUY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: 120 },

  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  mapPanelFull: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 0,
  },
  mapContainer: {
    flex: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderRadius: radii.xl,
  },
  listingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_H * 0.55,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingTop: 0,
    ...shadows.lg,
  },
  listingHandle: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  listingContent: {
    paddingBottom: 120,
  },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statNum: {
    color: colors.textMuted,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
  },
  statText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderSubtle,
  },

  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },

  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.xl,
  },
  checkoutSummary: {
    flex: 1,
  },
  checkoutSection: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
  },
  checkoutDetails: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  qtyValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  checkoutRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  checkoutTotal: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
  },
  payBtn: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
