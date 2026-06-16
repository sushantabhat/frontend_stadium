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
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchMatchRecommendations } from '../../services/aiService';
import MatchCard from '../../components/MatchCard';
import SectionHeader from '../../components/SectionHeader';

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
      console.log('Error:', e.message);
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primaryLight} colors={[colors.primary]} />}
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

        {/* Featured Match (Hero) */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : recommendations.length > 0 ? (
          <View style={styles.section}>
            <MatchCard
              match={recommendations[0]}
              variant="hero"
              onPress={() => navigation.navigate('MatchDetail', { matchId: recommendations[0]._id || recommendations[0].id })}
            />
          </View>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsRow}>
            {[
              { icon: '🔍', label: 'Browse', route: 'Browse', color: colors.primary },
              { icon: '🎫', label: 'My Tickets', route: 'My Tickets', color: colors.success },
              { icon: '❤️', label: 'Wishlist', route: 'Wishlist', color: colors.accent },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                onPress={() => navigation.navigate(a.route)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[`${a.color}25`, `${a.color}08`]}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* More Matches */}
        {recommendations.length > 1 && (
          <View style={styles.section}>
            <SectionHeader
              title="Upcoming Matches"
              actionText="See All →"
              onAction={() => navigation.navigate('Browse')}
            />
            <View style={styles.matchList}>
              {recommendations.slice(1, 6).map((match, idx) => (
                <View key={match._id || match.id || idx} style={styles.matchItem}>
                  <MatchCard
                    match={match}
                    variant="horizontal"
                    onPress={() => navigation.navigate('MatchDetail', { matchId: match._id || match.id })}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {recommendations.length === 0 && !isLoading && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptyText}>Check back soon for upcoming events!</Text>
          </View>
        )}

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.md },

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

  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },

  loadingWrap: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: { fontSize: 24 },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },

  // Match list
  matchList: { gap: spacing.md },
  matchItem: {},

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
});
