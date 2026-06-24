import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { AdminCard, AdminFilterPills, AdminSearchBar } from '../../components/admin/TicketProHeader';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { fetchAllTickets } from '../../services/adminService';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'valid', label: 'Valid' },
  { key: 'used', label: 'Used' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_MAP = {
  valid: { label: 'Valid', color: glass.statusSuccessText, bg: glass.statusSuccessFill },
  used: { label: 'Used', color: '#FFA726', bg: 'rgba(255,167,38,0.12)' },
  cancelled: { label: 'Cancelled', color: '#FF4757', bg: 'rgba(255,71,87,0.12)' },
};

const TIER_COLORS = { platinum: '#E8E8E8', gold: '#FFD700', silver: '#A8A8A8', bronze: '#CD7F32', general: '#5B9BD5', category1: '#FFD700', category2: '#FF6B6B', category3: '#A29BFE', category4: '#EF5350', supporters: '#81C784', premium: glass.brandPurple };

function normalizeTicket(ticket) {
  const category = ticket.seat?.category || 'general';
  const isScanned = ticket.status === 'used' && ticket.scannedBy;

  let statusKey;
  if (ticket.status === 'cancelled') statusKey = 'cancelled';
  else if (isScanned) statusKey = 'used';
  else if (ticket.status === 'used') statusKey = 'cancelled';
  else if (ticket.match?.status === 'cancelled') statusKey = 'cancelled';
  else statusKey = 'valid';

  return {
    id: ticket._id,
    code: ticket.ticketCode,
    statusKey,
    price: ticket.seat?.price || 0,
    title: ticket.match?.title || 'Event',
    seat: ticket.seat?.seatLabel || '—',
    category,
    gate: ticket.seat?.gate || '',
    userName: ticket.user?.name || 'Unknown',
    userEmail: ticket.user?.email || '',
    userInitials: (ticket.user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
    usedAt: ticket.usedAt,
    scannedByName: ticket.scannedBy?.name || '',
    createdAt: ticket.createdAt,
  };
}

export default function TicketValidationScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const [allTickets, setAllTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const tickets = await fetchAllTickets();
      setAllTickets(tickets || []);
    } catch (err) {
      console.log('Ticket data error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadData(true));

  const filteredTickets = useMemo(() => {
    let result = allTickets.map((t) => normalizeTicket(t));

    if (activeFilter !== 'all') {
      result = result.filter((t) => t.statusKey === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) =>
        t.code?.toLowerCase() === q ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.seat?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allTickets, activeFilter, searchQuery]);

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const renderTicket = useCallback(({ item }) => {
    const status = STATUS_MAP[item.statusKey] || STATUS_MAP.valid;
    const tierColor = TIER_COLORS[item.category] || TIER_COLORS.general;
    const isExpanded = expandedId === item.id;

    return (
      <AdminCard style={styles.ticketCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketCodeRow}>
              <Text style={styles.ticketCode} numberOfLines={1}>{item.code}</Text>
            </View>
            <Text style={styles.ticketPrice}>Rs.{item.price.toLocaleString()}</Text>
          </View>

          <View style={styles.ticketMeta}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▾' : '▸'}</Text>
          </View>

          <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.seatLine}>
            § {item.category?.toUpperCase()} · Seat {item.seat}
            {item.gate ? ` · ${item.gate}` : ''}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detailSection}>
            <View style={styles.detailDivider} />
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>BOOKED BY</Text>
                <View style={styles.userRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitials}>{item.userInitials}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.userEmail}>{item.userEmail}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>BOOKED ON</Text>
                <Text style={styles.detailValue}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </Text>
              </View>
              {item.usedAt && item.statusKey === 'used' && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>SCANNED AT</Text>
                  <Text style={styles.detailValue}>
                    {new Date(item.usedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                  {item.scannedByName ? <Text style={styles.detailSubtext}>by {item.scannedByName}</Text> : null}
                </View>
              )}
            </View>
          </View>
        )}
      </AdminCard>
    );
  }, [expandedId, toggleExpand]);

  const listHeader = useMemo(() => (
    <View>
      <AdminSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, match, or seat..."
        onClear={() => setSearchQuery('')}
      />
      <AdminFilterPills options={STATUS_FILTERS} value={activeFilter} onChange={setActiveFilter} />
    </View>
  ), [searchQuery, activeFilter]);

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={isRefreshing} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DashboardHeader
          topLabel="MANAGEMENT"
          title="Tickets"
          avatarColors={['#FFD700', '#FFA000']}
          avatarLabel={initials}
          onAvatarPress={() => navigation.navigate(userInfo?.role === 'supervisor' ? 'SupervisorProfile' : 'AdminProfile')}
        />
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.center}><ActivityIndicator color={glass.brandPurple} /></View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No tickets found</Text>
                <Text style={styles.emptyDesc}>Try a different search or filter.</Text>
              </View>
            )
          }
          renderItem={renderTicket}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },

  ticketCard: { padding: spacing.xl, marginBottom: spacing.md },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  ticketCodeRow: { flex: 1, marginRight: spacing.md },
  ticketCode: { color: glass.brandPurple, fontSize: typography.small.fontSize, fontWeight: '800', fontFamily: 'Courier' },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  expandIcon: { color: glass.textMuted, fontSize: 12 },
  ticketPrice: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '900' },
  eventTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  seatLine: { color: glass.textMuted, fontSize: typography.small.fontSize },

  detailSection: { marginTop: spacing.md },
  detailDivider: { height: 1, backgroundColor: glass.border, marginBottom: spacing.md },
  detailGrid: { gap: spacing.md },
  detailItem: { gap: spacing.xs },
  detailLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  detailValue: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: '600' },
  detailSubtext: { color: glass.textMuted, fontSize: typography.small.fontSize },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: glass.brandPurpleSurface, alignItems: 'center', justifyContent: 'center' },
  userInitials: { color: glass.brandPurple, fontSize: 10, fontWeight: '800' },
  userName: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: '600' },
  userEmail: { color: glass.textMuted, fontSize: typography.small.fontSize },

  center: { paddingVertical: spacing.xxl, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: spacing.xs },
  emptyDesc: { color: glass.textMuted, fontSize: typography.caption.fontSize },
});
