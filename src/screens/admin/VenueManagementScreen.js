import React, { useCallback, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';
import { fetchVenues, deleteVenue } from '../../services/venueService';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

export default function VenueManagementScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVenues = useCallback(async (refreshing = false) => {
    if (!refreshing) setLoading(true);
    try {
      const data = await fetchVenues();
      setVenues(data);
    } catch {
      Alert.alert('Error', 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, []);

  const { refreshing, onRefresh } = useRefresh(() => loadVenues(true));

  useFocusEffect(useCallback(() => {
    loadVenues();
  }, [loadVenues]));

  const handleDelete = (venue) => {
    Alert.alert('Delete Venue', `Delete "${venue.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteVenue(venue._id);
            setVenues((prev) => prev.filter((v) => v._id !== venue._id));
          } catch {
            Alert.alert('Error', 'Failed to delete venue');
          }
        },
      },
    ]);
  };

  const renderVenueItem = ({ item }) => (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => navigation.navigate('AdminVenueEditor', { venue: item })}
      activeOpacity={0.7}
    >
      <View style={styles.venueCardHeader}>
        <View style={styles.venueCardInfo}>
          <Text style={styles.venueName}>{item.name}</Text>
          {item.location ? <Text style={styles.venueLocation}>{item.location}</Text> : null}
        </View>
        <View style={styles.venueCardActions}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); navigation.navigate('AdminStadiumView', { venue: item }); }}
            hitSlop={8}
            style={styles.viewBtn}
          >
            <Text style={styles.viewBtnText}>👁</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.venueCardMeta}>
        <View style={styles.metaBadge}>
          <Text style={styles.metaBadgeText}>{item.stadiumSections?.length || 0} sections</Text>
        </View>
        <View style={styles.metaBadge}>
          <Text style={styles.metaBadgeText}>
            {(item.stadiumSections || []).reduce((sum, s) => sum + (s.totalSeats || 0), 0)} seats
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScreenHeader title="Venues" subtitle="Manage stadium layouts" onBack={() => navigation.goBack()} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={glass.brandPurple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Venues"
        subtitle="Define layouts once, reuse for every match"
        onBack={() => navigation.goBack()}
      />

      <RefreshBar refreshing={refreshing} />

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminVenueEditor', { venue: null })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[glass.brandPurple, glass.neonPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addBtnGradient}
          >
            <Text style={styles.addBtnText}>+ New Venue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={venues}
        keyExtractor={(item) => item._id}
        renderItem={renderVenueItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No venues yet</Text>
            <Text style={styles.emptySubtitle}>Create a venue to define its stadium layout</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerActions: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  addBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  addBtnGradient: { paddingVertical: spacing.md, alignItems: 'center', borderRadius: radii.lg },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: typography.bodyMedium.fontSize },

  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },

  venueCard: {
    backgroundColor: glass.card, borderRadius: radii.xl,
    borderWidth: 1, borderColor: glass.border,
    padding: spacing.xl, marginBottom: spacing.md,
  },
  venueCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  venueCardInfo: { flex: 1 },
  venueName: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: 4 },
  venueLocation: { color: glass.textSecondary, fontSize: typography.small.fontSize },

  venueCardMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  metaBadge: {
    backgroundColor: 'rgba(123,97,255,0.08)', borderRadius: radii.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  metaBadgeText: { color: glass.brandPurple, fontSize: 10, fontWeight: '700' },

  venueCardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  viewBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(123,97,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { fontSize: 14 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,59,48,0.12)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#FF3B30', fontSize: 14, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingTop: spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.sm },
  emptySubtitle: { color: glass.textSecondary, fontSize: typography.body.fontSize, textAlign: 'center' },
});
