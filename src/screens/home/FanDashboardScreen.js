import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import ProfileMenuButton from '../../components/profile/ProfileMenuButton';
import { colors } from '../../constants/theme';
import { fetchMatchRecommendations } from '../../services/aiService';
import { formatMatchDate } from '../../utils/date';

const shortcuts = [
  { title: 'Matches', icon: '🏏', route: 'MatchList', accent: colors.primaryLight },
  { title: 'Tickets', icon: '🎫', route: 'MyTickets', accent: '#22C55E' },
  { title: 'Wishlist', icon: '❤️', route: 'Wishlist', accent: '#F43F5E' },
  { title: 'Profile', icon: '👤', route: 'Profile', accent: '#A78BFA' },
];

export default function FanDashboardScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = (route) => navigation.navigate(route);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const data = await fetchMatchRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.log('Error loading recommendations:', error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.roleBadge}>FAN HOME</Text>
            <Text style={styles.title}>Hi {userInfo?.name || 'Fan'}</Text>
            <Text style={styles.subtitle}>Browse matches, manage tickets, and book seats quickly.</Text>
          </View>
          <ProfileMenuButton />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Next up</Text>
          <Text style={styles.heroTitle}>Live booking starts now</Text>
          <Text style={styles.heroText}>See upcoming matches and open your next ticket in just a few taps.</Text>
          <TouchableOpacity style={styles.heroButton} onPress={() => navigate('MatchList')}>
            <Text style={styles.heroButtonText}>Explore matches</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shortcutRow}>
          {shortcuts.map((item) => (
            <TouchableOpacity key={item.title} style={styles.shortcutCard} onPress={() => navigate(item.route)}>
              <View style={[styles.shortcutIconWrap, { backgroundColor: `${item.accent}20` }]}>
                <Text style={styles.shortcutIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.shortcutTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🤖 Smart Recommendations</Text>
          <Text style={styles.sectionCaption}>AI-curated matches based on your interest</Text>
        </View>

        <View style={styles.matchList}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primaryLight} style={{ marginVertical: 16 }} />
          ) : recommendations.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 16 }}>
              No recommended matches available.
            </Text>
          ) : (
            recommendations.map((match) => (
              <TouchableOpacity
                key={match._id || match.id}
                style={styles.matchCard}
                onPress={() => navigation.navigate('MatchDetail', { matchId: match._id || match.id })}
              >
                <View style={styles.matchTopRow}>
                  <Text style={styles.matchTag}>{match.reason || 'AI PICK'}</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>Score: {match.score}</Text>
                  </View>
                  <Text style={styles.matchArrow}>›</Text>
                </View>
                <Text style={styles.matchTitle}>{match.title}</Text>
                <Text style={styles.matchMeta}>
                  📍 {match.venue} • 🗓 {formatMatchDate(match.matchDate)}
                </Text>
                {match.stats && (
                  <Text style={styles.matchStats}>
                    {match.stats.available}/{match.stats.total} seats available
                  </Text>
                )}
                {match.allReasons && match.allReasons.length > 1 && (
                  <Text style={styles.matchInsight}>
                    💡 {match.allReasons.slice(1, 3).join(' • ')}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>Your tickets</Text>
          <Text style={styles.bottomLine}>3 active tickets ready to view</Text>
          <Text style={styles.bottomLine}>2 matches saved to wishlist</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  roleBadge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
    maxWidth: 260,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 280,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  heroButtonText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 14,
  },
  shortcutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  shortcutCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
  },
  shortcutIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutIcon: {
    fontSize: 20,
  },
  shortcutTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCaption: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  matchList: {
    gap: 10,
    marginBottom: 18,
  },
  matchCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  matchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchTag: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  matchArrow: {
    color: colors.primaryLight,
    fontSize: 28,
    lineHeight: 28,
  },
  matchTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  matchMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  matchStats: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  matchInsight: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
  scoreBadge: {
    backgroundColor: `${colors.primary}30`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bottomTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  bottomLine: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 15,
  },
});
