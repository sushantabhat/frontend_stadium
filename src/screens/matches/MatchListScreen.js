import React, { useCallback, useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { formatInNepal } from '../../utils/date';
import { imageUri } from '../../utils/imageUri';
import { fetchMatches } from '../../services/matchService';
import MatchCard from '../../components/MatchCard';
import DashboardHeader from '../../components/DashboardHeader';
import RefreshBar from '../../components/RefreshBar';
import useRefresh from '../../hooks/useRefresh';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: '🔴 Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'on_sale', label: 'On Sale' },
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
  return [match.title, match.teamA, match.teamB, match.venue]
    .filter(Boolean).join(' ').toLowerCase()
    .includes(query.trim().toLowerCase());
}

export default function MatchListScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = userInfo?.name?.split(' ')[0] || 'Fan';
  const initials = (userInfo?.name || 'F').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const loadMatches = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try { setMatches(await fetchMatches()); }
    catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadMatches(); }, [loadMatches]));

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadMatches(true));

  const liveMatches = useMemo(() => matches.filter((m) => m.status === 'live'), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((m) => m.status === 'upcoming'), [matches]);
  const otherMatches = useMemo(() => matches.filter((m) => !['live', 'upcoming'].includes(m.status)), [matches]);

  const navigateToDetail = (match) => {
    navigation.navigate('MatchDetail', { matchId: match._id || match.id });
  };

  const isFiltered = activeFilter !== 'all' || searchQuery.trim();

  const flatData = useMemo(() => {
    const items = [];
    items.push({ _key: 'header', type: 'header' });

    if (isFiltered) {
      const filtered = matches.filter((m) => matchesFilter(m, activeFilter) && matchesSearch(m, searchQuery));
      filtered.forEach((m, i) => items.push({ _key: `f_${m._id || i}`, type: 'card', match: m, index: i }));
      if (filtered.length === 0) items.push({ _key: 'empty', type: 'empty' });
      return items;
    }

    if (liveMatches.length > 0) {
      items.push({ _key: 'sec_live', type: 'section', title: 'Live Now', color: '#FF1744' });
      liveMatches.forEach((m, i) => items.push({ _key: `live_${m._id || i}`, type: 'card', match: m, index: i }));
    }
    if (upcomingMatches.length > 0) {
      items.push({ _key: 'sec_up', type: 'section', title: 'Upcoming Matches', color: '#FFD700' });
      items.push({ _key: `hero_${upcomingMatches[0]._id}`, type: 'hero', match: upcomingMatches[0] });
      upcomingMatches.slice(1).forEach((m, i) => items.push({ _key: `up_${m._id || i}`, type: 'card', match: m, index: i + 1 }));
    }
    if (otherMatches.length > 0) {
      items.push({ _key: 'sec_past', type: 'section', title: 'Past Events', color: '#94A3B8' });
      otherMatches.forEach((m, i) => items.push({ _key: `ot_${m._id || i}`, type: 'card', match: m, index: i }));
    }
    if (items.length === 1) items.push({ _key: 'empty', type: 'empty' });
    return items;
  }, [matches, liveMatches, upcomingMatches, otherMatches, isFiltered, activeFilter, searchQuery]);

  const renderHeader = () => (
    <View style={s.headerSection}>
      <DashboardHeader
        topLabel="BROWSE"
        title={`${firstName}`}
        avatarColors={colors.gradientPurple}
        avatarLabel={initials}
        onAvatarPress={() => navigation.navigate('Account')}
      />
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search teams, venues..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
            <Text style={s.searchClear}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={s.filterRow}>
        {FILTERS.map((opt) => {
          const active = activeFilter === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[s.filterPill, active && s.filterPillActive]}
              onPress={() => setActiveFilter(opt.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.filterText, active && s.filterTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderHeroCard = (match) => {
    const stats = match.seatStats || {};
    const total = stats.total || match.totalSeats || 0;
    const available = stats.available ?? 0;
    const sold = total - available;
    const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
    const hasImage = Boolean(match.imageUrl);

    return (
      <TouchableOpacity style={s.heroCard} onPress={() => navigateToDetail(match)} activeOpacity={0.92}>
        <View style={s.heroCardInner}>
          {hasImage && <Image source={{ uri: imageUri(match.imageUrl) }} style={s.heroBanner} resizeMode="cover" />}
          <LinearGradient
            colors={hasImage ? ['rgba(0,0,0,0.3)', 'rgba(7,8,11,0.9)'] : [`${colors.primary}22`, 'rgba(7,8,11,0.95)']}
            style={s.heroGradient}
          >
            <View style={s.heroTopRow}>
              <View style={s.heroLivePill}>
                <View style={s.heroLiveDot} />
                <Text style={s.heroLiveText}>UPCOMING</Text>
              </View>
              {available === 0 && total > 0 ? (
                <View style={[s.heroAvailBadge, { backgroundColor: 'rgba(255,23,68,0.25)' }]}>
                  <Text style={[s.heroAvailText, { color: '#FF5252' }]}>SOLD OUT</Text>
                </View>
              ) : available > 0 && available <= 50 ? (
                <View style={[s.heroAvailBadge, { backgroundColor: 'rgba(255,179,0,0.2)' }]}>
                  <Text style={[s.heroAvailText, { color: '#FFB300' }]}>Only {available} left!</Text>
                </View>
              ) : available > 0 ? (
                <View style={[s.heroAvailBadge, { backgroundColor: 'rgba(0,212,170,0.2)' }]}>
                  <Text style={[s.heroAvailText, { color: '#00D4AA' }]}>Seats Available</Text>
                </View>
              ) : null}
            </View>
            <View style={s.heroTeamsRow}>
              {match.teamALogo ? (
                <Image source={{ uri: imageUri(match.teamALogo) }} style={s.heroLogo} resizeMode="contain" />
              ) : (
                <View style={s.heroLogoFallback}><Text style={s.heroLogoText}>{(match.teamA || '?')[0]}</Text></View>
              )}
              <View style={s.heroVsWrap}><Text style={s.heroVsText}>VS</Text></View>
              {match.teamBLogo ? (
                <Image source={{ uri: imageUri(match.teamBLogo) }} style={s.heroLogo} resizeMode="contain" />
              ) : (
                <View style={s.heroLogoFallback}><Text style={s.heroLogoText}>{(match.teamB || '?')[0]}</Text></View>
              )}
            </View>
            <Text style={s.heroTitle}>{match.title || `${match.teamA} vs ${match.teamB}`}</Text>
            <Text style={s.heroVenue}>📍 {match.venue || 'TBD'}</Text>
            <View style={s.heroBottom}>
              {match.matchDate && (
                <Text style={s.heroDate}>
                  {formatInNepal(match.matchDate, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              )}
              {total > 0 && (
                <View style={s.heroSoldWrap}>
                  <View style={s.heroSoldBar}>
                    <View style={[s.heroSoldFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={s.heroSoldText}>{pct}% sold</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header': return renderHeader();
      case 'section': return (
        <View style={s.sectionWrap}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: item.color }]} />
            <Text style={s.sectionTitle}>{item.title}</Text>
            <View style={[s.sectionLine, { backgroundColor: `${item.color}30` }]} />
          </View>
        </View>
      );
      case 'hero': return (
        <View style={s.cardWrap}>{renderHeroCard(item.match)}</View>
      );
      case 'card': return (
        <View style={s.cardWrap}>
          <MatchCard match={item.match} variant="horizontal" tintIndex={item.index} onPress={() => navigateToDetail(item.match)} />
        </View>
      );
      case 'empty': return (
        <View style={s.emptyWrap}>
          <View style={s.emptyIconWrap}>
            <Text style={s.emptyIcon}>{isFiltered ? '🔍' : '🏟️'}</Text>
          </View>
          <Text style={s.emptyTitle}>{isFiltered ? 'No matches found' : 'No matches yet'}</Text>
          <Text style={s.emptyText}>{isFiltered ? 'Try a different search or filter.' : 'Matches will appear once the admin creates them.'}</Text>
        </View>
      );
      default: return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <RefreshBar refreshing={isRefreshing} />
      <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      {isLoading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderItem}
          keyExtractor={(item) => item._key}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="transparent" colors={['transparent']} />}
        />
      )}
    </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: spacing.xxxl + 20 },

  headerSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  pageEyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: spacing.xs },
  pageTitle: { color: colors.textPrimary, fontSize: typography.h1.fontSize, fontWeight: '900', letterSpacing: -0.4 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,23,68,0.12)', paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radii.full },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF1744' },
  liveText: { color: '#FF1744', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, minHeight: 46, gap: spacing.sm, marginBottom: spacing.lg },
  searchIcon: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.body.fontSize, paddingVertical: spacing.md },
  searchClear: { color: colors.textMuted, fontSize: 18, fontWeight: '500' },

  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterPill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700' },
  filterTextActive: { color: '#FFF' },

  sectionWrap: { paddingHorizontal: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', letterSpacing: -0.3 },
  sectionLine: { flex: 1, height: 1 },

  cardWrap: { marginHorizontal: spacing.xl, marginBottom: spacing.md },

  heroCard: { borderRadius: radii.xxl, overflow: 'hidden' },
  heroCardInner: { position: 'relative' },
  heroBanner: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroGradient: { paddingTop: spacing.xxl, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl, minHeight: 300, justifyContent: 'flex-end' },

  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  heroLivePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(255,179,0,0.15)', paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radii.full },
  heroLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700' },
  heroLiveText: { color: '#FFD700', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroAvailBadge: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radii.full },
  heroAvailText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  heroTeamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.lg },
  heroLogo: { width: 56, height: 56 },
  heroLogoFallback: { width: 56, height: 56, borderRadius: radii.lg, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroLogoText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  heroVsWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroVsText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '900', letterSpacing: 2 },

  heroTitle: { color: '#FFF', fontSize: typography.h2.fontSize, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center', marginBottom: spacing.xs },
  heroVenue: { color: 'rgba(255,255,255,0.6)', fontSize: typography.caption.fontSize, textAlign: 'center', marginBottom: spacing.xl },

  heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroDate: { color: 'rgba(255,255,255,0.8)', fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  heroSoldWrap: { alignItems: 'flex-end', gap: spacing.xs },
  heroSoldBar: { width: 80, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' },
  heroSoldFill: { height: '100%', backgroundColor: '#00D4AA', borderRadius: 2 },
  heroSoldText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge, paddingHorizontal: spacing.xxl },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: `${colors.primary}20` },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },
});
