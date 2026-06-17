import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
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

const { height: SCREEN_H } = Dimensions.get('window');

const TEAM_EMOJIS = { India: '🇮🇳', Australia: '🇦🇺', England: '🏴', Pakistan: '🇵🇰', SouthAfrica: '🇿🇦', Nepal: '🇳🇵' };

function getStatusConfig(status) {
  switch (status) {
    case 'live': return { label: 'LIVE NOW', color: '#FF1744', bg: 'rgba(255,23,68,0.2)', dot: true, glow: 'rgba(255,23,68,0.4)' };
    case 'upcoming': return { label: 'UPCOMING', color: '#FFD700', bg: 'rgba(255,215,0,0.15)', dot: false, glow: 'rgba(255,215,0,0.3)' };
    case 'completed': return { label: 'FINAL', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', dot: false, glow: 'transparent' };
    case 'cancelled': return { label: 'CANCELLED', color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', dot: false, glow: 'transparent' };
    default: return { label: 'UPCOMING', color: '#FFD700', bg: 'rgba(255,215,0,0.15)', dot: false, glow: 'transparent' };
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

  if (isLoading) return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    </View>
  );

  if (error || !match) return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.center}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error || 'Match not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.errorBack}>
          <Text style={s.errorBackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const stats = match.seatStats || {};
  const status = getStatusConfig(match.status);
  const date = match.matchDate ? new Date(match.matchDate) : new Date();
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const occupancyPct = stats.total > 0 ? Math.round(((stats.total - (stats.available || 0)) / stats.total) * 100) : 0;
  const hasImage = Boolean(match.imageUrl);

  const PRICING_TIERS = [
    { label: 'VIP', value: match.pricing?.vip ?? 0, color: '#FFD700', glow: 'rgba(255,215,0,0.25)', icon: '👑', desc: 'Best views, premium lounge', seats: stats.vip || 0 },
    { label: 'Premium', value: match.pricing?.premium ?? 0, color: '#A29BFE', glow: 'rgba(162,155,254,0.25)', icon: '⭐', desc: 'Great sightlines', seats: stats.premium || 0 },
    { label: 'General', value: match.pricing?.general ?? 0, color: '#00B0FF', glow: 'rgba(0,176,255,0.25)', icon: '🎫', desc: 'Standard seating', seats: stats.general || 0 },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} bounces={false}>

        {/* ═══════════════════════════════════════════════
            HERO — Full-bleed cinematic banner
            ═══════════════════════════════════════════════ */}
        <View style={s.hero}>
          {hasImage && <Image source={{ uri: match.imageUrl }} style={s.heroBanner} resizeMode="cover" />}

          <LinearGradient
            colors={hasImage
              ? ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.3)', 'rgba(7,8,11,0.85)', '#0F111A']
              : [`${colors.primaryDark}CC`, `${colors.primary}88`, `${colors.primaryDark}AA`, '#0F111A']}
            style={s.heroGradient}
          />

          {/* Content over gradient */}
          <View style={s.heroContent}>
            {/* Frosted back button */}
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={s.backBtnText}>←</Text>
            </TouchableOpacity>

            {/* Status badge — floating top-right */}
            <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
              {status.dot && <View style={[s.statusDot, { backgroundColor: status.color }]} />}
              <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
            </View>

            {/* Team matchup — the visual centerpiece */}
            <View style={s.teamsRow}>
              <View style={s.teamBlock}>
                {match.teamALogo ? (
                  <View style={[s.logoGlow, { shadowColor: status.glow !== 'transparent' ? status.glow : colors.primary }]}>
                    <Image source={{ uri: match.teamALogo }} style={s.teamLogo} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={s.teamEmojiFallback}>
                    <Text style={s.teamEmoji}>{TEAM_EMOJIS[match.teamA] || '🏏'}</Text>
                  </View>
                )}
                <Text style={s.teamName}>{match.teamA}</Text>
              </View>

              <View style={s.vsBlock}>
                <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']} style={s.vsInner}>
                  <Text style={s.vsText}>VS</Text>
                </LinearGradient>
              </View>

              <View style={s.teamBlock}>
                {match.teamBLogo ? (
                  <View style={[s.logoGlow, { shadowColor: status.glow !== 'transparent' ? status.glow : colors.primary }]}>
                    <Image source={{ uri: match.teamBLogo }} style={s.teamLogo} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={s.teamEmojiFallback}>
                    <Text style={s.teamEmoji}>{TEAM_EMOJIS[match.teamB] || '🏏'}</Text>
                  </View>
                )}
                <Text style={s.teamName}>{match.teamB}</Text>
              </View>
            </View>

            {/* Match title */}
            <Text style={s.heroTitle}>{match.title}</Text>

            {/* Meta pills */}
            <View style={s.metaRow}>
              <View style={s.metaPill}>
                <Text style={s.metaIcon}>📅</Text>
                <Text style={s.metaText}>{dateStr}</Text>
              </View>
              <View style={s.metaPill}>
                <Text style={s.metaIcon}>⏰</Text>
                <Text style={s.metaMono}>{timeStr}</Text>
              </View>
              <View style={s.metaPill}>
                <Text style={s.metaIcon}>📍</Text>
                <Text style={s.metaText} numberOfLines={1}>{match.venue}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            QUICK STATS — Colored accent cards
            ═══════════════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: colors.primary }]} />
            <Text style={s.sectionTitle}>Event Stats</Text>
          </View>
          <View style={s.quickStats}>
            {[
              { label: 'Total', value: stats.total || 0, icon: '💺', color: colors.textPrimary, bg: 'rgba(108,92,231,0.1)' },
              { label: 'Available', value: stats.available || 0, icon: '✅', color: '#00E676', bg: 'rgba(0,230,118,0.1)' },
              { label: 'Booked', value: stats.booked || 0, icon: '🎟️', color: '#FFB300', bg: 'rgba(255,179,0,0.1)' },
              { label: 'Sold', value: `${occupancyPct}%`, icon: '📊', color: '#00B0FF', bg: 'rgba(0,176,255,0.1)' },
            ].map((st) => (
              <View key={st.label} style={[s.statCard, { borderColor: `${st.color}20` }]}>
                <View style={[s.statIconWrap, { backgroundColor: st.bg }]}>
                  <Text style={s.statIcon}>{st.icon}</Text>
                </View>
                <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            OCCUPANCY — Gradient progress bar
            ═══════════════════════════════════════════════ */}
        {stats.total > 0 && (
          <View style={s.section}>
            <View style={s.occupancyCard}>
              <View style={s.occupancyHeader}>
                <View>
                  <Text style={s.occupancyTitle}>Ticket Sales</Text>
                  <Text style={s.occupancySub}>{stats.booked || 0} of {stats.total || 0} seats booked</Text>
                </View>
                <Text style={[s.occupancyPct, { color: occupancyPct > 80 ? '#FF6B61' : '#00D4AA' }]}>{occupancyPct}%</Text>
              </View>
              <View style={s.occupancyBar}>
                <LinearGradient
                  colors={occupancyPct > 80 ? ['#FF3B30', '#FFB300'] : ['#00D4AA', '#00B0FF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.occupancyFill, { width: `${occupancyPct}%` }]}
                />
              </View>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════
            PRICING TIERS — Colored glow borders
            ═══════════════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: '#FFD700' }]} />
            <Text style={s.sectionTitle}>Ticket Pricing</Text>
          </View>
          <View style={s.pricingRow}>
            {PRICING_TIERS.map((p) => (
              <View key={p.label} style={[s.priceCard, { borderColor: `${p.color}30`, shadowColor: p.color }]}>
                <LinearGradient colors={[`${p.color}15`, `${p.color}05`]} style={s.priceCardInner}>
                  <Text style={s.priceIcon}>{p.icon}</Text>
                  <Text style={[s.priceValue, { color: p.color }]}>Rs.{p.value}</Text>
                  <Text style={s.priceLabel}>{p.label}</Text>
                  <Text style={s.priceSeats}>{p.seats} seats</Text>
                  <Text style={s.priceDesc}>{p.desc}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            STADIUM LAYOUT
            ═══════════════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: '#00B0FF' }]} />
            <Text style={s.sectionTitle}>Stadium Layout</Text>
          </View>
          <View style={s.layoutCard}>
            <View style={s.layoutRow}>
              {[
                { label: 'Rows', value: match.seatLayout?.rows ?? 0 },
                { label: 'Seats/Row', value: match.seatLayout?.seatsPerRow ?? 0 },
                { label: 'VIP Rows', value: match.seatLayout?.vipRows ?? 0 },
              ].map((item, idx) => (
                <React.Fragment key={item.label}>
                  {idx > 0 && <View style={s.layoutDivider} />}
                  <View style={s.layoutItem}>
                    <Text style={s.layoutLabel}>{item.label}</Text>
                    <Text style={s.layoutValue}>{item.value}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            ABOUT
            ═══════════════════════════════════════════════ */}
        {match.description ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: '#94A3B8' }]} />
              <Text style={s.sectionTitle}>About This Match</Text>
            </View>
            <View style={s.aboutCard}>
              <Text style={s.aboutText}>{match.description}</Text>
            </View>
          </View>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════
          STICKY CTA — Gradient + glow
          ═══════════════════════════════════════════════ */}
      <View style={s.stickyCta}>
        {!isAdmin && match.status !== 'cancelled' ? (
          <TouchableOpacity style={s.ctaButton} onPress={() => navigation.navigate('SeatSelection', { matchId: match._id })} activeOpacity={0.88}>
            <LinearGradient colors={['#7B61FF', '#5A3FD6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaGradient}>
              <Text style={s.ctaText}>Select & Book Seats</Text>
              <Text style={s.ctaArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isAdmin && match.status !== 'cancelled' ? (
          <TouchableOpacity style={s.ctaButton} onPress={handleCancel} activeOpacity={0.88}>
            <LinearGradient colors={[colors.danger, '#CC2F26']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaGradient}>
              <Text style={s.ctaText}>{isCancelling ? 'Cancelling...' : 'Cancel Match'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={s.cancelledBanner}>
            <Text style={s.cancelledText}>This match has been cancelled</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  /* ── Shell ── */
  container: { flex: 1, backgroundColor: '#0F111A' },
  scroll: {},
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  errorIcon: { fontSize: 48, marginBottom: spacing.lg },
  errorText: { color: colors.danger, fontSize: typography.body.fontSize, textAlign: 'center', marginBottom: spacing.lg },
  errorBack: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radii.full, backgroundColor: 'rgba(108,92,231,0.15)' },
  errorBackText: { color: colors.primaryLight, fontWeight: '700' },

  /* ═══════════════════════════════════════════════
     HERO — Cinematic full-bleed
     ═══════════════════════════════════════════════ */
  hero: {
    position: 'relative',
    minHeight: SCREEN_H * 0.48,
    overflow: 'hidden',
  },
  heroBanner: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    paddingTop: spacing.huge + 16,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    justifyContent: 'flex-end',
    minHeight: SCREEN_H * 0.48,
  },

  /* Back — frosted glass */
  backBtn: {
    position: 'absolute',
    top: spacing.huge + 12,
    left: spacing.xl,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },

  /* Status — floating badge */
  statusBadge: {
    position: 'absolute',
    top: spacing.huge + 12,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    zIndex: 10,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },

  /* Teams — the visual centerpiece */
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  teamBlock: { alignItems: 'center', flex: 1 },
  logoGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  teamLogo: { width: 52, height: 52 },
  teamEmojiFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  teamEmoji: { fontSize: 36 },
  teamName: { color: 'rgba(255,255,255,0.9)', fontSize: typography.captionMedium.fontSize, fontWeight: '700', textAlign: 'center' },

  vsBlock: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  vsInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 26,
  },
  vsText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 3 },

  heroTitle: {
    color: '#FFF',
    fontSize: typography.h1.fontSize,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  metaIcon: { fontSize: 11 },
  metaText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.small.fontSize, fontWeight: '600' },
  metaMono: { color: '#00D4AA', fontSize: typography.small.fontSize, fontWeight: '700', fontFamily: 'Menlo' },

  /* ═══════════════════════════════════════════════
     SECTIONS — Shared
     ═══════════════════════════════════════════════ */
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', letterSpacing: -0.3 },

  /* ═══════════════════════════════════════════════
     QUICK STATS — Colored accent cards
     ═══════════════════════════════════════════════ */
  quickStats: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: { fontSize: 14 },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 1 },
  statLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' },

  /* ═══════════════════════════════════════════════
     OCCUPANCY
     ═══════════════════════════════════════════════ */
  occupancyCard: {
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  occupancyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  occupancyTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.captionMedium.fontSize },
  occupancySub: { color: colors.textMuted, fontSize: typography.small.fontSize, marginTop: 2 },
  occupancyPct: { fontWeight: '900', fontSize: 28 },
  occupancyBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  occupancyFill: { height: '100%', borderRadius: 3 },

  /* ═══════════════════════════════════════════════
     PRICING — Glow borders
     ═══════════════════════════════════════════════ */
  pricingRow: { flexDirection: 'row', gap: spacing.md },
  priceCard: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  priceCardInner: { padding: spacing.lg, alignItems: 'center' },
  priceIcon: { fontSize: 24, marginBottom: spacing.sm },
  priceValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  priceLabel: { color: colors.textPrimary, fontSize: typography.tiny.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  priceSeats: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginBottom: spacing.xs },
  priceDesc: { color: colors.textMuted, fontSize: 8, fontWeight: '500', textAlign: 'center' },

  /* ═══════════════════════════════════════════════
     LAYOUT
     ═══════════════════════════════════════════════ */
  layoutCard: {
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  layoutRow: { flexDirection: 'row', alignItems: 'center' },
  layoutItem: { flex: 1, alignItems: 'center' },
  layoutDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' },
  layoutLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginBottom: spacing.xs },
  layoutValue: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900' },

  /* ═══════════════════════════════════════════════
     ABOUT
     ═══════════════════════════════════════════════ */
  aboutCard: {
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  aboutText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, lineHeight: 20 },

  /* ═══════════════════════════════════════════════
     STICKY CTA — Gradient + glow
     ═══════════════════════════════════════════════ */
  stickyCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15,17,26,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl + 8,
  },
  ctaButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaGradient: {
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  ctaArrow: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  cancelledBanner: {
    flex: 1,
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  cancelledText: { color: '#FF6B61', fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
