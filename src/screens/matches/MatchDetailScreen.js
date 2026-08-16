import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { ROLES } from '../../constants/config';
import { cancelMatch, fetchMatchById } from '../../services/matchService';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { formatInNepal, formatTimeInNepal } from '../../utils/date';
import { imageUri } from '../../utils/imageUri';

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
  const loadMatch = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try { setError(''); setMatch(await fetchMatchById(matchId)); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load match details'); }
    finally { setIsLoading(false); }
  }, [matchId]);

  const { refreshing, onRefresh } = useRefresh(() => loadMatch(true));

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
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    </SafeAreaView>
  );

  if (error || !match) return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.center}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error || 'Match not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.errorBack}>
          <Text style={s.errorBackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const stats = match.seatStats || {};
  const status = getStatusConfig(match.status);
  const dateStr = formatInNepal(match.matchDate, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = formatTimeInNepal(match.matchDate, { hour: '2-digit', minute: '2-digit', hour12: true });
  const occupancyPct = stats.total > 0 ? Math.round(((stats.total - (stats.available || 0)) / stats.total) * 100) : 0;
  const hasImage = Boolean(match.imageUrl);

  const CATEGORY_DISPLAY = {
    platinum: { label: 'Platinum', color: '#E8E8E8', glow: 'rgba(232,232,232,0.25)', icon: '💎', desc: 'Premium tier' },
    gold: { label: 'Gold', color: '#FFD700', glow: 'rgba(255,215,0,0.25)', icon: '⭐', desc: 'Great sightlines' },
    silver: { label: 'Silver', color: '#A8A8A8', glow: 'rgba(168,168,168,0.25)', icon: '🎫', desc: 'Standard seating' },
    bronze: { label: 'Bronze', color: '#CD7F32', glow: 'rgba(205,127,50,0.25)', icon: '🎫', desc: 'Standard seating' },
    general: { label: 'General', color: '#5B9BD5', glow: 'rgba(91,155,213,0.25)', icon: '🎫', desc: 'Standard seating' },
    supporters: { label: 'Supporters', color: '#81C784', glow: 'rgba(129,199,132,0.25)', icon: '💚', desc: 'Supporters tier' },
    premium: { label: 'Premium', color: '#A29BFE', glow: 'rgba(162,155,254,0.25)', icon: '⭐', desc: 'Great sightlines' },
    category1: { label: 'Category 1', color: '#FFD700', glow: 'rgba(255,215,0,0.25)', icon: '⭐', desc: 'Great sightlines' },
    category2: { label: 'Category 2', color: '#FF6B6B', glow: 'rgba(255,107,107,0.25)', icon: '🎫', desc: 'Standard seating' },
    category3: { label: 'Category 3', color: '#A29BFE', glow: 'rgba(162,155,254,0.25)', icon: '🎫', desc: 'Standard seating' },
    category4: { label: 'Category 4', color: '#EF5350', glow: 'rgba(239,83,80,0.25)', icon: '🎫', desc: 'Standard seating' },
  };

  const pricingObj = match.pricing || {};
  const PRICING_TIERS = Object.entries(pricingObj)
    .filter(([, value]) => typeof value === 'number' && value > 0)
    .map(([key, value]) => ({
      key,
      value,
      seats: stats[key] || 0,
      ...(CATEGORY_DISPLAY[key] || { label: key, color: '#888', glow: 'rgba(136,136,136,0.25)', icon: '🎫', desc: '' }),
    }));

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} bounces={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}>

          {/* ═══════════════════════════════════════════════
              HERO — Full-bleed cinematic banner
              ═══════════════════════════════════════════════ */}
          <View style={s.hero}>
            {hasImage && <Image source={{ uri: imageUri(match.imageUrl) }} style={s.heroBanner} resizeMode="cover" />}

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
                      <Image source={{ uri: imageUri(match.teamALogo) }} style={s.teamLogo} resizeMode="contain" />
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
                      <Image source={{ uri: imageUri(match.teamBLogo) }} style={s.teamLogo} resizeMode="contain" />
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
              STATS ROW — Clean single-line stats
              ═══════════════════════════════════════════════ */}
          <View style={s.bodySection}>
            <View style={s.statsRow}>
              {[
                { label: 'Available', value: stats.available || 0, color: '#00E676' },
                { label: 'Booked', value: stats.booked || 0, color: '#FFB300' },
                { label: 'Sold', value: `${occupancyPct}%`, color: '#00B0FF' },
              ].map((st, i) => (
                <React.Fragment key={st.label}>
                  {i > 0 && <View style={s.statDivider} />}
                  <View style={s.statCell}>
                    <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
            {stats.total > 0 && (
              <View style={s.occupancyBar}>
                <LinearGradient
                  colors={occupancyPct > 80 ? ['#FF3B30', '#FFB300'] : ['#00D4AA', '#00B0FF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.occupancyFill, { width: `${occupancyPct}%` }]}
                />
              </View>
            )}
          </View>

          {/* ═══════════════════════════════════════════════
              PRICING — Horizontal scroll pills
              ═══════════════════════════════════════════════ */}
          <View style={s.bodySection}>
            <Text style={s.bodyLabel}>Pricing</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pricingRow}>
              {PRICING_TIERS.map((p) => (
                <View key={p.label} style={[s.priceCell, { borderColor: `${p.color}33` }]}>
                  <View style={s.priceHeader}>
                    <View style={[s.priceIconBadge, { backgroundColor: `${p.color}22` }]}>
                      <Text style={[s.priceIconText, { color: p.color }]}>{p.label.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text
                      style={[s.priceLabel, { color: p.color }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {p.label}
                    </Text>
                  </View>
                  <Text style={[s.priceValue, { color: p.color }]} numberOfLines={1}>
                    Rs.{p.value.toLocaleString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ═══════════════════════════════════════════════
              STADIUM — One-liner
              ═══════════════════════════════════════════════ */}
          <View style={s.bodySection}>
            <Text style={s.bodyLabel}>Stadium</Text>
            <View style={s.infoRow}>
              {match.stadiumSections && match.stadiumSections.length > 0 ? (
                <>
                  <Text style={s.infoText}>{match.stadiumSections.length} Sections</Text>
                  <View style={s.infoDot} />
                  <Text style={s.infoText}>{stats.total || match.totalSeats || 0} Seats</Text>
                </>
              ) : (
                <>
                  <Text style={s.infoText}>{match.seatLayout?.rows ?? 0} Rows</Text>
                  <View style={s.infoDot} />
                  <Text style={s.infoText}>{match.seatLayout?.seatsPerRow ?? 0} Seats/Row</Text>
                </>
              )}
            </View>
          </View>

          {/* ═══════════════════════════════════════════════
              ABOUT
              ═══════════════════════════════════════════════ */}
          {match.description ? (
            <View style={s.bodySection}>
              <Text style={s.bodyLabel}>About</Text>
              <Text style={s.aboutText}>{match.description}</Text>
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
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  /* ── Shell ── */
  container: { flex: 1 },
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
     BODY SECTIONS — Clean & minimal
     ═══════════════════════════════════════════════ */
  bodySection: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  bodyLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.sm },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)' },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: 2 },
  statLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  occupancyBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginTop: spacing.md },
  occupancyFill: { height: '100%', borderRadius: 2 },

  pricingRow: {
    paddingLeft: spacing.xs,
    paddingRight: spacing.xl,
  },
  priceCell: {
    minWidth: 140,
    padding: spacing.lg,
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginRight: spacing.sm,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  priceIconBadge: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  priceIconText: { fontSize: 11, fontWeight: '800' },
  priceLabel: { fontSize: 12, fontWeight: '700' },
  priceValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.md,
  },
  infoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  infoText: { color: colors.textSecondary, fontSize: typography.small.fontSize, fontWeight: '600' },

  aboutText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 20,
    backgroundColor: 'rgba(26,29,42,0.8)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

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
