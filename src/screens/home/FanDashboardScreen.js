import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMatchRecommendations } from '../../services/aiService';

export default function FanDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchMatchRecommendations();
      setRecommendations(data);
    } catch (e) {
      console.log('Recommendations error:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setIsRefreshing(true); loadData(); };

  const firstName = userInfo?.name?.split(' ')[0] || 'Fan';
  const initials = (userInfo?.name || 'F').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primaryLight} colors={[colors.primary]} />
        }
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
            <Text style={styles.tagline}>Find your next match</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Hero */}
        <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => navigation.navigate('MatchDetail', { matchId: recommendations[0]?._id || recommendations[0]?.id })}>
          <View style={styles.heroGradient}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🏏 FEATURED</Text>
            </View>
            <Text style={styles.heroTitle}>Live Match{'\n'}Booking</Text>
            <Text style={styles.heroDesc}>Browse upcoming cricket matches and book your seats instantly.</Text>
            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Explore Now</Text>
              <Text style={styles.heroCtaArrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: '🔍', label: 'Browse\nMatches', route: 'Browse', color: colors.primary },
              { icon: '🎫', label: 'My\nTickets', route: 'My Tickets', color: colors.success },
              { icon: '❤️', label: 'My\nWishlist', route: 'Wishlist', color: colors.accent },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => navigation.navigate(a.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: `${a.color}18` }]}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.primaryLight} />
            </View>
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏟️</Text>
              <Text style={styles.emptyText}>No matches yet. Check back soon!</Text>
            </View>
          ) : (
            <View style={styles.matchList}>
              {recommendations.slice(0, 5).map((match, idx) => (
                <TouchableOpacity
                  key={match._id || match.id || idx}
                  style={styles.matchCard}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: match._id || match.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.matchCardLeft}>
                    <View style={styles.matchDateBadge}>
                      <Text style={styles.matchDateDay}>{new Date(match.matchDate).getDate()}</Text>
                      <Text style={styles.matchDateMonth}>{new Date(match.matchDate).toLocaleString('default', { month: 'short' })}</Text>
                    </View>
                  </View>
                  <View style={styles.matchCardCenter}>
                    <Text style={styles.matchTeams}>{match.teamA} vs {match.teamB}</Text>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <Text style={styles.matchVenue}>📍 {match.venue}</Text>
                  </View>
                  <View style={styles.matchCardRight}>
                    {match.stats?.available > 0 ? (
                      <View style={styles.seatsBadge}>
                        <Text style={styles.seatsText}>{match.stats.available}</Text>
                        <Text style={styles.seatsLabel}>seats</Text>
                      </View>
                    ) : (
                      <View style={[styles.seatsBadge, styles.soldOutBadge]}>
                        <Text style={[styles.seatsText, styles.soldOutText]}>Full</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.md },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: `${colors.primary}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryLight,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
  },

  // Hero
  hero: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    ...shadows.lg,
  },
  heroGradient: {
    padding: spacing.xxl,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.caption.fontSize,
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 260,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  heroCtaText: { color: '#FFF', fontSize: typography.captionMedium.fontSize, fontWeight: '800' },
  heroCtaArrow: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Sections
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  seeAll: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Match list
  loadingWrap: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize },

  matchList: { gap: spacing.md },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
  },
  matchCardLeft: {},
  matchDateBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchDateDay: {
    color: colors.primaryLight,
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
    lineHeight: 22,
  },
  matchDateMonth: {
    color: colors.primaryLight,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  matchCardCenter: { flex: 1 },
  matchTeams: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  matchTitle: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    marginBottom: spacing.xxs,
  },
  matchVenue: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
  },
  matchCardRight: {},
  seatsBadge: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  seatsText: {
    color: colors.successLight,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
  },
  seatsLabel: {
    color: colors.success,
    fontSize: typography.tiny.fontSize - 1,
    fontWeight: '600',
  },
  soldOutBadge: {
    backgroundColor: colors.dangerSurface,
    borderColor: `${colors.danger}30`,
  },
  soldOutText: { color: colors.dangerLight },
});
