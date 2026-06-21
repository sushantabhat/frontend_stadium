import React, { useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchMatchRecommendations } from '../../services/aiService';
import MatchCard from '../../components/MatchCard';
import BannerCarousel from '../../components/BannerCarousel';
import DashboardHeader from '../../components/DashboardHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FanDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      setLoadError('');
      const data = await fetchMatchRecommendations();
      setRecommendations(data);
    } catch {
      setLoadError('Failed to load matches. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(() => { loadData(true); }, [loadData]);

  const firstName = userInfo?.name?.split(' ')[0] || 'Fan';
  const initials = (userInfo?.name || 'F').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const upcomingMatches = recommendations.filter(m => m.status === 'upcoming');
  const liveMatches = recommendations.filter(m => m.status === 'live');
  const otherMatches = recommendations.filter(m => m.status !== 'upcoming' && m.status !== 'live');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Top Bar — asymmetric */}
        <DashboardHeader
          topLabel="WELCOME BACK"
          title={`${firstName} 👋`}
          avatarColors={colors.gradientPurple}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('Account')}
        />

        {/* Hero Banner Carousel */}
        <BannerCarousel
          onBannerPress={(banner) => {
            if (banner.id === '1' || banner.id === '2') {
              navigation.navigate('Browse');
            }
          }}
        />

        {/* Quick actions — scrollable */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsList}>
            {[
              { icon: '🔍', label: 'Browse Matches', route: 'Browse' },
              { icon: '🎫', label: 'My Tickets', route: 'My Tickets' },
              { icon: '❤️', label: 'Wishlist', route: 'Wishlist' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.pill}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.pillIcon}>{item.icon}</Text>
                <Text style={styles.pillLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {/* Live Now */}
        {!isLoading && liveMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={styles.sectionHeadLeft}>
                <View style={styles.liveDot} />
                <Text style={styles.sectionTitle}>Live Now</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Browse')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            {liveMatches.slice(0, 2).map((match, idx) => (
              <View key={match._id || match.id || idx} style={styles.matchItem}>
                <MatchCard
                  match={match}
                  variant="horizontal"
                  tintIndex={idx}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: match._id || match.id })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Matches — horizontal scroll */}
        {!isLoading && upcomingMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Browse')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {upcomingMatches.slice(0, 6).map((item, index) => (
                <View key={item._id || item.id} style={styles.horizontalCard}>
                  <MatchCard
                    match={item}
                    variant="horizontal"
                    tintIndex={index + 2}
                    onPress={() => navigation.navigate('MatchDetail', { matchId: item._id || item.id })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending — full width stacked */}
        {!isLoading && otherMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Trending</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Browse')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            {otherMatches.slice(0, 3).map((match, idx) => (
              <View key={match._id || match.id || idx} style={styles.matchItem}>
                <MatchCard
                  match={match}
                  variant="horizontal"
                  tintIndex={idx + 4}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: match._id || match.id })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Recommended for You — hero variant */}
        {!isLoading && recommendations.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
            <MatchCard
              match={recommendations[1]}
              variant="hero"
              tintIndex={6}
              onPress={() => navigation.navigate('MatchDetail', { matchId: recommendations[1]._id || recommendations[1].id })}
            />
          </View>
        )}

        {/* Empty state */}
        {recommendations.length === 0 && !isLoading && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{loadError ? '⚠️' : '🏟️'}</Text>
            <Text style={styles.emptyTitle}>{loadError ? 'Something went wrong' : 'Nothing here yet'}</Text>
            <Text style={styles.emptyText}>{loadError || 'Matches will appear once the admin creates them'}</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.lg },
  loadingWrap: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAll: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },

  // Pills — horizontal scroll
  pillsList: {
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pillIcon: { fontSize: 14 },
  pillLabel: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },

  // Horizontal match list
  horizontalList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  horizontalCard: {
    width: SCREEN_WIDTH * 0.72,
  },

  matchItem: {
    marginBottom: spacing.md,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 52,
  },
});
