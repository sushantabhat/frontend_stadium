import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';
import { formatMatchDate, getStatusColor } from '../utils/date';

export default function MatchCard({ match, onPress }) {
  const available = match.seatStats?.available ?? 0;
  const total = match.seatStats?.total ?? match.totalSeats ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
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

      <View style={styles.footer}>
        <Text style={styles.seats}>
          {available} / {total} seats available
        </Text>
        <Text style={styles.price}>
          From ₹{Math.min(match.pricing.general, match.pricing.premium, match.pricing.vip)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teams: {
    color: colors.primaryLight,
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  seats: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
