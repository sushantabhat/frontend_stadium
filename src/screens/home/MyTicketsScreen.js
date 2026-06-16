import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMyTickets } from '../../services/ticketService';

export default function MyTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyTickets();
      setTickets(data);
    } catch {
      // handle quietly
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  const upcoming = tickets.filter(t => !t.scanned);

  const renderTicket = ({ item }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(item.ticketCode)}&color=FFFFFF&bgcolor=6C5CE7`;
    const category = (item.seat?.category || 'general').toUpperCase();

    return (
      <View style={styles.ticketWrapper}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ticketCard}
        >
          {/* Top */}
          <View style={styles.ticketTop}>
            <View style={styles.ticketBrand}>
              <Text style={styles.ticketBrandText}>SMART STADIUM</Text>
            </View>
            <View style={[styles.catBadge, category === 'VIP' && styles.catBadgeVip]}>
              <Text style={[styles.catText, category === 'VIP' && styles.catTextVip]}>{category}</Text>
            </View>
          </View>

          <Text style={styles.matchTitle} numberOfLines={1}>{item.match?.title}</Text>

          <View style={styles.teamsRow}>
            <Text style={styles.teamText}>{item.match?.teamA || 'TBA'}</Text>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.teamText}>{item.match?.teamB || 'TBA'}</Text>
          </View>

          <View style={styles.dividerDashed} />

          {/* Details */}
          <View style={styles.detailsRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>SEAT</Text>
              <Text style={styles.detailValue}>{item.seat?.seatLabel || 'N/A'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>PRICE</Text>
              <Text style={styles.detailValue}>₹{item.seat?.price || '—'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>VENUE</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.match?.venue || '—'}</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          {/* QR */}
          <View style={styles.qrSection}>
            <View style={styles.qrBox}>
              <Image source={{ uri: qrUrl }} style={styles.qrImage} />
            </View>
            <Text style={styles.qrHint}>📱 Show this at the entry gate</Text>
          </View>

          {/* Status */}
          <View style={[styles.statusBanner, item.scanned ? styles.statusScanned : styles.statusValid]}>
            <Text style={[styles.statusBannerText, item.scanned ? styles.statusTextScanned : styles.statusTextValid]}>
              {item.scanned ? '⚠️ ALREADY SCANNED' : '✅ VALID TICKET'}
            </Text>
          </View>
        </LinearGradient>

        {/* Ticket notches */}
        <View style={[styles.notch, styles.notchLeft]} />
        <View style={[styles.notch, styles.notchRight]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={upcoming}
        renderItem={renderTicket}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>My Tickets</Text>
            <Text style={styles.pageSubtitle}>Present QR codes at the entry gate</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={styles.emptyTitle}>No Tickets Yet</Text>
              <Text style={styles.emptyText}>Book a match to see your tickets here</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xxl }} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxxl },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    marginBottom: spacing.xl,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },

  // Ticket
  ticketWrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  ticketCard: {
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    ...shadows.lg,
  },
  notch: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    top: '50%',
    marginTop: -12,
  },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },

  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ticketBrand: {},
  ticketBrandText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  catBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  catBadgeVip: { backgroundColor: `${colors.accent}40` },
  catText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  catTextVip: { color: colors.accent },

  matchTitle: {
    color: '#FFF',
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  teamText: { color: 'rgba(255,255,255,0.85)', fontSize: typography.bodyMedium.fontSize, fontWeight: '600' },
  vsText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },

  dividerDashed: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.lg,
    marginHorizontal: -spacing.xxl,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: { flex: 1 },
  detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  detailValue: { color: '#FFF', fontSize: typography.captionMedium.fontSize, fontWeight: '700' },

  qrSection: { alignItems: 'center', marginBottom: spacing.lg },
  qrBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  qrImage: { width: 120, height: 120, borderRadius: radii.md },
  qrHint: { color: 'rgba(255,255,255,0.6)', fontSize: typography.small.fontSize, fontWeight: '500' },

  statusBanner: {
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  statusValid: { backgroundColor: 'rgba(0,200,83,0.2)' },
  statusScanned: { backgroundColor: 'rgba(255,59,48,0.2)' },
  statusBannerText: { fontSize: typography.tiny.fontSize, fontWeight: '800', letterSpacing: 1 },
  statusTextValid: { color: colors.successLight },
  statusTextScanned: { color: colors.dangerLight },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700', marginBottom: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },
});
