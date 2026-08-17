import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ticket, ChevronRight, Clock, History } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography } from '../../constants/theme';
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

function isPastMatch(group) {
  const { match } = group;
  if (match?.status === 'completed' || match?.status === 'cancelled') return true;
  const matchDate = match?.matchDate ? new Date(match.matchDate) : null;
  return matchDate && matchDate < new Date();
}

function hasNoActiveTickets(group) {
  return group.tickets.every(t => !isActiveTicket(t));
}

export default function MyTicketsScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const loadTickets = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try { setTickets(await fetchMyTickets()); } catch {} finally { setIsLoading(false); }
  }, []);

  const { refreshing, onRefresh } = useRefresh(() => loadTickets(true));

  const firstName = userInfo?.name?.split(' ')[0] || 'Fan';
  const initials = (userInfo?.name || 'F').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const matchGroups = useMemo(() => groupTicketsByMatch(tickets), [tickets]);
  const filteredMatchGroups = useMemo(() => {
    return matchGroups.filter(group => {
      if (activeTab === 'history') return isPastMatch(group);
      if (activeTab === 'scanned') return !isPastMatch(group) && hasNoActiveTickets(group);
      return !isPastMatch(group) && !hasNoActiveTickets(group);
    });
  }, [matchGroups, activeTab]);
  const totalTickets = tickets.length;

  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  const renderMatch = ({ item, index }) => {
    const { match, tickets: matchTickets } = item;
    const matchDate = match?.matchDate ? new Date(match.matchDate) : null;
    const validCount = matchTickets.filter(isActiveTicket).length;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('MatchTickets', { match, tickets: matchTickets })}
      >
        <View style={styles.matchAccent} />

        <View style={styles.matchBody}>
          <View style={styles.matchTopRow}>
            {matchDate ? (
              <View style={styles.matchDateBox}>
                <Text style={styles.matchDateDay}>{matchDate.getDate()}</Text>
                <Text style={styles.matchDateMonth}>
                  {formatInNepal(matchDate, { month: 'short' }).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.matchDateBox}>
                <Text style={styles.matchDateDay}>TBA</Text>
              </View>
            )}

            <View style={styles.matchInfo}>
              <Text style={styles.matchTitle} numberOfLines={1}>{match?.title}</Text>
              <Text style={styles.matchTeams} numberOfLines={1}>
                {match?.teamA || 'TBA'} <Text style={styles.matchVs}>VS</Text> {match?.teamB || 'TBA'}
              </Text>
              <View style={styles.matchMetaRow}>
                {matchDate && (
                  <Text style={styles.matchMetaText}>
                    {formatInNepal(matchDate, { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {formatTimeInNepal(matchDate, { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                )}
                {match?.venue ? (
                  <Text style={styles.matchMetaText} numberOfLines={1}> · {match.venue}</Text>
                ) : null}
              </View>
            </View>

            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.5} />
          </View>

          <View style={styles.matchFooter}>
            <View style={styles.ticketPill}>
              <Ticket size={12} color={colors.primaryLight} strokeWidth={2.5} />
              <Text style={styles.ticketPillText}>
                {matchTickets.length} ticket{matchTickets.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {validCount > 0 ? (
              <View style={styles.validPill}>
                <Text style={styles.validPillText}>{validCount} VALID</Text>
              </View>
            ) : (
              <Text style={styles.noValidText}>No active tickets</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={refreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="MY TICKETS"
          title={`${firstName}`}
          avatarColors={colors.gradientPurple}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate('Account')}
        />
        <FlatList
          data={filteredMatchGroups}
          renderItem={renderMatch}
          keyExtractor={(item) => item.match._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, activeTab === 'upcoming' && styles.toggleBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('upcoming')}
                >
                  <Clock size={14} color={activeTab === 'upcoming' ? '#FFF' : colors.textMuted} strokeWidth={2.5} />
                  <Text style={[styles.toggleBtnText, activeTab === 'upcoming' && styles.toggleBtnTextActive]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, activeTab === 'scanned' && styles.toggleBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('scanned')}
                >
                  <Ticket size={14} color={activeTab === 'scanned' ? '#FFF' : colors.textMuted} strokeWidth={2.5} />
                  <Text style={[styles.toggleBtnText, activeTab === 'scanned' && styles.toggleBtnTextActive]}>Scanned</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, activeTab === 'history' && styles.toggleBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('history')}
                >
                  <History size={14} color={activeTab === 'history' ? '#FFF' : colors.textMuted} strokeWidth={2.5} />
                  <Text style={[styles.toggleBtnText, activeTab === 'history' && styles.toggleBtnTextActive]}>History</Text>
                </TouchableOpacity>
              </View>
              {filteredMatchGroups.length > 0 && (
                <View style={styles.ticketCount}>
                  <Text style={styles.ticketCountText}>
                    {filteredMatchGroups.length} match{filteredMatchGroups.length !== 1 ? 'es' : ''} · {filteredMatchGroups.reduce((sum, g) => sum + g.tickets.length, 0)} ticket{filteredMatchGroups.reduce((sum, g) => sum + g.tickets.length, 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconWrap}>
                  <Text style={styles.emptyIcon}>{activeTab === 'history' ? '📋' : activeTab === 'scanned' ? '✅' : '🎫'}</Text>
                </View>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'history' ? 'No Past Tickets' : activeTab === 'scanned' ? 'No Scanned Matches' : 'No Upcoming Tickets'}
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'history' ? 'Your completed matches will appear here' : activeTab === 'scanned' ? 'Matches with all tickets scanned will appear here' : 'Book a match to see your tickets here'}
                </Text>
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
  ticketCount: { marginTop: spacing.md, backgroundColor: colors.primarySurface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, alignSelf: 'flex-start', borderWidth: 1, borderColor: `${colors.primary}25` },
  ticketCountText: { color: colors.primaryLight, fontSize: 9, fontWeight: '700' },

  // Toggle buttons
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleBtnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#FFF',
  },

  // Match card
  matchCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  matchAccent: {
    width: 5,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  matchDateDay: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '900', lineHeight: 24 },
  matchDateMonth: { color: colors.primaryLight, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  matchInfo: { flex: 1 },
  matchTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  matchTeams: { color: colors.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '600', marginTop: spacing.xxs },
  matchVs: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  matchMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  matchMetaText: { color: colors.textMuted, fontSize: typography.tiny.fontSize, fontWeight: '600' },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  ticketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
  },
  ticketPillText: { color: colors.primaryLight, fontSize: 10, fontWeight: '800' },
  validPill: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  validPillText: { color: colors.successLight, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  noValidText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg, borderWidth: 1, borderColor: `${colors.primary}20`,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700', marginBottom: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },
});