import React, { useCallback, useContext, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { ROLES } from '../../constants/config';
import { cancelMatch, fetchMatchById } from '../../services/matchService';
import { colors, spacing, radii, typography } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';

const TEAM_EMOJIS = { India: '🇮🇳', Australia: '🇦🇺', England: '🏴', Pakistan: '🇵🇰', SouthAfrica: '🇿🇦' };

function getStatusConfig(status) {
  switch (status) {
    case 'live': return { label: 'LIVE', color: colors.danger, bg: colors.dangerSurface };
    case 'upcoming': return { label: 'UPCOMING', color: colors.accent, bg: colors.accentSurface };
    case 'completed': return { label: 'COMPLETED', color: colors.textMuted, bg: colors.surfaceElevated };
    case 'cancelled': return { label: 'CANCELLED', color: colors.danger, bg: colors.dangerSurface };
    default: return { label: 'UPCOMING', color: colors.accent, bg: colors.accentSurface };
  }
}

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === ROLES.ADMIN;

  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');

  const loadMatch = useCallback(async () => {
    setIsLoading(true);
    try {
      setError('');
      const data = await fetchMatchById(matchId);
      setMatch(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load match details');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useFocusEffect(useCallback(() => { loadMatch(); }, [loadMatch]));

  const handleCancel = () => {
    Alert.alert('Cancel Match', 'Are you sure you want to cancel this match?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setIsCancelling(true);
          try {
            const updated = await cancelMatch(matchId);
            setMatch(updated);
            Alert.alert('Success', 'Match has been cancelled.');
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
          } finally {
            setIsCancelling(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Match not found'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
            <Text style={{ color: colors.primaryLight }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const stats = match.seatStats || {};
  const statusConfig = getStatusConfig(match.status);
  const date = new Date(match.matchDate);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[`${colors.primaryDark}DD`, `${colors.primary}AA`, `${colors.primaryDark}55`]}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            {match.status === 'live' && <View style={styles.liveDot} />}
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>

          <View style={styles.teamsRow}>
            <Text style={styles.teamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
            <View style={styles.vsBox}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <Text style={styles.teamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
          </View>

          <Text style={styles.heroTeams}>{match.teamA} vs {match.teamB}</Text>
          <Text style={styles.heroTitle}>{match.title}</Text>
          <Text style={styles.heroVenue}>📍 {match.venue}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏰</Text>
              <Text style={styles.metaText}>{timeStr}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingRow}>
            {[
              { label: 'VIP', value: match.pricing.vip, color: colors.accent, icon: '👑' },
              { label: 'Premium', value: match.pricing.premium, color: colors.primaryLight, icon: '⭐' },
              { label: 'General', value: match.pricing.general, color: colors.info, icon: '🎫' },
            ].map((p) => (
              <View key={p.label} style={styles.priceCard}>
                <Text style={styles.priceIcon}>{p.icon}</Text>
                <Text style={[styles.priceValue, { color: p.color }]}>₹{p.value}</Text>
                <Text style={styles.priceLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availRow}>
            {[
              { label: 'Total', value: stats.total || 0, color: colors.textPrimary },
              { label: 'Available', value: stats.available || 0, color: colors.success },
              { label: 'Booked', value: stats.booked || 0, color: colors.warning },
            ].map((s) => (
              <View key={s.label} style={styles.availCard}>
                <Text style={[styles.availValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.availLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Occupancy bar */}
          {stats.total > 0 && (
            <View style={styles.occupancyWrap}>
              <View style={styles.occupancyBar}>
                <View style={[styles.occupancyFill, { width: `${((stats.total - (stats.available || 0)) / stats.total) * 100}%` }]} />
              </View>
              <Text style={styles.occupancyText}>{Math.round(((stats.total - (stats.available || 0)) / stats.total) * 100)}% sold</Text>
            </View>
          )}
        </View>

        {/* Stadium Layout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stadium Layout</Text>
          <View style={styles.layoutCard}>
            <Text style={styles.layoutText}>{match.seatLayout.rows} rows × {match.seatLayout.seatsPerRow} seats per row</Text>
            <Text style={styles.layoutText}>VIP rows: {match.seatLayout.vipRows} · Premium rows: {match.seatLayout.premiumRows}</Text>
          </View>
        </View>

        {match.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descText}>{match.description}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        {!isAdmin && match.status !== 'cancelled' ? (
          <GradientButton
            title="Select & Book Seats →"
            onPress={() => navigation.navigate('SeatSelection', { matchId: match._id })}
            style={{ flex: 1 }}
          />
        ) : isAdmin && match.status !== 'cancelled' ? (
          <GradientButton
            title={isCancelling ? 'Cancelling...' : 'Cancel Match'}
            onPress={handleCancel}
            colors={[colors.danger, '#CC2F26']}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledText}>This match has been cancelled</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {},
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  errorText: { color: colors.danger, fontSize: typography.body.fontSize, textAlign: 'center' },

  // Hero
  hero: {
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  backBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  statusText: { fontSize: typography.tiny.fontSize, fontWeight: '800', letterSpacing: 1.2 },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  teamEmoji: { fontSize: 48 },
  vsBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: { color: '#FFF', fontSize: typography.tiny.fontSize, fontWeight: '900', letterSpacing: 2 },
  heroTeams: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: typography.h1.fontSize,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroVenue: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  metaIcon: { fontSize: 12 },
  metaText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.small.fontSize, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  // Pricing
  pricingRow: { flexDirection: 'row', gap: spacing.md },
  priceCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priceIcon: { fontSize: 20, marginBottom: spacing.sm },
  priceValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  priceLabel: { color: colors.textMuted, fontSize: typography.tiny.fontSize, fontWeight: '600' },

  // Availability
  availRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  availCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  availValue: { fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  availLabel: { color: colors.textMuted, fontSize: typography.tiny.fontSize, fontWeight: '600' },

  occupancyWrap: { alignItems: 'flex-end', gap: spacing.sm },
  occupancyBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  occupancyText: { color: colors.textMuted, fontSize: typography.tiny.fontSize },

  // Layout
  layoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layoutText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, marginBottom: spacing.xs },

  // Description
  descText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, lineHeight: 20 },

  // Sticky CTA
  stickyCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexDirection: 'row',
  },
  cancelledBanner: {
    flex: 1,
    backgroundColor: colors.dangerSurface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  cancelledText: { color: colors.dangerLight, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
