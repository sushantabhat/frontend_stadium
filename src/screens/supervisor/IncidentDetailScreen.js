import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography, glass } from '../../constants/theme';
import { formatInNepal } from '../../utils/date';
import DashboardHeader from '../../components/DashboardHeader';
import { fetchIncidentById, updateIncidentStatus } from '../../services/adminService';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'ticket', label: 'Ticket' },
  { key: 'scans', label: 'Scan History' },
  { key: 'customer', label: 'Customer' },
];

export default function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [incident, setIncident] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const inc = await fetchIncidentById(incidentId);
      setIncident(inc);
    } catch (err) {
      console.log('Incident load error:', err.message);
      Alert.alert('Error', 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => { load(); }, [load]);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  const handleAction = async (action) => {
    if (!incidentId) return;
    setActionLoading(true);
    try {
      if (action === 'allow') {
        await updateIncidentStatus(incidentId, 'Resolved', 'Manually allowed entry.');
        Alert.alert('Entry Allowed', 'Ticket has been manually approved. Entry granted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (action === 'dismiss') {
        await updateIncidentStatus(incidentId, 'Resolved', 'Incident dismissed.');
        Alert.alert('Dismissed', 'Incident dismissed. No further action.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (action === 'escalate') {
        await updateIncidentStatus(incidentId, 'In Progress', 'Escalated to admin.');
        Alert.alert('Escalated', 'This incident has been escalated to admin.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardHeader topLabel="INVESTIGATION" title="Incident Detail" onBack={() => navigation.goBack()} />
        <View style={styles.center}><ActivityIndicator color={glass.brandPurple} /></View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardHeader topLabel="INVESTIGATION" title="Incident Detail" onBack={() => navigation.goBack()} />
        <View style={styles.center}><Text style={styles.emptyText}>Incident not found</Text></View>
      </SafeAreaView>
    );
  }

  const reportedBy = incident.reportedBy || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <DashboardHeader topLabel="INVESTIGATION" title="Incident Detail" onBack={() => navigation.goBack()} />

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <View style={styles.tabGradient}>
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </View>
              ) : (
                <Text style={styles.tabText}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'overview' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardInner}>
                <Text style={styles.cardHeader}>INCIDENT SUMMARY</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Type</Text>
                  <Text style={styles.value}>{incident.type?.replace(/_/g, ' ').toUpperCase() || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Severity</Text>
                  <Text style={[styles.value, { color: incident.severity === 'critical' ? colors.danger : colors.warning }]}>
                    {incident.severity?.toUpperCase() || 'MEDIUM'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Reported By</Text>
                  <Text style={styles.value}>{reportedBy.name || 'Gate staff'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Ticket Code</Text>
                  <Text style={[styles.value, { fontFamily: 'monospace' }]}>{incident.ticketCode || '—'}</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={styles.value}>{timeAgo(incident.createdAt)}</Text>
                </View>
                {incident.notes ? (
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.label}>Notes</Text>
                    <Text style={[styles.value, { flex: 2 }]}>{incident.notes}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </>
        )}

        {activeTab === 'ticket' && (
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.cardHeader}>TICKET FORENSICS</Text>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.label}>Ticket Code</Text>
                <Text style={[styles.value, { fontFamily: 'monospace' }]}>{incident.ticketCode || '—'}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'scans' && (
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.cardHeader}>FULL AUDIT TRAIL</Text>
              {attendanceLogs.length === 0 ? (
                <Text style={styles.emptyText}>No attendance logs found for this ticket</Text>
              ) : (
                attendanceLogs.map((scan, idx) => (
                  <View key={scan._id || idx} style={[styles.scanRow, idx < attendanceLogs.length - 1 && styles.scanRowBorder]}>
                    <View style={styles.scanLeft}>
                      <View style={[styles.scanDot, { backgroundColor: colors.success }]} />
                      <View>
                        <Text style={styles.scanGate}>{scan.scannedBy?.name || 'Unknown'} </Text>
                        <Text style={styles.scanTime}>{scan.entryTime ? timeAgo(scan.entryTime) : '—'}</Text>
                      </View>
                    </View>
                    <View style={[styles.scanStatusPill, { backgroundColor: colors.successSurface }]}>
                      <Text style={[styles.scanStatusText, { color: colors.success }]}>APPROVED</Text>
                    </View>
                  </View>
                ))
              )}
              {incident.ticketCode ? (
                <View style={[styles.scanRow, styles.scanRowBorder]}>
                  <View style={styles.scanLeft}>
                    <View style={[styles.scanDot, { backgroundColor: colors.danger }]} />
                    <View>
                      <Text style={styles.scanGate}>{reportedBy.name || 'Staff'} </Text>
                      <Text style={styles.scanTime}>{timeAgo(incident.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={[styles.scanStatusPill, { backgroundColor: colors.dangerSurface }]}>
                    <Text style={[styles.scanStatusText, { color: colors.danger }]}>
                      {incident.type?.replace(/_/g, ' ').toUpperCase() || 'DENIED'}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {activeTab === 'customer' && (
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.cardHeader}>CUSTOMER PROFILE</Text>
              {incident.ticket?.user ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{incident.ticket.user.name || '—'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{incident.ticket.user.email || '—'}</Text>
                  </View>
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.label}>Ticket Code</Text>
                    <Text style={[styles.value, { fontFamily: 'monospace' }]}>{incident.ticket.ticketCode || incident.ticketCode || '—'}</Text>
                  </View>
                </>
              ) : (
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.label}>Ticket Code</Text>
                  <Text style={styles.value}>{incident.ticketCode || '—'}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {incident.status === 'Open' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => handleAction('allow')}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            <View style={styles.bottomBtnInner}>
              <Text style={styles.bottomBtnText}>{actionLoading ? 'Processing...' : '✅ Allow Entry'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.bottomBtnHalf}
              onPress={() => handleAction('dismiss')}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              <View style={styles.bottomBtnHalfInner}>
                <Text style={styles.bottomBtnHalfText}>❌ Dismiss</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomBtnHalf}
              onPress={() => handleAction('escalate')}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              <View style={styles.bottomBtnHalfInnerEscalate}>
                <Text style={styles.bottomBtnHalfTextEscalate}>⬆️ Escalate</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing.huge + spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', paddingVertical: spacing.xl },

  tabBar: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  tabItem: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabItemActive: { borderWidth: 0, padding: 0 },
  tabGradient: { flex: 1, width: '100%', paddingVertical: spacing.sm + 2, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF', fontSize: typography.small.fontSize, fontWeight: '800' },

  card: { marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border },
  cardInner: { padding: spacing.xl },
  cardHeader: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: spacing.lg },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.textSecondary, fontSize: typography.caption.fontSize, flex: 1 },
  value: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: '700', textAlign: 'right', flex: 1.5, marginLeft: spacing.md },

  scanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  scanRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  scanLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scanDot: { width: 10, height: 10, borderRadius: 5 },
  scanGate: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  scanTime: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  scanStatusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  scanStatusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },

  bottomBar: { padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  bottomBtn: { borderRadius: radii.lg, overflow: 'hidden' },
  bottomBtnInner: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.success },
  bottomBtnText: { color: '#FFFFFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  bottomRow: { flexDirection: 'row', gap: spacing.md },
  bottomBtnHalf: { flex: 1, borderRadius: radii.lg, overflow: 'hidden' },
  bottomBtnHalfInner: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg, borderWidth: 1, borderColor: colors.dangerSurface, backgroundColor: colors.dangerSurface },
  bottomBtnHalfText: { color: colors.danger, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  bottomBtnHalfInnerEscalate: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radii.lg, borderWidth: 1, borderColor: colors.warningSurface, backgroundColor: colors.warningSurface },
  bottomBtnHalfTextEscalate: { color: colors.warning, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
