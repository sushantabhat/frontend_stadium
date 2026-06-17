import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
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
import TicketProHeader, { AdminFilterPills, AdminPageTitle, AdminSearchBar } from '../../components/admin/TicketProHeader';
import EmptyState from '../../components/EmptyState';
import { cancelMatch, fetchMatches } from '../../services/matchService';
import { spacing, radii, typography, glass, colors } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'on_sale', label: 'On Sale' },
  { key: 'upcoming', label: 'Upcoming' },
];

const ZONE_CONFIG = [
  { key: 'vip', label: 'NORTH STAND', sub: 'VIP Zone', color: glass.neonMagenta, glow: glass.neonMagentaGlow, rows: 'A-B' },
  { key: 'premium', label: 'SOUTH STAND', sub: 'Premium Circle', color: glass.neonCyan, glow: glass.neonCyanGlow, rows: 'C-E' },
  { key: 'general_west', label: 'WEST STAND', sub: 'Public Pass', color: 'rgba(148,163,184,0.7)', glow: 'rgba(148,163,184,0.15)', rows: 'F-H' },
  { key: 'general_east', label: 'EAST STAND', sub: 'Public Pass', color: 'rgba(148,163,184,0.7)', glow: 'rgba(148,163,184,0.15)', rows: 'I-J' },
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
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    iso: d.toISOString(),
  };
}

function computeZoneQuota(stats, zoneKey) {
  const total = stats?.total ?? 0;
  if (total === 0) return { sold: 0, capacity: 0, pct: 0 };
  const vipCount = stats?.vip ?? 0;
  const premiumCount = stats?.premium ?? 0;
  const generalCount = stats?.general ?? 0;
  const booked = stats?.booked ?? 0;

  const vipRatio = total > 0 ? vipCount / total : 0;
  const premiumRatio = total > 0 ? premiumCount / total : 0;

  let capacity = 0;
  switch (zoneKey) {
    case 'vip': capacity = vipCount; break;
    case 'premium': capacity = premiumCount; break;
    case 'general_west': capacity = Math.floor(generalCount / 2); break;
    case 'general_east': capacity = Math.ceil(generalCount / 2); break;
    default: capacity = 0;
  }

  const sold = Math.round(booked * (
    zoneKey === 'vip' ? vipRatio
      : zoneKey === 'premium' ? premiumRatio
        : (1 - vipRatio - premiumRatio)
  ));

  const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  return { sold, capacity, pct };
}

function computeRevenue(match) {
  const stats = match.seatStats || {};
  const pricing = match.pricing || {};
  const total = stats.total || match.totalSeats || 0;
  const booked = stats.booked || 0;
  if (total === 0 || booked === 0) return 0;
  const vipRatio = (stats.vip || 0) / total;
  const premiumRatio = (stats.premium || 0) / total;
  const bookedVip = Math.round(booked * vipRatio);
  const bookedPremium = Math.round(booked * premiumRatio);
  const bookedGeneral = Math.max(0, booked - bookedVip - bookedPremium);
  return bookedVip * (pricing.vip || 0) + bookedPremium * (pricing.premium || 0) + bookedGeneral * (pricing.general || 0);
}

