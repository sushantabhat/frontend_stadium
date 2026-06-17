import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TicketProHeader, { AdminFilterPills, AdminPageTitle, AdminSearchBar } from '../../components/admin/TicketProHeader';
import EmptyState from '../../components/EmptyState';
import { cancelMatch, fetchMatches } from '../../services/matchService';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'on_sale', label: 'On Sale' },
  { key: 'upcoming', label: 'Upcoming' },
];

function matchesFilter(match, filterKey) {
  const available = match.seatStats?.available ?? 0;
  switch (filterKey) {
    case 'live':
      return match.status === 'live';
    case 'on_sale':
      return match.status === 'upcoming' && available > 0;
    case 'upcoming':
      return match.status === 'upcoming';
    default:
      return true;
  }
}

function matchesSearch(match, query) {
  if (!query.trim()) return true;
  const haystack = [
    match.title,
    match.teamA,
    match.teamB,
    match.venue,
    match.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export default function AdminMatchListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      setError(err.response?.data?.message || 'Failed to load events');
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

  const liveCount = matches.filter((m) => m.status === 'live').length;

  const filteredMatches = useMemo(
    () => matches.filter((m) => matchesFilter(m, activeFilter) && matchesSearch(m, searchQuery)),
    [matches, activeFilter, searchQuery]
  );

  const handleDelete = async (match) => {
    try {
      await cancelMatch(match._id);
      setMatches((prev) =>
        prev.map((item) =>
          item._id === match._id ? { ...item, status: 'cancelled' } : item
        )
      );
      Alert.alert('Deleted', 'Event has been cancelled.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete event');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <TicketProHeader showLive={liveCount > 0} />
      <AdminPageTitle
        eyebrow="MANAGEMENT"
        title="Events"
        action={
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate('AdminCreateMatch')}
            activeOpacity={0.85}
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        }
      />
      <AdminSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search events..."
        onClear={() => setSearchQuery('')}
      />
      <AdminFilterPills options={FILTERS} value={activeFilter} onChange={setActiveFilter} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={glass.brandPurple} />
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          {renderHeader()}
          <EmptyState icon="⚠️" title="Could not load events" description={error} />
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item._id || String(item.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadMatches(true)}
              tintColor={glass.brandPurple}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title={searchQuery || activeFilter !== 'all' ? 'No matching events' : 'No events yet'}
              description={
                searchQuery || activeFilter !== 'all'
                  ? 'Try a different search or filter.'
                  : 'Create your first event to start selling tickets.'
              }
            />
          }
          renderItem={({ item }) => (
            <AdminEventCard
              match={item}
              onManage={() => navigation.navigate('AdminMatchDetail', { matchId: item._id })}
              onEdit={() => navigation.navigate('AdminMatchDetail', { matchId: item._id })}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl * 2 },
  headerSection: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  newButton: {
    backgroundColor: glass.brandPurple,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: typography.caption.fontSize,
    fontWeight: '800',
  },
});
