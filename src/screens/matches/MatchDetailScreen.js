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
import { colors, spacing, radii, typography, shadows, commonStyles } from '../../constants/theme';
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  teams: {
    color: colors.primaryLight,
    ...typography.captionMedium,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radii.full,
  },
  statusText: {
    color: '#FFFFFF',
    ...typography.tiny,
  },
  title: {
    color: colors.textPrimary,
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    ...typography.caption,
    marginTop: spacing.md,
    lineHeight: typography.caption.lineHeight + 4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.h3,
    marginBottom: spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    ...typography.h3,
  },
  statLabel: {
    color: colors.textSecondary,
    ...typography.tiny,
    marginTop: spacing.xs,
    letterSpacing: 0,
    textTransform: 'none',
  },
  categoryRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  layoutBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layoutTitle: {
    color: colors.textPrimary,
    ...typography.captionMedium,
    marginBottom: spacing.sm,
  },
  layoutText: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
});
