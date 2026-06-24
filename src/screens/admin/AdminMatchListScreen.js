import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import FAB from '../../components/FAB';
import { AdminFilterPills, AdminSearchBar } from '../../components/admin/TicketProHeader';
import EmptyState from '../../components/EmptyState';
import { fetchMatches, cancelMatch } from '../../services/matchService';
import { spacing, radii, typography, glass, colors } from '../../constants/theme';
import { imageUri } from '../../utils/imageUri';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'on_sale', label: 'On Sale' },
  { key: 'upcoming', label: 'Upcoming' },
];

function matchesFilter(match, filterKey) {
  const available = match.seatStats?.available ?? 0;
  switch (filterKey) {
    case 'live': return match.status === 'live';
    case 'on_sale': return match.status === 'upcoming' && available > 0;
    case 'upcoming': return match.status === 'upcoming';
    default: return true;
  }
}

function matchesSearch(match, query) {
  if (!query.trim()) return true;
  return [match.title, match.teamA, match.teamB, match.venue, match.status]
    .filter(Boolean).join(' ').toLowerCase()
    .includes(query.trim().toLowerCase());
}

function getStatusConfig(status, stats) {
  const available = stats?.available ?? 0;
  const total = stats?.total ?? 0;
  switch (status) {
    case 'live': return { label: 'LIVE', color: '#FF1744', bg: glass.statusDangerFill, dot: true };
    case 'completed': return { label: 'FINAL', color: glass.textMuted, bg: 'rgba(255,255,255,0.06)', dot: false };
    case 'cancelled': return { label: 'CANCELLED', color: glass.textMuted, bg: 'rgba(255,255,255,0.06)', dot: false };
    case 'upcoming':
      if (available === 0 && total > 0) return { label: 'SOLD OUT', color: glass.brandPurple, bg: glass.brandPurpleSurface, dot: false };
      if (available > 0) return { label: 'ON SALE', color: glass.statusSuccessText, bg: glass.statusSuccessFill, dot: false };
      return { label: 'UPCOMING', color: glass.statusWarningText, bg: glass.statusWarningFill, dot: false };
    default: return { label: 'UPCOMING', color: glass.statusWarningText, bg: glass.statusWarningFill, dot: false };
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return { date: 'TBD', time: '--:--', full: '' };
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kathmandu' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kathmandu' }),
    iso: d.toISOString(),
  };
}

function computeZoneQuota(stats, zoneKey) {
  const total = stats?.total ?? 0;
  if (total === 0) return { sold: 0, capacity: 0, pct: 0 };

  const capacity = stats?.[zoneKey] ?? 0;
  const sold = stats?.[`${zoneKey}_booked`] ?? 0;
  const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  return { sold, capacity, pct };
}

function computeRevenue(match) {
  const stats = match.seatStats || {};
  const pricing = match.pricing || {};
  let revenue = 0;
  for (const [category, price] of Object.entries(pricing)) {
    if (typeof price !== 'number') continue;
    const bookedCat = stats[`${category}_booked`] || 0;
    revenue += bookedCat * price;
  }
  return revenue;
}

