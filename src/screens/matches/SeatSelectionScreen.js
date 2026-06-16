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
import { LinearGradient } from 'expo-linear-gradient';
import { io } from 'socket.io-client';
import ScreenHeader from '../../components/ScreenHeader';
import BookingProgress from '../../components/BookingProgress';
import { API_BASE_URL } from '../../constants/config';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMatchById, fetchMatchSeats } from '../../services/matchService';
import { lockSeats } from '../../services/bookingService';
import { fetchSmartSeatRecommendations } from '../../services/aiService';

const CATEGORY_COLORS = {
  vip: { accent: '#FFD700', bg: `${colors.accent}18`, border: `${colors.accent}35` },
  premium: { accent: colors.primaryLight, bg: `${colors.primary}18`, border: `${colors.primary}35` },
  general: { accent: colors.info, bg: `${colors.info}18`, border: `${colors.info}35` },
};

export default function SeatSelectionScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.emit('join_match', matchId);
    socket.on('seat_update', (updatedSeat) => {
      setSeats(prev => prev.map(s => s.id === updatedSeat.id ? { ...s, ...updatedSeat } : s));
    });
    return () => { socket.emit('leave_match', matchId); socket.off('seat_update'); socket.disconnect(); };
  }, [matchId]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [matchData, seatsData] = await Promise.all([fetchMatchById(matchId), fetchMatchSeats(matchId)]);
      setMatch(matchData);
      setSeats(seatsData);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load stadium layout');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => { loadData(); }, [loadData]);

  const seatGrid = useMemo(() => {
    const rows = {};
    seats.forEach(s => { if (!rows[s.row]) rows[s.row] = []; rows[s.row].push(s); });
    return Object.entries(rows).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const seatStats = useMemo(() => {
    const available = seats.filter(s => s.status === 'available').length;
    const booked = seats.filter(s => s.status === 'booked').length;
    const locked = seats.filter(s => s.status === 'locked').length;
    return { total: seats.length, available, booked, locked };
  }, [seats]);

  const handleSelectSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;
    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    setSelectedSeats(isAlreadySelected ? selectedSeats.filter(s => s.id !== seat.id) : [...selectedSeats, seat]);
  };

  const handleAiRecommend = async () => {
    setIsAiLoading(true);
    try {
      const recommended = await fetchSmartSeatRecommendations(matchId, selectedCategory, 2);
      if (recommended.length === 0) {
        Alert.alert('AI Helper', 'No available seats found in this category.');
        return;
      }
      const validRecs = recommended.filter(r => !seats.find(s => s.id === r._id && (s.status === 'locked' || s.status === 'booked')));
      if (validRecs.length === 0) {
        Alert.alert('AI Helper', 'The best recommended seats are locked. Please try again.');
        return;
      }
      const formattedRecs = validRecs.map(r => ({ id: r._id, seatLabel: r.seatLabel, price: r.price, category: r.category, score: r.score, explanation: r.explanation }));
      setSelectedSeats(formattedRecs);
      Alert.alert('AI Recommended Seats', `We selected the best seats for you:\n\n${formattedRecs.map(s => `${s.seatLabel} - ${s.explanation || 'Good seat selection'}`).join('\n')}`);
    } catch { Alert.alert('Error', 'Failed to fetch AI seat recommendations'); }
    finally { setIsAiLoading(false); }
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one seat to book.');
      return;
    }
    setIsSubmitting(true);
    try {
      await lockSeats(matchId, selectedSeats.map(s => s.id));
      navigation.navigate('Booking', { matchId, selectedSeats });
    } catch (error) {
      Alert.alert('Booking Error', error.response?.data?.message || 'Could not lock selected seats');
    } finally { setIsSubmitting(false); }
  };

  const totalAmount = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Select Seats" onBack={() => navigation.goBack()} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryLight} /></View>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stadium Pitch */}
        <View style={styles.pitchCard}>
          <LinearGradient colors={[`${colors.primary}15`, `${colors.primary}05`]} style={styles.pitchInner}>
            <Text style={styles.pitchLabel}>🏏 PITCH</Text>
            <View style={styles.pitchField}>
              <View style={styles.pitchGreen}>
                <View style={styles.pitchCenter} />
                <View style={styles.pitchCircle} />
              </View>
            </View>
            <Text style={styles.pitchHint}>Seats below face the pitch</Text>
          </LinearGradient>
        </View>

        {/* Live Stats Bar */}
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
            <View style={[styles.statDot, { backgroundColor: colors.borderSoft }]} />
            <Text style={styles.statNum}>{seatStats.booked}</Text>
            <Text style={styles.statText}>Taken</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.textPrimary }]}>{seatStats.total}</Text>
            <Text style={styles.statText}>Total</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {[
            { color: colors.success, label: 'Available' },
            { color: colors.primary, label: 'Selected' },
            { color: colors.warning, label: 'Locked' },
            { color: colors.borderSoft, label: 'Booked' },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Seat Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridOuter}>
          <View style={styles.gridInner}>
            {seatGrid.map(([rowLabel, rowSeats]) => (
              <View key={rowLabel} style={styles.rowWrapper}>
                <Text style={styles.rowLabel}>{rowLabel}</Text>
                <View style={styles.rowSeats}>
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    let seatBg = colors.success;
                    if (seat.status === 'booked') seatBg = colors.borderSoft;
                    else if (seat.status === 'locked') seatBg = colors.warning;
                    else if (isSelected) seatBg = colors.primary;
                    const cat = CATEGORY_COLORS[seat.category] || CATEGORY_COLORS.general;
                    return (
                      <TouchableOpacity
                        key={seat.id}
                        style={[styles.seatBtn, { backgroundColor: seatBg, borderColor: isSelected ? '#FFF' : 'transparent' }]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectSeat(seat)}
                        disabled={seat.status === 'booked' || seat.status === 'locked'}
                      >
                        <Text style={[styles.seatNum, { opacity: isSelected ? 1 : 0.9 }]}>{seat.number}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.rowLabel}>{rowLabel}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Category Pricing */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Category Pricing</Text>
          <View style={styles.pricingGrid}>
            {[
              { cat: 'VIP', price: match?.pricing.vip, icon: '👑', key: 'vip' },
              { cat: 'Premium', price: match?.pricing.premium, icon: '⭐', key: 'premium' },
              { cat: 'General', price: match?.pricing.general, icon: '🎫', key: 'general' },
            ].map(p => (
              <View key={p.key} style={[styles.pricingCell, { borderColor: CATEGORY_COLORS[p.key].border, backgroundColor: CATEGORY_COLORS[p.key].bg }]}>
                <Text style={styles.pricingIcon}>{p.icon}</Text>
                <Text style={[styles.pricingPrice, { color: CATEGORY_COLORS[p.key].accent }]}>₹{p.price}</Text>
                <Text style={styles.pricingCat}>{p.cat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Panel */}
        <View style={styles.aiCard}>
          <LinearGradient colors={[`${colors.primary}15`, `${colors.primary}05`]} style={styles.aiInner}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>Smart Seat Selection</Text>
                <Text style={styles.aiSub}>AI finds the best viewing angles</Text>
              </View>
            </View>

            <View style={styles.catRow}>
              {['vip', 'premium', 'general'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, selectedCategory === cat && { borderColor: CATEGORY_COLORS[cat].accent, backgroundColor: CATEGORY_COLORS[cat].bg }]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.catBtnText, selectedCategory === cat && { color: CATEGORY_COLORS[cat].accent }]}>{cat.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.aiBtn} activeOpacity={0.8} onPress={handleAiRecommend} disabled={isAiLoading}>
              {isAiLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.aiBtnText}>Find Best 2 Seats</Text>}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutLabel}>
            {selectedSeats.length > 0 ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}` : 'No seats'}
          </Text>
          {selectedSeats.length > 0 && (
            <Text style={styles.checkoutSeats}>{selectedSeats.map(s => s.seatLabel).join(', ')}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.payBtn, selectedSeats.length === 0 && styles.payBtnDisabled]}
          activeOpacity={0.8}
          onPress={handleProceed}
          disabled={isSubmitting || selectedSeats.length === 0}
        >
          {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
            <Text style={styles.payBtnText}>Pay ₹{totalAmount}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: 120 },

  // Pitch
  pitchCard: { borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl },
  pitchInner: { padding: spacing.lg, alignItems: 'center' },
  pitchLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: spacing.md },
  pitchField: { width: '100%', height: 40, borderRadius: radii.md, overflow: 'hidden', marginBottom: spacing.sm },
  pitchGreen: { flex: 1, backgroundColor: '#1B5E20', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  pitchCenter: { position: 'absolute', width: '40%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  pitchCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  pitchHint: { color: colors.textMuted, fontSize: 9, fontWeight: '500' },

  // Stats Bar
  statsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statNum: { color: colors.textMuted, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  statText: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
  statDivider: { width: 1, height: 20, backgroundColor: colors.borderSubtle },

  // Legend
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl, paddingHorizontal: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  // Grid
  gridOuter: { paddingBottom: spacing.lg },
  gridInner: { alignItems: 'center', gap: spacing.xs + 2 },
  rowWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', width: 18, textAlign: 'center' },
  rowSeats: { flexDirection: 'row', gap: 3 },
  seatBtn: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  seatNum: { color: '#FFF', fontSize: 8, fontWeight: '800' },

  // Pricing
  pricingCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl },
  pricingTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.captionMedium.fontSize, marginBottom: spacing.md },
  pricingGrid: { flexDirection: 'row', gap: spacing.sm },
  pricingCell: { flex: 1, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
  pricingIcon: { fontSize: 16, marginBottom: spacing.xs },
  pricingPrice: { fontSize: typography.bodyMedium.fontSize, fontWeight: '900', marginBottom: 1 },
  pricingCat: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  // AI Panel
  aiCard: { borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.primary}25`, marginBottom: spacing.xl },
  aiInner: { padding: spacing.xl },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  aiIcon: { fontSize: 24 },
  aiTitle: { color: colors.primaryLight, fontWeight: '800', fontSize: typography.bodyMedium.fontSize },
  aiSub: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 1 },

  catRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  catBtn: { flex: 1, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: 'center' },
  catBtnText: { color: colors.textMuted, fontSize: typography.tiny.fontSize, fontWeight: '700' },

  aiBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', ...shadows.primary },
  aiBtnText: { color: '#FFF', fontSize: typography.captionMedium.fontSize, fontWeight: '800' },

  // Checkout Bar
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...shadows.xl,
  },
  checkoutSummary: { flex: 1, marginRight: spacing.lg },
  checkoutLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  checkoutSeats: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: spacing.xxs },
  payBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderRadius: radii.lg, minWidth: 140, alignItems: 'center', justifyContent: 'center', ...shadows.primary },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
});
