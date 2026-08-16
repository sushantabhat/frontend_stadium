import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../constants/theme';
import { fetchIncidents } from '../../services/adminService';
import ScreenHeader from '../../components/ScreenHeader';
import useRefresh from '../../hooks/useRefresh';

const SEVERITY = {
  critical: { bg: colors.dangerSurface, text: colors.danger, label: 'CRITICAL' },
  high:     { bg: colors.warningSurface, text: colors.warning, label: 'HIGH' },
  medium:   { bg: colors.warningSurface, text: colors.warning, label: 'MEDIUM' },
  low:      { bg: colors.successSurface, text: colors.success, label: 'LOW' },
};

export default function IncidentHistoryScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All', 'Open', 'Resolved'
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    try {
      const data = await fetchIncidents();
      const mapped = (data || []).map(f => ({
        id: f._id,
        type: f.type,
        severity: f.severity,
        title: f.type.replace(/_/g, ' ').toUpperCase(),
        ticketCode: f.ticketCode || '—',
        details: f.notes,
        staff: f.reportedBy?.name || 'Gate staff',
        resolvedBy: f.resolvedBy?.name || null,
        timestamp: f.createdAt,
        status: f.status || 'Open',
      }));
      setIncidents(mapped);
    } catch (e) {
      console.log('Incident History error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { refreshing: isRefreshing, onRefresh } = useRefresh(() => loadData(true));

  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'All') return true;
    if (filter === 'Open' && (inc.status === 'Open' || inc.status === 'open')) return true;
    if (filter === 'Resolved' && (inc.status === 'Resolved' || inc.status === 'resolved')) return true;
    return false;
  });

  const renderItem = ({ item }) => {
    const sev = SEVERITY[item.severity] || SEVERITY.medium;
    const isResolved = item.status?.toLowerCase() === 'resolved';

    return (
      <TouchableOpacity
        style={[styles.incidentCard, isResolved && { opacity: 0.8 }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SupervisorIncidentDetail', { incidentId: item.id, incident: item })}
      >
        <View style={styles.incidentInner}>
          <View style={styles.incidentLeft}>
            <Text style={[styles.incidentTitle, isResolved && { textDecorationLine: 'line-through', color: colors.textMuted }]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.incidentMeta}>{item.ticketCode} · {item.staff} · {timeAgo(item.timestamp)}</Text>
            {isResolved && item.resolvedBy && (
              <Text style={styles.resolvedMeta}>Resolved by {item.resolvedBy}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={[styles.severityPill, { backgroundColor: sev.bg }]}>
              <Text style={[styles.severityText, { color: sev.text }]}>{sev.label}</Text>
            </View>
            <Text style={[styles.statusText, { color: isResolved ? colors.success : colors.warning }]}>
              {isResolved ? 'RESOLVED' : 'OPEN'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Incident Log" onBack={() => navigation.goBack()} />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Open', 'Resolved'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
      ) : (
        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <CheckCircle size={48} color={colors.success} strokeWidth={1.5} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>No incidents found</Text>
              <Text style={styles.emptyDesc}>No {filter.toLowerCase()} incidents to display.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  incidentCard: { 
    marginBottom: spacing.md, 
    backgroundColor: colors.surface, 
    borderRadius: radii.xl, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  incidentInner: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: spacing.lg, 
    gap: spacing.md 
  },
  incidentLeft: { flex: 1 },
  incidentTitle: { 
    color: colors.textPrimary, 
    fontSize: typography.captionMedium.fontSize, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  incidentMeta: { 
    color: colors.textMuted, 
    fontSize: typography.tiny.fontSize 
  },
  resolvedMeta: {
    color: colors.success,
    fontSize: typography.tiny.fontSize,
    marginTop: 4,
    fontWeight: '600'
  },
  severityPill: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: 4, 
    borderRadius: radii.full 
  },
  severityText: { 
    fontSize: 9, 
    fontWeight: '800', 
    letterSpacing: 0.6 
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyWrap: { 
    alignItems: 'center', 
    paddingVertical: spacing.xxxl 
  },
  emptyTitle: { 
    color: colors.textPrimary, 
    fontSize: typography.bodyMedium.fontSize, 
    fontWeight: '700', 
    marginBottom: spacing.xs 
  },
  emptyDesc: { 
    color: colors.textMuted, 
    fontSize: typography.small.fontSize 
  },
});
