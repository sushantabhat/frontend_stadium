import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchMatches } from '../../services/matchService';

/* ─── Mock promotional campaign data ───
 * In production, this would come from a /api/promotions endpoint.
 * Static demo data allows the UI to render without backend changes. */
const PROMO_CAMPAIGNS = [
  {
    id: 'promo-1',
    title: 'IPL Finals — Early Bird Offer',
    subtitle: '20% off on all Premium seats',
    tag: 'SPONSOR',
    accent: glass.neonMagenta,
    impressions: 12400,
    clicks: 1860,
    conversions: 340,
  },
  {
    id: 'promo-2',
    title: 'Student Season Pass',
    subtitle: 'Unlimited general access for Rs.4,999',
    tag: 'VOUCHER',
    accent: glass.neonCyan,
    impressions: 8200,
    clicks: 2100,
    conversions: 620,
  },
  {
    id: 'promo-3',
    title: 'VIP Corporate Box — Diwali Special',
    subtitle: 'Complimentary catering + parking',
    tag: 'PREMIUM',
    accent: glass.neonPurple,
    impressions: 3600,
    clicks: 540,
    conversions: 85,
  },
];

export default function PromotionalHubScreen({ navigation }) {
  /* ── State: matches for featured events ── */
  const [featuredMatches, setFeaturedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  /* ── Data loading: fetch matches for featured event cards ── */
  const loadData = useCallback(async () => {
    try {
      const matches = await fetchMatches(true);
      /* Take top 5 upcoming/live matches as featured */
      const featured = matches
        .filter(m => m.status === 'upcoming' || m.status === 'live')
        .slice(0, 5);
      setFeaturedMatches(featured);
    } catch (err) {
      console.log('Promotional hub data error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { refreshing, onRefresh } = useRefresh(loadData);

  /* ── Focus-based refresh ── */
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  /* ── Helper: format large numbers ── */
  const formatNumber = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  /* ── Helper: compute CTR percentage ── */
  const ctr = (clicks, impressions) => {
    if (!impressions) return '0.0';
    return ((clicks / impressions) * 100).toFixed(1);
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScreenHeader
          title="Promotions Hub"
          subtitle="Banner management & sponsorship analytics"
          onBack={() => navigation.goBack()}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={glass.neonPurple} />
          </View>
        ) : (
          <FlatList
            data={PROMO_CAMPAIGNS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
            ListHeaderComponent={
              <>
                {/* ═══ FEATURED EVENTS CAROUSEL ═══ */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Featured Events</Text>
                  <Text style={styles.sectionSubtitle}>Highlight upcoming matches for promotion</Text>
                </View>

                <FlatList
                  data={featuredMatches}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carousel}
                  keyExtractor={(item) => item._id || String(item.id)}
                  ListEmptyComponent={
                    <View style={styles.emptyCarousel}>
                      <Text style={styles.emptyCarouselText}>No featured events</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.featuredCard} activeOpacity={0.8}>
                      <LinearGradient
                        colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.featuredInner}
                      >
                        {/* Neon border accent */}
                        <View style={[styles.featuredAccent, { backgroundColor: glass.neonPurple }]} />
                        <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.featuredVenue} numberOfLines={1}>{item.venue || 'Venue TBD'}</Text>
                        <View style={styles.featuredStatus}>
                          <View style={[styles.featuredDot, {
                            backgroundColor: item.status === 'live' ? glass.statusDangerText : glass.statusSuccessText,
                          }]} />
                          <Text style={styles.featuredStatusText}>{item.status?.toUpperCase()}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                />

                {/* ═══ PROMOTIONAL CAMPAIGNS ═══ */}
                <View style={[styles.section, { marginTop: spacing.xl }]}>
                  <Text style={styles.sectionTitle}>Active Campaigns</Text>
                  <Text style={styles.sectionSubtitle}>Live promotional banners and sponsorships</Text>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <View style={styles.campaignCard}>
                <LinearGradient
                  colors={[`${item.accent}12`, 'rgba(18,21,34,0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.campaignInner}
                >
                  {/* Neon border glow */}
                  <View style={[styles.campaignBorder, { borderColor: `${item.accent}30` }]} />

                  {/* Campaign header */}
                  <View style={styles.campaignHeader}>
                    <View style={[styles.campaignTag, { backgroundColor: `${item.accent}20` }]}>
                      <Text style={[styles.campaignTagText, { color: item.accent }]}>{item.tag}</Text>
                    </View>
                  </View>

                  {/* Campaign content */}
                  <Text style={styles.campaignTitle}>{item.title}</Text>
                  <Text style={styles.campaignSubtitle}>{item.subtitle}</Text>

                  {/* Conversion analytics — twin micro-insight boxes */}
                  <View style={styles.analyticsRow}>
                    <View style={styles.analyticsBox}>
                      <Text style={styles.analyticsValue}>{ctr(item.clicks, item.impressions)}%</Text>
                      <Text style={styles.analyticsLabel}>CTR</Text>
                    </View>
                    <View style={styles.analyticsDivider} />
                    <View style={styles.analyticsBox}>
                      <Text style={styles.analyticsValue}>{formatNumber(item.conversions)}</Text>
                      <Text style={styles.analyticsLabel}>Conversions</Text>
                    </View>
                    <View style={styles.analyticsDivider} />
                    <View style={styles.analyticsBox}>
                      <Text style={styles.analyticsValue}>{formatNumber(item.impressions)}</Text>
                      <Text style={styles.analyticsLabel}>Impressions</Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min((item.conversions / item.clicks) * 100, 100)}%`,
                          backgroundColor: item.accent,
                        },
                      ]}
                    />
                  </View>
                </LinearGradient>
              </View>
            )}
            ListFooterComponent={<View style={{ height: spacing.xxxl + 20 }} />}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Canvas ── */
  container: { flex: 1, backgroundColor: glass.canvasStart },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing.xxl },

  /* ── Sections ── */
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.xxs },
  sectionSubtitle: { color: glass.textMuted, fontSize: typography.small.fontSize },

  /* ── Featured Events Carousel ── */
  carousel: { paddingLeft: spacing.xl, paddingRight: spacing.sm, gap: spacing.md },
  featuredCard: {
    width: 200, borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: glass.border,
  },
  featuredInner: { padding: spacing.xl, minHeight: 140, justifyContent: 'flex-end' },
  featuredAccent: { position: 'absolute', top: 0, left: 0, width: 3, height: '100%', borderTopLeftRadius: radii.xl, borderBottomLeftRadius: radii.xl },
  featuredTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  featuredVenue: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.md },
  featuredStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  featuredDot: { width: 6, height: 6, borderRadius: 3 },
  featuredStatusText: { color: glass.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },

  emptyCarousel: {
    width: 200, height: 140, borderRadius: radii.xl,
    backgroundColor: glass.surface, borderWidth: 1, borderColor: glass.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: spacing.xl,
  },
  emptyCarouselText: { color: glass.textMuted, fontSize: typography.small.fontSize },

  /* ── Campaign Cards ── */
  campaignCard: {
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    borderRadius: radii.xl, overflow: 'hidden',
  },
  campaignInner: {
    padding: spacing.xl, borderWidth: 1, borderColor: glass.border,
    borderRadius: radii.xl,
  },
  campaignBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radii.xl, borderWidth: 1,
  },

  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  campaignTag: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  campaignTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },

  campaignTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  campaignSubtitle: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.xl },

  /* ── Analytics Row (twin micro-insight boxes) ── */
  analyticsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radii.md,
    padding: spacing.md, marginBottom: spacing.md,
  },
  analyticsBox: { flex: 1, alignItems: 'center' },
  analyticsValue: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', fontFamily: glass.monoFont },
  analyticsLabel: { color: glass.textMuted, fontSize: 9, marginTop: spacing.xxs, fontWeight: '600' },
  analyticsDivider: { width: 1, height: 28, backgroundColor: glass.border },

  /* ── Progress Bar ── */
  progressBarBg: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },
});
