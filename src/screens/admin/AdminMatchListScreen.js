import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { fetchMatches } from '../../services/matchService';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';

/* ─── Status pill color mapping (semantic glassmorphic badges) ─── */
const STATUS_STYLES = {
  upcoming: { bg: glass.statusWarningFill, text: glass.statusWarningText, label: 'UPCOMING' },
  live:     { bg: glass.statusDangerFill,  text: glass.statusDangerText,  label: 'LIVE' },
  completed:{ bg: glass.statusSuccessFill, text: glass.statusSuccessText, label: 'COMPLETED' },
  cancelled:{ bg: 'rgba(255,255,255,0.06)', text: glass.textMuted,        label: 'CANCELLED' },
};

export default function AdminMatchListScreen({ navigation }) {
  /* ── Preserved: Match data state ── */
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  /* ── Preserved: Data loading callback ── */
  const loadMatches = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError('');
      const data = await fetchMatches(true);
      setMatches(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /* ── Preserved: Focus-based refresh ── */
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  /* ── Derived: computed metrics for top cards ── */
  const upcomingCount = matches.filter(m => m.status === 'upcoming').length;
  const liveCount = matches.filter(m => m.status === 'live').length;

  /* ── Helper: format match date for display ── */
  const formatMatchDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  /* ── Helper: get status style or fallback ── */
  const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.upcoming;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Fixture Scheduler"
        subtitle="Stadium arena allocation & event planning"
        rightAction={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('AdminCreateMatch')}
          >
            <LinearGradient
              colors={[glass.neonCyan, glass.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>+ New Event</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={glass.neonCyan} />
        </View>
      ) : error ? (
        <EmptyState icon="⚠️" title="Could not load fixtures" description={error} />
      ) : (
        <>
          {/* ═══ TOP METRICS: Split-column glass cards ═══ */}
          <View style={styles.metricsRow}>
            <TouchableOpacity style={styles.metricCard} activeOpacity={0.9}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricInner}
              >
                <Text style={styles.metricLabel}>UPCOMING</Text>
                <Text style={[styles.metricValue, { color: glass.statusWarningText }]}>{upcomingCount}</Text>
                <Text style={styles.metricSub}>Scheduled events</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.metricCard} activeOpacity={0.9}>
              <LinearGradient
                colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricInner}
              >
                <Text style={styles.metricLabel}>ACTIVE GATES</Text>
                <Text style={[styles.metricValue, { color: glass.statusDangerText }]}>{liveCount}</Text>
                <Text style={styles.metricSub}>Live stadium segments</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ═══ FIXTURE LIST ═══ */}
          <FlatList
            data={matches}
            keyExtractor={(item) => item._id || String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadMatches(true)}
                tintColor={glass.neonCyan}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="📊"
                title="No fixtures scheduled"
                description="Create your first event to start allocating stadium arenas."
              />
            }
            renderItem={({ item, index }) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <TouchableOpacity
                  style={styles.matchCard}
                  onPress={() => navigation.navigate('AdminMatchDetail', { matchId: item._id })}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[glass.surface, 'rgba(18,21,34,0.4)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.matchCardInner}
                  >
                    {/* Left column: Monospaced index / tournament ID */}
                    <View style={styles.matchLeft}>
                      <Text style={styles.matchIndex}>#{String(index + 1).padStart(3, '0')}</Text>
                      <Text style={styles.matchDate}>{formatMatchDate(item.matchDate)}</Text>
                    </View>

                    {/* Center column: Match title + venue */}
                    <View style={styles.matchCenter}>
                      <Text style={styles.matchTitle} numberOfLines={1}>
                        {item.title || `${item.teamA} vs ${item.teamB}`}
                      </Text>
                      {item.venue && (
                        <Text style={styles.matchVenue} numberOfLines={1}>{item.venue}</Text>
                      )}
                      <View style={styles.matchTags}>
                        {item.teamA && <Text style={styles.matchTag}>{item.teamA}</Text>}
                        {item.teamB && <Text style={styles.matchTag}>{item.teamB}</Text>}
                      </View>
                    </View>

                    {/* Right column: Status pill */}
                    <View style={styles.matchRight}>
                      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      <Text style={styles.matchChevron}>›</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ── Canvas ── */
  container: { flex: 1, backgroundColor: glass.canvasStart },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* ── Create button ── */
  createButton: { borderRadius: radii.lg, overflow: 'hidden' },
  createButtonGradient: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    minHeight: 44, alignItems: 'center', justifyContent: 'center',
  },
  createButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: typography.caption.fontSize },

  /* ── Top metrics row ── */
  metricsRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  metricCard: { flex: 1, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: glass.border },
  metricInner: { padding: spacing.xl },
  metricLabel: { color: glass.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  metricValue: { fontSize: 32, fontWeight: '900', marginBottom: spacing.xs },
  metricSub: { color: glass.textMuted, fontSize: typography.small.fontSize },

  /* ── Fixture list ── */
  list: { padding: spacing.xl, paddingBottom: spacing.xxl * 1.5 },

  /* ── Individual match card (isolated glass container) ── */
  matchCard: {
    marginBottom: spacing.md, borderRadius: radii.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: glass.border,
  },
  matchCardInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.xl, gap: spacing.lg,
  },

  /* Left: monospaced index */
  matchLeft: { alignItems: 'center', minWidth: 56 },
  matchIndex: {
    color: glass.neonCyan, fontSize: 13, fontWeight: '800',
    fontFamily: glass.monoFont, marginBottom: spacing.xs,
  },
  matchDate: {
    color: glass.textMuted, fontSize: 9,
    fontFamily: glass.monoFont, textAlign: 'center',
  },

  /* Center: title + venue + tags */
  matchCenter: { flex: 1 },
  matchTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700', marginBottom: 2 },
  matchVenue: { color: glass.textMuted, fontSize: typography.small.fontSize, marginBottom: spacing.sm },
  matchTags: { flexDirection: 'row', gap: spacing.xs },
  matchTag: {
    fontSize: 9, fontWeight: '700', color: glass.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radii.full, overflow: 'hidden',
    letterSpacing: 0.5,
  },

  /* Right: status pill + chevron */
  matchRight: { alignItems: 'flex-end', gap: spacing.sm },
  statusPill: {
    paddingHorizontal: spacing.md, paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  matchChevron: { color: glass.textMuted, fontSize: 18, fontWeight: '600' },
});
