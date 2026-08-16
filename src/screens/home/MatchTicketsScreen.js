import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket } from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import BookedTicketCard from '../../components/BookedTicketCard';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { formatInNepal, formatTimeInNepal } from '../../utils/date';

export default function MatchTicketsScreen({ route, navigation }) {
  const { match, tickets } = route.params;
  const matchDate = match?.matchDate ? new Date(match.matchDate) : null;

  const renderTicket = ({ item }) => (
    <BookedTicketCard ticket={item} onPress={() => navigation.navigate('TicketDetail', { ticket: item })} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="My Tickets" onBack={() => navigation.goBack()} />

      <LinearGradient
        colors={['#1a0533', '#0d1b3e']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.matchBanner}
      >
        <Text style={styles.bannerTitle} numberOfLines={1}>{match?.title || 'Match'}</Text>
        <Text style={styles.bannerTeams}>
          {match?.teamA || 'TBA'} <Text style={styles.bannerVs}>VS</Text> {match?.teamB || 'TBA'}
        </Text>
        <View style={styles.bannerMetaRow}>
          {matchDate && (
            <Text style={styles.bannerMeta}>
              {formatInNepal(matchDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              {formatTimeInNepal(matchDate, { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          )}
          {match?.venue ? <Text style={styles.bannerMeta}> · {match.venue}</Text> : null}
        </View>
        <View style={styles.bannerCountPill}>
          <Ticket size={12} color={colors.primaryLight} strokeWidth={2.5} />
          <Text style={styles.bannerCountText}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} booked
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item._id || item.ticketCode}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyTitle}>No tickets for this match</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl },

  matchBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  bannerTitle: { color: '#FFF', fontSize: typography.h3.fontSize, fontWeight: '900' },
  bannerTeams: { color: 'rgba(255,255,255,0.85)', fontSize: typography.captionMedium.fontSize, fontWeight: '700', marginTop: spacing.xs },
  bannerVs: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800' },
  bannerMetaRow: { flexDirection: 'row', marginTop: spacing.sm },
  bannerMeta: { color: 'rgba(255,255,255,0.6)', fontSize: typography.tiny.fontSize, fontWeight: '600' },
  bannerCountPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  bannerCountText: { color: colors.primaryLight, fontSize: 10, fontWeight: '800' },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: '600', marginTop: spacing.md },
});