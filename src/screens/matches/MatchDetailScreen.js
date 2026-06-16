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
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';

const TEAM_EMOJIS = { India: '🇮🇳', Australia: '🇦🇺', England: '🏴', Pakistan: '🇵🇰', SouthAfrica: '🇿🇦' };

function getStatusConfig(status) {
  switch (status) {
    case 'live': return { label: 'LIVE NOW', color: '#FF3B30', bg: '#FF3B3018', dot: true };
    case 'upcoming': return { label: 'UPCOMING', color: colors.accent, bg: `${colors.accent}18` };
    case 'completed': return { label: 'COMPLETED', color: colors.textMuted, bg: colors.surfaceElevated };
    case 'cancelled': return { label: 'CANCELLED', color: colors.danger, bg: `${colors.danger}18` };
    default: return { label: 'UPCOMING', color: colors.accent, bg: `${colors.accent}18` };
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
    try { setError(''); setMatch(await fetchMatchById(matchId)); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load match details'); }
    finally { setIsLoading(false); }
  }, [matchId]);

  useFocusEffect(useCallback(() => { loadMatch(); }, [loadMatch]));

  const handleCancel = () => {
    Alert.alert('Cancel Match', 'Are you sure you want to cancel this match?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        setIsCancelling(true);
        try { setMatch(await cancelMatch(matchId)); Alert.alert('Success', 'Match has been cancelled.'); }
        catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed to cancel'); }
        finally { setIsCancelling(false); }
      }},
    ]);
  };

  if (isLoading) return <View style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View></View>;
  if (error || !match) return (
    <View style={styles.container}><View style={styles.center}>
      <Text style={styles.errorText}>{error || 'Match not found'}</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}><Text style={{ color: colors.primaryLight }}>← Go Back</Text></TouchableOpacity>
    </View></View>
  );

  const stats = match.seatStats || {};
  const statusConfig = getStatusConfig(match.status);
  const date = new Date(match.matchDate);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const occupancyPct = stats.total > 0 ? Math.round(((stats.total - (stats.available || 0)) / stats.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[`${colors.primaryDark}EE`, `${colors.primary}AA`, `${colors.primaryDark}55`]} style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            {statusConfig.dot && <View style={styles.liveDot} />}
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>

          <View style={styles.teamsRow}>
            <View style={styles.teamBlock}>
              <Text style={styles.teamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
              <Text style={styles.teamName}>{match.teamA}</Text>
            </View>
            <View style={styles.vsBlock}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.teamBlock}>
              <Text style={styles.teamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
              <Text style={styles.teamName}>{match.teamB}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{match.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaIcon}>⏰</Text>
              <Text style={styles.metaText}>{timeStr}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText} numberOfLines={1}>{match.venue}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.quickStats}>
            {[
              { label: 'Total Seats', value: stats.total || 0, icon: '💺' },
              { label: 'Available', value: stats.available || 0, icon: '✅', valueColor: colors.success },
              { label: 'Booked', value: stats.booked || 0, icon: '🎟️', valueColor: colors.warning },
              { label: 'Sold', value: `${occupancyPct}%`, icon: '📊' },
            ].map((s) => (
              <View key={s.label} style={styles.quickStatCard}>
                <Text style={styles.quickStatIcon}>{s.icon}</Text>
                <Text style={[styles.quickStatValue, s.valueColor && { color: s.valueColor }]}>{s.value}</Text>
                <Text style={styles.quickStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Occupancy */}
        {stats.total > 0 && (
          <View style={styles.section}>
            <View style={styles.occupancyCard}>
              <View style={styles.occupancyHeader}>
                <Text style={styles.occupancyTitle}>Ticket Sales</Text>
                <Text style={styles.occupancyPct}>{occupancyPct}%</Text>
              </View>
              <View style={styles.occupancyBar}>
                <LinearGradient
                  colors={occupancyPct > 80 ? [colors.danger, colors.warning] : [colors.primary, colors.primaryLight]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.occupancyFill, { width: `${occupancyPct}%` }]}
                />
              </View>
              <View style={styles.occupancyLabels}>
                <Text style={styles.occupancyLabel}>{stats.booked || 0} sold</Text>
                <Text style={styles.occupancyLabel}>{stats.available || 0} remaining</Text>
              </View>
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ticket Pricing</Text>
          <View style={styles.pricingRow}>
            {[
              { label: 'VIP', value: match.pricing.vip, color: '#FFD700', icon: '👑', desc: 'Best views, premium lounge' },
              { label: 'Premium', value: match.pricing.premium, color: colors.primaryLight, icon: '⭐', desc: 'Great sightlines' },
              { label: 'General', value: match.pricing.general, color: colors.info, icon: '🎫', desc: 'Standard seating' },
            ].map(p => (
              <View key={p.label} style={[styles.priceCard, { borderColor: `${p.color}25` }]}>
                <LinearGradient colors={[`${p.color}12`, `${p.color}04`]} style={styles.priceCardInner}>
                  <Text style={styles.priceIcon}>{p.icon}</Text>
                  <Text style={[styles.priceValue, { color: p.color }]}>₹{p.value}</Text>
                  <Text style={styles.priceLabel}>{p.label}</Text>
                  <Text style={styles.priceDesc}>{p.desc}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Stadium Layout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stadium Layout</Text>
          <View style={styles.layoutCard}>
            <View style={styles.layoutRow}>
              <View style={styles.layoutItem}>
                <Text style={styles.layoutIcon}>Rows</Text>
                <Text style={styles.layoutValue}>{match.seatLayout.rows}</Text>
              </View>
              <View style={styles.layoutDivider} />
              <View style={styles.layoutItem}>
                <Text style={styles.layoutIcon}>Seats/Row</Text>
                <Text style={styles.layoutValue}>{match.seatLayout.seatsPerRow}</Text>
              </View>
              <View style={styles.layoutDivider} />
              <View style={styles.layoutItem}>
                <Text style={styles.layoutIcon}>VIP Rows</Text>
                <Text style={styles.layoutValue}>{match.seatLayout.vipRows}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        {match.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Match</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>{match.description}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        {!isAdmin && match.status !== 'cancelled' ? (
          <GradientButton title="Select & Book Seats →" onPress={() => navigation.navigate('SeatSelection', { matchId: match._id })} style={{ flex: 1 }} />
        ) : isAdmin && match.status !== 'cancelled' ? (
          <GradientButton title={isCancelling ? 'Cancelling...' : 'Cancel Match'} onPress={handleCancel} colors={[colors.danger, '#CC2F26']} style={{ flex: 1 }} />
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  backBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: radii.full, gap: spacing.xs, marginBottom: spacing.xl,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  statusText: { fontSize: typography.tiny.fontSize, fontWeight: '800', letterSpacing: 1.2 },

  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.lg },
  teamBlock: { alignItems: 'center' },
  teamEmoji: { fontSize: 44, marginBottom: spacing.xs },
  teamName: { color: 'rgba(255,255,255,0.85)', fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  vsBlock: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full, width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  vsText: { color: '#FFF', fontSize: typography.tiny.fontSize, fontWeight: '900', letterSpacing: 2 },

  heroTitle: {
    color: '#FFF', fontSize: typography.h1.fontSize, fontWeight: '900',
    textAlign: 'center', marginBottom: spacing.lg,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  metaIcon: { fontSize: 11 },
  metaText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.small.fontSize, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', letterSpacing: -0.3, marginBottom: spacing.md },

  // Quick Stats
  quickStats: { flexDirection: 'row', gap: spacing.sm },
  quickStatCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  quickStatIcon: { fontSize: 16, marginBottom: spacing.sm },
  quickStatValue: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 1 },
  quickStatLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '600', textAlign: 'center' },

  // Occupancy
  occupancyCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  occupancyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  occupancyTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.captionMedium.fontSize },
  occupancyPct: { color: colors.primaryLight, fontWeight: '900', fontSize: typography.h3.fontSize },
  occupancyBar: { height: 8, backgroundColor: colors.surfaceElevated, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.sm },
  occupancyFill: { height: '100%', borderRadius: 4 },
  occupancyLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  occupancyLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  // Pricing
  pricingRow: { flexDirection: 'row', gap: spacing.md },
  priceCard: { flex: 1, borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden' },
  priceCardInner: { padding: spacing.lg, alignItems: 'center' },
  priceIcon: { fontSize: 22, marginBottom: spacing.sm },
  priceValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  priceLabel: { color: colors.textPrimary, fontSize: typography.tiny.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  priceDesc: { color: colors.textMuted, fontSize: 8, fontWeight: '500', textAlign: 'center' },

  // Layout
  layoutCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  layoutRow: { flexDirection: 'row', alignItems: 'center' },
  layoutItem: { flex: 1, alignItems: 'center' },
  layoutDivider: { width: 1, height: 28, backgroundColor: colors.borderSubtle },
  layoutIcon: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginBottom: spacing.xs },
  layoutValue: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900' },

  // About
  aboutCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  aboutText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, lineHeight: 20 },

  // Sticky CTA
  stickyCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, paddingBottom: spacing.xxxl,
    flexDirection: 'row',
  },
  cancelledBanner: {
    flex: 1, backgroundColor: `${colors.danger}15`, borderRadius: radii.lg,
    padding: spacing.lg, alignItems: 'center',
  },
  cancelledText: { color: colors.dangerLight, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
