import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { ROLES } from '../../constants/config';
import { cancelMatch, fetchMatchById } from '../../services/matchService';
import { colors, commonStyles } from '../../constants/theme';
import { formatMatchDate, getStatusColor } from '../../utils/date';

function StatBox({ label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === ROLES.ADMIN;

  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');

  const loadMatch = useCallback(async () => {
    setIsLoading(true);
    try {
      setError('');
      const data = await fetchMatchById(matchId);
      setMatch(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load match details');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
    }, [loadMatch])
  );

  const handleCancel = () => {
    Alert.alert(
      'Cancel Match',
      'Are you sure you want to cancel this match?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              const updated = await cancelMatch(matchId);
              setMatch(updated);
              Alert.alert('Success', 'Match has been cancelled.');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel match');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Match Details" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Match Details" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Match not found'}</Text>
        </View>
      </View>
    );
  }

  const stats = match.seatStats || {};

  return (
    <View style={styles.container}>
      <ScreenHeader title="Match Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.statusRow}>
            <Text style={styles.teams}>
              {match.teamA} vs {match.teamB}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
              <Text style={styles.statusText}>{match.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.title}>{match.title}</Text>
          <Text style={styles.meta}>📍 {match.venue}</Text>
          <Text style={styles.meta}>🗓 {formatMatchDate(match.matchDate)}</Text>
          {match.description ? <Text style={styles.description}>{match.description}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.pricingRow}>
          <StatBox label="VIP" value={`₹${match.pricing.vip}`} />
          <StatBox label="Premium" value={`₹${match.pricing.premium}`} />
          <StatBox label="General" value={`₹${match.pricing.general}`} />
        </View>

        <Text style={styles.sectionTitle}>Seat Availability</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Total" value={stats.total || 0} />
          <StatBox label="Available" value={stats.available || 0} color={colors.success} />
          <StatBox label="Booked" value={stats.booked || 0} color={colors.warning} />
        </View>

        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>VIP: {stats.vip || 0} seats</Text>
          <Text style={styles.categoryText}>Premium: {stats.premium || 0} seats</Text>
          <Text style={styles.categoryText}>General: {stats.general || 0} seats</Text>
        </View>

        <View style={styles.layoutBox}>
          <Text style={styles.layoutTitle}>Stadium Layout</Text>
          <Text style={styles.layoutText}>
            {match.seatLayout.rows} rows × {match.seatLayout.seatsPerRow} seats per row
          </Text>
          <Text style={styles.layoutText}>
            VIP rows: {match.seatLayout.vipRows} · Premium rows: {match.seatLayout.premiumRows}
          </Text>
        </View>

        {!isAdmin && match.status !== 'cancelled' ? (
          <TouchableOpacity
            style={commonStyles.primaryButton}
            onPress={() => navigation.navigate('SeatSelection', { matchId: match.id })}
          >
            <Text style={commonStyles.primaryButtonText}>Select & Book Seats</Text>
          </TouchableOpacity>
        ) : null}

        {isAdmin && match.status !== 'cancelled' ? (
          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Cancel Match</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teams: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  categoryRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  layoutBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layoutTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 6,
  },
  layoutText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
});
