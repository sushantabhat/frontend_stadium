import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import MatchCard from '../../components/MatchCard';
import EmptyState from '../../components/EmptyState';
import { fetchMatches } from '../../services/matchService';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

export default function AdminMatchListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError('');
      const data = await fetchMatches(true);
      setMatches(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Manage Matches"
        subtitle="Create events and monitor seat inventory"
        rightAction={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('AdminCreateMatch')}
          >
            <Text style={styles.createButtonText}>+ Create Match</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <EmptyState icon="⚠️" title="Could not load matches" message={error} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadMatches(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📊"
              title="No matches yet"
              message="Create your first cricket match to start selling tickets."
            />
          }
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() => navigation.navigate('AdminMatchDetail', { matchId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 1.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: typography.caption.fontSize,
  },
});
