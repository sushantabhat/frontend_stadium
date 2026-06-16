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
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchMyTickets } from '../../services/ticketService';
import { formatMatchDate } from '../../utils/date';
import EmptyState from '../../components/EmptyState';

export default function MyTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyTickets();
      setTickets(data);
    } catch {
      // Ignore / handle quietly
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const renderTicketItem = ({ item }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      item.ticketCode
    )}&color=07111f&bgcolor=ffffff`;

    return (
      <View style={styles.ticketCard}>
        {/* Upper section */}
        <View style={styles.ticketUpper}>
          <View style={styles.ticketHeader}>
            <Text style={styles.matchTitle} numberOfLines={1}>
              {item.match?.title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.scanned ? `${colors.danger}18` : `${colors.success}18` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.scanned ? colors.danger : colors.success },
                ]}
              >
                {item.scanned ? 'SCANNED' : 'VALID'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.match?.venue}</Text>
            <Text style={styles.metaText}>
              {item.match ? formatMatchDate(item.match.matchDate) : ''}
            </Text>
          </View>
        </View>

        {/* Ticket stub separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.leftCutout} />
          <View style={styles.dashedLine} />
          <View style={styles.rightCutout} />
        </View>

        {/* Lower section */}
        <View style={styles.ticketLower}>
          <View style={styles.qrContainer}>
            <Image source={{ uri: qrUrl }} style={styles.qrCode} />
            <Text style={styles.ticketCodeText}>{item.ticketCode}</Text>
          </View>

          <View style={styles.seatInfo}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>CATEGORY</Text>
              <Text style={styles.infoValue}>{item.seat?.category.toUpperCase()}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>SEAT NO</Text>
              <Text style={styles.infoValue}>{item.seat?.seatLabel}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>PRICE</Text>
              <Text style={styles.infoValue}>{item.seat?.price}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="My Tickets" subtitle="Present QR codes at the gate entry" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            title="No Tickets Found"
            description="You don't have any booked tickets yet. Go back and select an upcoming match to book!"
            actionText="Browse Matches"
            onAction={() => navigation.navigate('MatchList')}
            icon="🎫"
          />
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    overflow: 'hidden',
  },
  ticketUpper: {
    padding: spacing.lg,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  matchTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  statusText: {
    ...typography.tiny,
    fontWeight: '800',
  },
  metaRow: {
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: colors.surface,
  },
  leftCutout: {
    width: 12,
    height: 24,
    backgroundColor: colors.background,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: -1,
  },
  rightCutout: {
    width: 12,
    height: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: -1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  ticketLower: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrContainer: {
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  qrCode: {
    width: 110,
    height: 110,
  },
  ticketCodeText: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  seatInfo: {
    flex: 1,
    paddingLeft: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  infoBlock: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '800',
    marginTop: 2,
  },
});