export default function AdminMatchListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const loadMatches = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      setError('');
      setMatches(await fetchMatches(true));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadMatches(); }, [loadMatches]));

  const liveCount = matches.filter((m) => m.status === 'live').length;

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

  const handleDelete = async (match) => {
    try {
      await cancelMatch(match._id);
      setMatches((prev) => prev.map((item) => item._id === match._id ? { ...item, status: 'cancelled' } : item));
      if (selectedMatch?._id === match._id) setSelectedMatch((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch {
      // silent
    }
  };

  const renderHeader = () => (
    <View style={s.headerSection}>
      <TicketProHeader showLive={liveCount > 0} />
      <AdminPageTitle
        eyebrow="MANAGEMENT"
        title="Events"
        action={
          <TouchableOpacity style={s.newButton} onPress={() => navigation.navigate('AdminCreateMatch')} activeOpacity={0.85}>
            <Text style={s.newButtonText}>+ New</Text>
          </TouchableOpacity>
        }
      />
      <AdminSearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search events..." onClear={() => setSearchQuery('')} />
      <AdminFilterPills options={FILTERS} value={activeFilter} onChange={setActiveFilter} />
    </View>
  );

  /* ═══════════════════════════════════════════════
     MAIN LIST CARD — glass panel, touchable
     ═══════════════════════════════════════════════ */
  const renderMatchCard = ({ item }) => {
    const status = getStatusConfig(item.status, item.seatStats);
    const stats = item.seatStats || {};
    const total = stats.total || item.totalSeats || 0;
    const available = stats.available ?? 0;
    const sold = total - available;
    const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
    const revenue = computeRevenue(item);
    const dt = formatDateTime(item.matchDate);
    const hasImage = Boolean(item.imageUrl);
    const title = item.title || `${item.teamA} vs ${item.teamB}`;

    return (
      <TouchableOpacity style={s.card} onPress={() => openDetail(item)} activeOpacity={0.88}>
        <View style={s.cardInner}>
          {hasImage && (
            <Image source={{ uri: item.imageUrl }} style={s.cardBanner} resizeMode="cover" />
          )}

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

          <Text style={s.cardTitle} numberOfLines={1}>{title}</Text>

          <View style={s.cardMetaRow}>
            <Text style={s.cardMeta}>📍 {item.venue || 'TBD'}</Text>
            <Text style={s.cardMetaMono}>{dt.time}</Text>
          </View>

          <View style={s.cardTeamsRow}>
            {item.teamALogo ? (
              <Image source={{ uri: item.teamALogo }} style={s.miniLogo} resizeMode="contain" />
            ) : (
              <View style={s.miniLogoFallback}><Text style={s.miniLogoText}>{(item.teamA || '?')[0]}</Text></View>
            )}
            <Text style={s.cardVs}>vs</Text>
            {item.teamBLogo ? (
              <Image source={{ uri: item.teamBLogo }} style={s.miniLogo} resizeMode="contain" />
            ) : (
              <View style={s.miniLogoFallback}><Text style={s.miniLogoText}>{(item.teamB || '?')[0]}</Text></View>
            )}
          </View>

          <View style={s.cardProgressSection}>
            <View style={s.cardProgressHeader}>
              <Text style={s.cardProgressLabel}>Occupancy</Text>
              <Text style={s.cardProgressStats}>{pct}% · {sold.toLocaleString()}/{total.toLocaleString()}</Text>
            </View>
            <View style={s.progressTrack}>
              <LinearGradient
                colors={pct > 80 ? [colors.danger, colors.warning] : [glass.occupancyTeal, glass.neonCyan]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progressFill, { width: `${pct}%` }]}
              />
            </View>
          </View>

          <View style={s.cardActions}>
            <TouchableOpacity style={s.cardActionBtn} onPress={() => navigation.navigate('AdminMatchDetail', { matchId: item._id })} activeOpacity={0.7}>
              <Text style={s.cardActionText}>Manage</Text>
            </TouchableOpacity>
            <View style={s.cardActionDivider} />
            <TouchableOpacity style={s.cardActionBtn} onPress={() => openDetail(item)} activeOpacity={0.7}>
              <Text style={[s.cardActionText, { color: glass.brandPurple }]}>Details</Text>
            </TouchableOpacity>
            <View style={s.cardActionDivider} />
            <TouchableOpacity style={s.cardActionBtn} onPress={() => handleDelete(item)} activeOpacity={0.7}>
              <Text style={[s.cardActionText, { color: glass.statusDangerText }]}>Delete</Text>
            </TouchableOpacity>
          </View>
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
    const sold = total - available;
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
                  <Image source={{ uri: m.imageUrl }} style={s.heroBanner} resizeMode="cover" />
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
                      <Image source={{ uri: m.teamALogo }} style={s.heroTeamLogo} resizeMode="contain" />
                    ) : (
                      <View style={s.heroTeamFallback}><Text style={s.heroTeamFallbackText}>{(m.teamA || '?')[0]}</Text></View>
                    )}
                    <View style={s.heroVsWrap}>
                      <Text style={s.heroVsText}>VS</Text>
                    </View>
                    {m.teamBLogo ? (
                      <Image source={{ uri: m.teamBLogo }} style={s.heroTeamLogo} resizeMode="contain" />
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
                  <Text style={s.revenueLabel}>Est. Revenue</Text>
                </View>
                <View style={s.revenueDivider} />
                <View style={s.revenueItem}>
                  <Text style={[s.revenueValue, { color: glass.occupancyTeal }]}>{pct}%</Text>
                  <Text style={s.revenueLabel}>Occupancy</Text>
                </View>
                <View style={s.revenueDivider} />
                <View style={s.revenueItem}>
                  <Text style={[s.revenueValue, { color: glass.neonCyan }]}>{sold.toLocaleString()}</Text>
                  <Text style={s.revenueLabel}>Tickets Sold</Text>
                </View>
              </View>

              {/* ── STADIUM ZONE BLUEPRINT ── */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={[s.sectionDot, { backgroundColor: glass.brandPurple }]} />
                  <Text style={s.sectionTitle}>Stadium Zone Blueprint</Text>
                </View>

                <View style={s.stadiumMap}>
                  {/* Pitch center */}
                  <View style={s.pitchCenter}>
                    <Text style={s.pitchLabel}>PITCH</Text>
                  </View>

                  {/* North Stand */}
                  <View style={[s.zoneCard, { borderColor: `${glass.neonMagenta}40` }]}>
                    <View style={[s.zoneAccent, { backgroundColor: glass.neonMagenta }]} />
                    <View style={s.zoneContent}>
                      <Text style={[s.zoneLabel, { color: glass.neonMagenta }]}>NORTH STAND</Text>
                      <Text style={s.zoneSub}>VIP Zone</Text>
                      <Text style={s.zoneRows}>Rows {ZONE_CONFIG[0].rows}</Text>
                    </View>
                  </View>

                  {/* South Stand */}
                  <View style={[s.zoneCard, { borderColor: `${glass.neonCyan}40` }]}>
                    <View style={[s.zoneAccent, { backgroundColor: glass.neonCyan }]} />
                    <View style={s.zoneContent}>
                      <Text style={[s.zoneLabel, { color: glass.neonCyan }]}>SOUTH STAND</Text>
                      <Text style={s.zoneSub}>Premium Circle</Text>
                      <Text style={s.zoneRows}>Rows {ZONE_CONFIG[1].rows}</Text>
                    </View>
                  </View>

                  <View style={s.zoneRow}>
                    {/* West Stand */}
                    <View style={[s.zoneCardHalf, { borderColor: 'rgba(148,163,184,0.25)' }]}>
                      <View style={[s.zoneAccent, { backgroundColor: 'rgba(148,163,184,0.7)' }]} />
                      <View style={s.zoneContent}>
                        <Text style={[s.zoneLabel, { color: 'rgba(148,163,184,0.9)' }]}>WEST</Text>
                        <Text style={s.zoneSub}>Public Pass</Text>
                        <Text style={s.zoneRows}>Rows F-H</Text>
                      </View>
                    </View>

                    {/* East Stand */}
                    <View style={[s.zoneCardHalf, { borderColor: 'rgba(148,163,184,0.25)' }]}>
                      <View style={[s.zoneAccent, { backgroundColor: 'rgba(148,163,184,0.7)' }]} />
                      <View style={s.zoneContent}>
                        <Text style={[s.zoneLabel, { color: 'rgba(148,163,184,0.9)' }]}>EAST</Text>
                        <Text style={s.zoneSub}>Public Pass</Text>
                        <Text style={s.zoneRows}>Rows I-J</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── CATEGORY ALLOCATION CONTROLS ── */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={[s.sectionDot, { backgroundColor: glass.occupancyTeal }]} />
                  <Text style={s.sectionTitle}>Category Allocation</Text>
                </View>

                {[
                  { key: 'vip', label: 'VIP', price: m.pricing?.vip ?? 0, color: '#FFD700', zoneKey: 'vip' },
                  { key: 'premium', label: 'Premium', price: m.pricing?.premium ?? 0, color: glass.brandPurple, zoneKey: 'premium' },
                  { key: 'general', label: 'General', price: m.pricing?.general ?? 0, color: '#78909C', zoneKey: 'general_west' },
                ].map((cat) => {
                  const zoneStats = computeZoneQuota(stats, cat.zoneKey);
                  const generalWest = computeZoneQuota(stats, 'general_west');
                  const generalEast = computeZoneQuota(stats, 'general_east');
                  const totalCat = cat.key === 'general' ? generalWest.capacity + generalEast.capacity : zoneStats.capacity;
                  const soldCat = cat.key === 'general' ? generalWest.sold + generalEast.sold : zoneStats.sold;
                  const pctCat = totalCat > 0 ? Math.round((soldCat / totalCat) * 100) : 0;

                  return (
                    <View key={cat.key} style={s.allocationCard}>
                      <View style={s.allocationHeader}>
                        <View style={s.allocationLeft}>
                          <View style={[s.allocationDot, { backgroundColor: cat.color }]} />
                          <View>
                            <Text style={s.allocationLabel}>{cat.label}</Text>
                            <Text style={s.allocationPrice}>Rs.{cat.price.toLocaleString()}/seat</Text>
                          </View>
                        </View>
                        <View style={s.allocationRight}>
                          <Text style={[s.allocationQuota, { fontFamily: glass.monoFont }]}>{soldCat}/{totalCat}</Text>
                          <Text style={[s.allocationPct, { color: pctCat > 80 ? colors.danger : glass.occupancyTeal }]}>{pctCat}%</Text>
                        </View>
                      </View>

                      <View style={s.sliderTrack}>
                        <View style={[s.sliderBg, { backgroundColor: `${cat.color}15` }]} />
                        <View style={[s.sliderBg, { width: `${pctCat}%`, backgroundColor: `${cat.color}40` }]} />
                        <View style={[s.sliderFill, { width: `${pctCat}%`, backgroundColor: cat.color }]} />
                      </View>

                      <View style={s.sliderLabels}>
                        <Text style={s.sliderLabel}>{soldCat} registered</Text>
                        <Text style={s.sliderLabel}>{totalCat - soldCat} remaining</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* ── PRICING TIERS ── */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={[s.sectionDot, { backgroundColor: glass.neonAmber }]} />
                  <Text style={s.sectionTitle}>Pricing Tiers</Text>
                </View>

                <View style={s.pricingRow}>
                  {[
                    { label: 'VIP', value: m.pricing?.vip ?? 0, icon: '👑', color: '#FFD700' },
                    { label: 'Premium', value: m.pricing?.premium ?? 0, icon: '⭐', color: glass.brandPurple },
                    { label: 'General', value: m.pricing?.general ?? 0, icon: '🎫', color: '#78909C' },
                  ].map((p) => (
                    <View key={p.label} style={[s.pricingCard, { borderColor: `${p.color}30` }]}>
                      <Text style={s.pricingIcon}>{p.icon}</Text>
                      <Text style={[s.pricingValue, { color: p.color, fontFamily: glass.monoFont }]}>Rs.{p.value.toLocaleString()}</Text>
                      <Text style={s.pricingLabel}>{p.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── DESCRIPTION ── */}
              {m.description ? (
                <View style={s.sectionCard}>
                  <View style={s.sectionHeader}>
                    <View style={[s.sectionDot, { backgroundColor: glass.textMuted }]} />
                    <Text style={s.sectionTitle}>About</Text>
                  </View>
                  <Text style={s.aboutText}>{m.description}</Text>
                </View>
              ) : null}

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── DYNAMIC ACTION TRIGGERS FOOTER ── */}
            <View style={s.sheetFooter}>
              <TouchableOpacity
                style={s.footerBtnSecondary}
                onPress={() => { closeDetail(); navigation.navigate('AdminMatchDetail', { matchId: m._id }); }}
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
          </Animated.View>
        </View>
      </Modal>
    );
  };

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />

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
              onRefresh={() => loadMatches(true)}
              tintColor={glass.brandPurple}
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
    </SafeAreaView>
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
  headerSection: { paddingTop: spacing.md, paddingBottom: spacing.lg },

  /* ── New Button ── */
  newButton: {
    backgroundColor: glass.brandPurple,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: { color: '#FFF', fontSize: typography.caption.fontSize, fontWeight: '800' },

  /* ═══════════════════════════════════════════════════
     LIST CARD
     ═══════════════════════════════════════════════════ */
  card: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: 'rgba(18, 21, 34, 0.65)',
  },
  cardInner: { padding: spacing.xl },

  cardBanner: {
    width: '100%',
    height: 120,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    fontFamily: glass.monoFont,
  },
  cardPriceLabel: {
    color: glass.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },

  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardMeta: { color: glass.textMuted, fontSize: typography.small.fontSize, flex: 1 },
  cardMetaMono: {
    color: glass.brandPurple,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
    fontFamily: glass.monoFont,
  },

  cardTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  miniLogo: { width: 32, height: 32, borderRadius: radii.sm },
  miniLogoFallback: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: glass.brandPurpleSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoText: { color: glass.brandPurple, fontSize: 14, fontWeight: '800' },
  cardVs: {
    color: glass.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },

  cardProgressSection: { marginBottom: spacing.lg },
  cardProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardProgressLabel: { color: glass.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '600' },
  cardProgressStats: {
    color: glass.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    fontFamily: glass.monoFont,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: glass.border,
    paddingTop: spacing.md,
  },
  cardActionBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
  cardActionDivider: { width: 1, height: 16, backgroundColor: glass.border },
  cardActionText: { color: glass.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700' },

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
     SECTION CARD (reusable)
     ═══════════════════════════════════════════════════ */
  sectionCard: {
    backgroundColor: 'rgba(18,21,34,0.65)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
  },

  /* ═══════════════════════════════════════════════════
     STADIUM ZONE BLUEPRINT
     ═══════════════════════════════════════════════════ */
  stadiumMap: {
    gap: spacing.sm,
  },
  pitchCenter: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  pitchLabel: {
    color: glass.occupancyTeal,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 2,
  },

  zoneCard: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  zoneAccent: { width: 4, },
  zoneContent: { flex: 1, padding: spacing.md },
  zoneLabel: { fontSize: typography.tiny.fontSize, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  zoneSub: { color: glass.textSecondary, fontSize: typography.small.fontSize, fontWeight: '600' },
  zoneRows: { color: glass.textMuted, fontSize: typography.tiny.fontSize, fontFamily: glass.monoFont, marginTop: 2 },

  zoneRow: { flexDirection: 'row', gap: spacing.sm },
  zoneCardHalf: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  /* ═══════════════════════════════════════════════════
     CATEGORY ALLOCATION CONTROLS
     ═══════════════════════════════════════════════════ */
  allocationCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  allocationLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  allocationDot: { width: 10, height: 10, borderRadius: 5 },
  allocationLabel: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  allocationPrice: { color: glass.textMuted, fontSize: typography.small.fontSize, fontFamily: glass.monoFont },
  allocationRight: { alignItems: 'flex-end' },
  allocationQuota: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  allocationPct: { fontSize: typography.tiny.fontSize, fontWeight: '800', fontFamily: glass.monoFont },

  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  sliderBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 3,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: { color: glass.textMuted, fontSize: typography.tiny.fontSize, fontFamily: glass.monoFont },

  /* ═══════════════════════════════════════════════════
     PRICING TIERS
     ═══════════════════════════════════════════════════ */
  pricingRow: { flexDirection: 'row', gap: spacing.sm },
  pricingCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.lg,
    alignItems: 'center',
  },
  pricingIcon: { fontSize: 20, marginBottom: spacing.sm },
  pricingValue: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  pricingLabel: {
    color: glass.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── About ── */
  aboutText: {
    color: glass.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 20,
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
});