export default function AdminMatchListScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);

  const initials = (userInfo?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const loadMatches = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      setError('');
      setMatches(await fetchMatches(true));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadMatches(); }, [loadMatches]));

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadMatches(true));

  const filteredMatches = useMemo(
    () => matches.filter((m) => matchesFilter(m, activeFilter) && matchesSearch(m, searchQuery)),
    [matches, activeFilter, searchQuery]
  );

  const openDetail = (match) => {
    setSelectedMatch(match);
    setDetailVisible(true);
    slideAnim.setValue(SCREEN_HEIGHT);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 28, stiffness: 200 }).start();
  };

  const closeDetail = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }).start(() => {
      setDetailVisible(false);
      setSelectedMatch(null);
    });
  };

  const handleCancel = (match) => {
    Alert.alert(
      'Cancel Match',
      `Mark "${match.title || `${match.teamA} vs ${match.teamB}`}" as cancelled?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMatch(match._id);
              Alert.alert('Cancelled', 'Match cancelled. Refunds and notifications processed.');
              closeDetail();
              loadMatches();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel match');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={s.headerSection}>
      <AdminSearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search events..." onClear={() => setSearchQuery('')} />
      <AdminFilterPills options={FILTERS} value={activeFilter} onChange={setActiveFilter} />
    </View>
  );

  /* ═══════════════════════════════════════════════
     MAIN LIST CARD — full-bleed image, fan-aligned
     ═══════════════════════════════════════════════ */
  const renderMatchCard = ({ item }) => {
    const status = getStatusConfig(item.status, item.seatStats);
    const revenue = computeRevenue(item);
    const dt = formatDateTime(item.matchDate);
    const hasImage = Boolean(item.imageUrl);
    const title = item.title || `${item.teamA} vs ${item.teamB}`;

    return (
      <TouchableOpacity style={s.card} onPress={() => openDetail(item)} activeOpacity={0.88}>
        <View style={s.cardInner}>
          {hasImage ? (
            <Image source={{ uri: imageUri(item.imageUrl) }} style={s.cardBanner} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[`${glass.brandPurple}22`, 'rgba(7,8,11,0.95)']} style={s.cardBanner} />
          )}
          <LinearGradient
            colors={hasImage ? ['rgba(7,8,11,0.3)', 'rgba(7,8,11,0.92)'] : ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
            locations={hasImage ? [0, 0.6] : undefined}
            style={s.cardOverlay}
          >
            <View style={s.cardTop}>
              <View style={s.cardTopLeft}>
                <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                  {status.dot && <View style={[s.statusDot, { backgroundColor: status.color }]} />}
                  <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <View style={s.cardPrice}>
                <Text style={s.cardPriceValue}>Rs.{revenue.toLocaleString()}</Text>
                <Text style={s.cardPriceLabel}>Revenue</Text>
              </View>
            </View>

            <View style={s.cardMiddle}>
              <View style={s.cardTeamsRow}>
                {item.teamALogo ? (
                  <Image source={{ uri: imageUri(item.teamALogo) }} style={s.miniLogo} resizeMode="contain" />
                ) : (
                  <View style={s.miniLogoFallback}><Text style={s.miniLogoText}>{(item.teamA || '?')[0]}</Text></View>
                )}
                <Text style={s.cardVs}>vs</Text>
                {item.teamBLogo ? (
                  <Image source={{ uri: imageUri(item.teamBLogo) }} style={s.miniLogo} resizeMode="contain" />
                ) : (
                  <View style={s.miniLogoFallback}><Text style={s.miniLogoText}>{(item.teamB || '?')[0]}</Text></View>
                )}
              </View>
              <Text style={s.cardTitle} numberOfLines={1}>{title}</Text>
            </View>

            <View style={s.cardBottom}>
              <Text style={s.cardMeta}>📍 {item.venue || 'TBD'}</Text>
              <View style={s.cardBottomRight}>
                <Text style={s.cardMetaMono}>{dt.time}</Text>
                {revenue > 0 && (
                  <View style={s.cardRevenuePill}>
                    <Text style={s.cardRevenueText}>Rs.{revenue.toLocaleString()}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  /* ═══════════════════════════════════════════════════════
     FULL DETAIL MODAL — the missing drill-down overlay
     ═══════════════════════════════════════════════════════ */
  const renderDetailModal = () => {
    if (!selectedMatch) return null;
    const m = selectedMatch;
    const stats = m.seatStats || {};
    const total = stats.total || m.totalSeats || 0;
    const available = stats.available ?? 0;
    const sold = stats.booked || 0;
    const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
    const status = getStatusConfig(m.status, m.seatStats);
    const dt = formatDateTime(m.matchDate);
    const revenue = computeRevenue(m);
    const title = m.title || `${m.teamA} vs ${m.teamB}`;

    return (
      <Modal visible={detailVisible} transparent animationType="none" statusBarTranslucent>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} onPress={closeDetail} activeOpacity={1} />

          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <ScrollView
              style={s.sheetScroll}
              contentContainerStyle={s.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ── CLOSE BUTTON ── */}
              <TouchableOpacity style={s.closeBtn} onPress={closeDetail} activeOpacity={0.7}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>

              {/* ── VISUAL HERO HEADER ── */}
              <View style={s.heroHeader}>
                {m.imageUrl ? (
                  <Image source={{ uri: imageUri(m.imageUrl) }} style={s.heroBanner} resizeMode="cover" />
                ) : null}
                <LinearGradient
                  colors={m.imageUrl ? ['rgba(0,0,0,0.5)', 'rgba(7,8,11,0.95)'] : [`${glass.brandPurple}33`, 'rgba(7,8,11,0.98)']}
                  style={s.heroGradient}
                >
                  <View style={[s.heroStatusBadge, { backgroundColor: status.bg }]}>
                    {status.dot && <View style={[s.heroStatusDot, { backgroundColor: status.color }]} />}
                    <Text style={[s.heroStatusText, { color: status.color }]}>{status.label}</Text>
                  </View>

                  <View style={s.heroTeamsRow}>
                    {m.teamALogo ? (
                      <Image source={{ uri: imageUri(m.teamALogo) }} style={s.heroTeamLogo} resizeMode="contain" />
                    ) : (
                      <View style={s.heroTeamFallback}><Text style={s.heroTeamFallbackText}>{(m.teamA || '?')[0]}</Text></View>
                    )}
                    <View style={s.heroVsWrap}>
                      <Text style={s.heroVsText}>VS</Text>
                    </View>
                    {m.teamBLogo ? (
                      <Image source={{ uri: imageUri(m.teamBLogo) }} style={s.heroTeamLogo} resizeMode="contain" />
                    ) : (
                      <View style={s.heroTeamFallback}><Text style={s.heroTeamFallbackText}>{(m.teamB || '?')[0]}</Text></View>
                    )}
                  </View>

                  <Text style={s.heroTitle}>{title}</Text>
                  <Text style={s.heroVenue}>📍 {m.venue || 'Venue TBD'}</Text>

                  <View style={s.heroMetaRow}>
                    <View style={s.heroMetaPill}>
                      <Text style={s.heroMetaIcon}>📅</Text>
                      <Text style={s.heroMetaText}>{dt.date}</Text>
                    </View>
                    <View style={s.heroMetaPill}>
                      <Text style={s.heroMetaIcon}>⏰</Text>
                      <Text style={s.heroMetaMono}>{dt.time}</Text>
                    </View>
                    <View style={s.heroMetaPill}>
                      <Text style={s.heroMetaIcon}>💺</Text>
                      <Text style={s.heroMetaText}>{total.toLocaleString()} seats</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* ── REVENUE STRIP ── */}
              <View style={s.revenueStrip}>
                <View style={s.revenueItem}>
                  <Text style={s.revenueValue}>Rs.{revenue.toLocaleString()}</Text>
                  <Text style={s.revenueLabel}>Revenue</Text>
                </View>
                <View style={s.revenueDivider} />
                <View style={s.revenueItem}>
                  <Text style={[s.revenueValue, { color: glass.occupancyTeal }]}>{pct}%</Text>
                  <Text style={s.revenueLabel}>Occupancy</Text>
                </View>
                <View style={s.revenueDivider} />
                <View style={s.revenueItem}>
                  <Text style={[s.revenueValue, { color: glass.neonCyan }]}>{sold.toLocaleString()}</Text>
                  <Text style={s.revenueLabel}>Sold</Text>
                </View>
              </View>

              {/* ── STATS ROW (matches fan) ── */}
              <View style={s.bodySection}>
                <Text style={s.bodyLabel}>Category Allocation</Text>
                {(() => {
                  const pricingObj = m.pricing || {};
                  const CATEGORY_CONFIG = {
                    platinum: { label: 'Platinum', color: '#E8E8E8' },
                    gold: { label: 'Gold', color: '#FFD700' },
                    silver: { label: 'Silver', color: '#A8A8A8' },
                    bronze: { label: 'Bronze', color: '#CD7F32' },
                    general: { label: 'General', color: '#5B9BD5' },
                    supporters: { label: 'Supporters', color: '#81C784' },
                    premium: { label: 'Premium', color: glass.brandPurple },
                    category1: { label: 'Category 1', color: '#FFD700' },
                    category2: { label: 'Category 2', color: '#FF6B6B' },
                    category3: { label: 'Category 3', color: '#A29BFE' },
                    category4: { label: 'Category 4', color: '#EF5350' },
                  };
                  return Object.entries(pricingObj)
                    .filter(([, price]) => typeof price === 'number')
                    .map(([key, price]) => {
                      const catConfig = CATEGORY_CONFIG[key] || { label: key, color: '#888' };
                      const zoneStats = computeZoneQuota(stats, key);
                      const totalCat = zoneStats.capacity;
                      const soldCat = zoneStats.sold;
                      const pctCat = totalCat > 0 ? Math.round((soldCat / totalCat) * 100) : 0;

                      return (
                        <View key={key} style={s.allocRow}>
                          <View style={[s.allocDot, { backgroundColor: catConfig.color }]} />
                          <Text style={s.allocLabel}>{catConfig.label}</Text>
                          <Text style={s.allocPrice}>Rs.{price.toLocaleString()}</Text>
                          <View style={s.allocBarWrap}>
                            <View style={[s.allocBar, { width: `${pctCat}%`, backgroundColor: catConfig.color }]} />
                          </View>
                          <Text style={s.allocQuota}>{soldCat}/{totalCat}</Text>
                        </View>
                      );
                    });
                })()}
              </View>

              {/* ── PRICING ROW (matches fan) ── */}
              <View style={s.bodySection}>
                <Text style={s.bodyLabel}>Pricing</Text>
                <View style={s.pricingRow}>
                  {(() => {
                    const pricingObj = m.pricing || {};
                    const CATEGORY_ICONS = {
                      platinum: { icon: '💎', color: '#E8E8E8' },
                      gold: { icon: '⭐', color: '#FFD700' },
                      silver: { icon: '🎫', color: '#A8A8A8' },
                      bronze: { icon: '🎫', color: '#CD7F32' },
                      general: { icon: '🎫', color: '#5B9BD5' },
                      supporters: { icon: '💚', color: '#81C784' },
                      premium: { icon: '⭐', color: glass.brandPurple },
                      category1: { icon: '⭐', color: '#FFD700' },
                      category2: { icon: '🎫', color: '#FF6B6B' },
                      category3: { icon: '🎫', color: '#A29BFE' },
                      category4: { icon: '🎫', color: '#EF5350' },
                    };
                    return Object.entries(pricingObj)
                      .filter(([, price]) => typeof price === 'number')
                      .slice(0, 3)
                      .map(([key, price]) => {
                        const catIcon = CATEGORY_ICONS[key] || { icon: '🎫', color: '#888' };
                        return (
                          <View key={key} style={s.pricingCell}>
                            <View style={[s.pricingIconBadge, { backgroundColor: `${catIcon.color}22` }]}>
                              <Text style={[s.pricingIconText, { color: catIcon.color }]}>{key.slice(0, 2).toUpperCase()}</Text>
                            </View>
                            <Text style={[s.pricingValue, { color: catIcon.color }]}>Rs.{price.toLocaleString()}</Text>
                            <Text style={s.pricingLabel}>{key}</Text>
                          </View>
                        );
                      });
                })()}
                </View>
              </View>

              {/* ── DESCRIPTION ── */}
              {m.description ? (
                <View style={s.bodySection}>
                  <Text style={s.bodyLabel}>About</Text>
                  <Text style={s.aboutText}>{m.description}</Text>
                </View>
              ) : null}

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── DYNAMIC ACTION TRIGGERS FOOTER ── */}
            <View style={s.sheetFooter}>
              <TouchableOpacity
                style={s.footerBtnSecondary}
                onPress={() => { closeDetail(); navigation.navigate('AdminEditMatch', { matchId: m._id }); }}
                activeOpacity={0.8}
              >
                <Text style={s.footerBtnSecondaryText}>Modify Fixture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.footerBtnPrimary}
                onPress={() => { closeDetail(); navigation.navigate('AdminMatchDetail', { matchId: m._id }); }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[glass.brandPurple, glass.neonPurple]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.footerBtnGradient}
                >
                  <Text style={s.footerBtnPrimaryText}>Override Zone Quotas</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {m.status !== 'cancelled' && m.status !== 'completed' && (
              <TouchableOpacity
                style={s.cancelFooterBtn}
                onPress={() => handleCancel(m)}
                activeOpacity={0.8}
              >
                <Text style={s.cancelFooterBtnText}>Cancel Match</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    );
  };

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={isRefreshing} />
      <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <DashboardHeader
        topLabel="MANAGEMENT"
        title="Events"
        avatarColors={['#FFD700', '#FFA000']}
        avatarLabel={initials}
        onAvatarPress={() => navigation.navigate('AdminProfile')}
      />

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={glass.brandPurple} />
        </View>
      ) : error ? (
        <View style={s.errorWrap}>
          {renderHeader()}
          <EmptyState icon="⚠️" title="Could not load events" description={error} />
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item._id || String(item.id)}
          contentContainerStyle={s.list}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="transparent"
              colors={['transparent']}
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
          renderItem={renderMatchCard}
        />
      )}

      {renderDetailModal()}

      <TouchableOpacity
        style={[s.venuesFab]}
        onPress={() => navigation.navigate('AdminVenueManagement')}
        activeOpacity={0.85}
      >
        <Text style={s.venuesFabIcon}>🏟️</Text>
        <Text style={s.venuesFabLabel}>Venues</Text>
      </TouchableOpacity>
      <FAB icon="+" label="New" onPress={() => navigation.navigate('AdminCreateMatch')} />
    </SafeAreaView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STYLESHEET — Complete production styles for list + detail overlay
   ═══════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  /* ── Shell ── */
  container: { flex: 1, backgroundColor: '#07080B' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl * 3 },
  headerSection: { paddingBottom: spacing.lg },

  /* ═══════════════════════════════════════════════════
     LIST CARD — full-bleed image, fan-aligned
     ═══════════════════════════════════════════════════ */
  card: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 6 } }),
  },
  cardInner: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  cardBanner: {
    width: '100%',
    height: 170,
    borderRadius: radii.xl,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radii.xl,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: { flex: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  cardPrice: { alignItems: 'flex-end' },
  cardPriceValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cardPriceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  cardMiddle: {
    alignItems: 'center',
    gap: 2,
  },
  cardTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  miniLogo: { width: 28, height: 28 },
  miniLogoFallback: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  cardVs: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    textAlign: 'center',
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: { color: 'rgba(255,255,255,0.6)', fontSize: typography.small.fontSize, flex: 1 },
  cardBottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMetaMono: {
    color: glass.neonCyan,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
  cardRevenuePill: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  cardRevenueText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
  },

  /* ═══════════════════════════════════════════════════
     MODAL OVERLAY + SHEET
     ═══════════════════════════════════════════════════ */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.92,
    backgroundColor: '#0D0F18',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    borderWidth: 1,
    borderColor: glass.border,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  sheetScroll: { flex: 1 },
  sheetContent: { paddingBottom: spacing.xxl },

  /* ── Close Button ── */
  closeBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  /* ═══════════════════════════════════════════════════
     HERO HEADER
     ═══════════════════════════════════════════════════ */
  heroHeader: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  heroBanner: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    paddingTop: spacing.xxl + 40,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    minHeight: 320,
    justifyContent: 'flex-end',
  },

  heroStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  heroStatusDot: { width: 7, height: 7, borderRadius: 4 },
  heroStatusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  heroTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroTeamLogo: { width: 64, height: 64 },
  heroTeamFallback: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTeamFallbackText: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  heroVsWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.tiny.fontSize,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#FFF',
    fontSize: typography.h1.fontSize,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroVenue: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  heroMetaIcon: { fontSize: 11 },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.small.fontSize, fontWeight: '600' },
  heroMetaMono: {
    color: glass.neonCyan,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
    fontFamily: glass.monoFont,
  },

  /* ═══════════════════════════════════════════════════
     REVENUE STRIP
     ═══════════════════════════════════════════════════ */
  revenueStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,21,34,0.65)',
    marginHorizontal: spacing.xl,
    marginTop: -spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: glass.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  revenueItem: { flex: 1, alignItems: 'center' },
  revenueDivider: { width: 1, height: 32, backgroundColor: glass.border },
  revenueValue: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '900',
    fontFamily: glass.monoFont,
    marginBottom: 2,
  },
  revenueLabel: {
    color: glass.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ═══════════════════════════════════════════════════
     BODY SECTIONS — Clean & minimal (matches fan)
     ═══════════════════════════════════════════════════ */
  bodySection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  bodyLabel: {
    color: glass.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  /* Allocation row */
  allocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,21,34,0.65)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  allocDot: { width: 8, height: 8, borderRadius: 4 },
  allocLabel: { color: colors.textPrimary, fontSize: typography.small.fontSize, fontWeight: '700', width: 60 },
  allocPrice: { color: glass.textMuted, fontSize: typography.tiny.fontSize, width: 60 },
  allocBarWrap: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  allocBar: { height: '100%', borderRadius: 2 },
  allocQuota: { color: glass.textSecondary, fontSize: typography.tiny.fontSize, fontWeight: '700', width: 40, textAlign: 'right' },

  /* Pricing row */
  pricingRow: { flexDirection: 'row', gap: spacing.sm },
  pricingCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(18,21,34,0.65)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: glass.border,
  },
  pricingIconBadge: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  pricingIconText: { fontSize: 11, fontWeight: '800' },
  pricingValue: { fontSize: typography.bodyMedium.fontSize, fontWeight: '900', marginBottom: 2 },
  pricingLabel: { color: glass.textMuted, fontSize: 9, fontWeight: '600' },

  aboutText: {
    color: glass.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 20,
    backgroundColor: 'rgba(18,21,34,0.65)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: glass.border,
  },

  /* ═══════════════════════════════════════════════════
     DYNAMIC ACTION TRIGGERS FOOTER
     ═══════════════════════════════════════════════════ */
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: '#0D0F18',
    borderTopWidth: 1,
    borderTopColor: glass.border,
  },
  footerBtnSecondary: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: glass.border,
  },
  footerBtnSecondaryText: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },
  footerBtnPrimary: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  footerBtnGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnPrimaryText: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
  },
  cancelFooterBtn: {
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxxl,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,23,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,23,68,0.25)',
  },
  cancelFooterBtnText: {
    color: '#FF5252',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },
  venuesFab: {
    position: 'absolute',
    bottom: spacing.xxl + 64,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: glass.brandPurple,
    elevation: 6,
    shadowColor: glass.brandPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  venuesFabIcon: { color: '#FFF', fontSize: 18 },
  venuesFabLabel: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
});
