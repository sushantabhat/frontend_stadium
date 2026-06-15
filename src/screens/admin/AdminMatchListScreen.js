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
import { colors, commonStyles } from '../../constants/theme';

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
            style={commonStyles.primaryButton}
            onPress={() => navigation.navigate('CreateMatch')}
          >
            <Text style={commonStyles.primaryButtonText}>+ Create Match</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
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
              tintColor={colors.primaryLight}
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
              onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
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
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
