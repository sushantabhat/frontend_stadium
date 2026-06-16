import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../../constants/theme';
import { fetchMatches } from '../../services/matchService';
import MatchCard from '../../components/MatchCard';

export default function MatchListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const data = await fetchMatches();
      setMatches(data);
    } catch {
      // handle quietly
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadMatches(); }, [loadMatches]));

  const onRefresh = () => { setIsRefreshing(true); loadMatches(); };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={matches}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <MatchCard
              match={item}
              variant="horizontal"
              onPress={() => navigation.navigate('MatchDetail', { matchId: item._id || item.id })}
            />
          </View>
        )}
        keyExtractor={(item) => item._id || String(item.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerDot} />
          </View>
        }
        ListEmptyComponent={<View style={styles.center} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.xl },
  header: { marginBottom: spacing.lg },
  headerDot: { width: 0, height: 0 },
  cardWrap: { marginBottom: spacing.md },
});
