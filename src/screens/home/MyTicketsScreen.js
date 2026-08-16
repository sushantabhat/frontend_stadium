import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ticket, ChevronRight } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { spacing, radii, typography } from '../../constants/theme';
import { useColors } from '../../context/ThemeContext';
import { fetchMyTickets } from '../../services/ticketService';
import { formatInNepal, formatTimeInNepal } from '../../utils/date';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

function groupTicketsByMatch(tickets) {
  const map = new Map();
  for (const ticket of tickets) {
    const match = ticket.match;
    if (!match?._id) continue;
    const key = match._id;
    if (!map.has(key)) {
      map.set(key, { match, tickets: [] });
    }
    map.get(key).tickets.push(ticket);
  }
  return Array.from(map.values()).sort((a, b) => {
    const da = a.match?.matchDate ? new Date(a.match.matchDate) : null;
    const db = b.match?.matchDate ? new Date(b.match.matchDate) : null;
    return (da || 0) - (db || 0);
  });
}

function isActiveTicket(ticket) {
  if (ticket.status === 'cancelled' || ticket.status === 'used') return false;
  if (ticket.match?.status === 'cancelled') return false;
  const matchDate = ticket.match?.matchDate ? new Date(ticket.match.matchDate) : null;
  if (ticket.match?.status === 'completed' || (matchDate && matchDate < new Date())) return false;
  return true;
}

export default function MyTicketsScreen({ navigation }) {
  const colors = useColors();
  const { userInfo } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try { setTickets(await fetchMyTickets()); } catch {} finally { setIsLoading(false); }
  }, []);

  const { refreshing, onRefresh } = useRefresh(() => loadTickets(true));

  const firstName = userInfo?.name?.split(' ')[0] || 'Fan';
  const initials = (userInfo?.name || 'F').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const matchGroups = useMemo(() => groupTicketsByMatch(tickets), [tickets]);
  const totalTickets = tickets.length;

  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  const renderMatch = ({ item, index }) => {
    const { match, tickets: matchTickets } = item;
    const matchDate = match?.matchDate ? new Date(match.matchDate) : null;
    const validCount = matchTickets.filter(isActiveTicket).length;

    return (
      <TouchableOpacity
        style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('MatchTickets', { match, tickets: matchTickets })}
      >
        <View style={[styles.matchAccent, { backgroundColor: colors.primary }]} />

        <View style={styles.matchBody}>
          <View style={styles.matchTopRow}>
            {matchDate ? (
              <View style={[styles.matchDateBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
                <Text style={[styles.matchDateDay, { color: colors.textPrimary }]}>{matchDate.getDate()}</Text>
                <Text style={[styles.matchDateMonth, { color: colors.primaryLight }]}>
                  {formatInNepal(matchDate, { month: 'short' }).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={[styles.matchDateBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
                <Text style={[styles.matchDateDay, { color: colors.textPrimary }]}>TBA</Text>
              </View>
            )}

            <View style={styles.matchInfo}>
              <Text style={[styles.matchTitle, { color: colors.textPrimary }]} numberOfLines={1}>{match?.title}</Text>
              <Text style={[styles.matchTeams, { color: colors.textSecondary }]} numberOfLines={1}>
                {match?.teamA || 'TBA'} <Text style={[styles.matchVs, { color: colors.textMuted }]}>VS</Text> {match?.teamB || 'TBA'}
              </Text>
              <View style={styles.matchMetaRow}>
                {matchDate && (
                  <Text style={[styles.matchMetaText, { color: colors.textMuted }]}>
                    {formatInNepal(matchDate, { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {formatTimeInNepal(matchDate, { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                )}
                {match?.venue ? (
                  <Text style={[styles.matchMetaText, { color: colors.textMuted }]} numberOfLines={1}> · {match.venue}</Text>
                ) : null}
              </View>
            </View>

            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.5} />
          </View>

          <View style={[styles.matchFooter, { borderTopColor: colors.borderSubtle }]}>
            <View style={[styles.ticketPill, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}25` }]}>
              <Ticket size={12} color={colors.primaryLight} strokeWidth={2.5} />
              <Text style={[styles.ticketPillText, { color: colors.primaryLight }]}>
                {matchTickets.length} ticket{matchTickets.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {validCount > 0 ? (
              <View style={[styles.validPill, { backgroundColor: `${colors.success}15`, borderColor: `${colors.success}30` }]}>
                <Text style={[styles.validPillText, { color: colors.successLight }]}>{validCount} VALID</Text>
              </View>
            ) : (
              <Text style={[styles.noValidText, { color: colors.textMuted }]}>No active tickets</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="MY TICKETS"
          title={`${firstName}`}
          avatarColors={colors.gradientPurple}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('Account')}
        />
        <FlatList
          data={matchGroups}
          renderItem={renderMatch}
          keyExtractor={(item) => item.match._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
          ListHeaderComponent={
            <View style={styles.header}>
              {matchGroups.length > 0 && (
                <View style={[styles.ticketCount, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25` }]}>
                  <Text style={[styles.ticketCountText, { color: colors.primaryLight }]}>
                    {matchGroups.length} match{matchGroups.length !== 1 ? 'es' : ''} · {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyWrap}>
                <View style={[styles.emptyIconWrap, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
                  <Text style={styles.emptyIcon}>{'🎫'}</Text>
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Tickets Yet</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Book a match to see your tickets here</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xxl }} /> : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: spacing.xxxl },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, marginBottom: spacing.xl },
  ticketCount: { marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, alignSelf: 'flex-start', borderWidth: 1 },
  ticketCountText: { fontSize: 9, fontWeight: '700' },

  // Match card
  matchCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  matchAccent: {
    width: 5,
  },
  matchBody: {
    flex: 1,
    padding: spacing.lg,
  },
  matchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  matchDateBox: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  matchDateDay: { fontSize: typography.h3.fontSize, fontWeight: '900', lineHeight: 24 },
  matchDateMonth: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  matchInfo: { flex: 1 },
  matchTitle: { fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  matchTeams: { fontSize: typography.caption.fontSize, fontWeight: '600', marginTop: spacing.xxs },
  matchVs: { fontSize: 9, fontWeight: '800' },
  matchMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  matchMetaText: { fontSize: typography.tiny.fontSize, fontWeight: '600' },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  ticketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  ticketPillText: { fontSize: 10, fontWeight: '800' },
  validPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  validPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  noValidText: { fontSize: 10, fontWeight: '700' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg, borderWidth: 1,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontSize: typography.h3.fontSize, fontWeight: '700', marginBottom: spacing.sm },
  emptyText: { fontSize: typography.caption.fontSize, textAlign: 'center' },
});