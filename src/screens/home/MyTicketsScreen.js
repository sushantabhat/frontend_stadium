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
import { colors } from '../../constants/theme';
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
    // Generate QR code URL using a public API (reliable, web-safe, zero native package bugs)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      item.ticketCode
    )}&color=07111f&bgcolor=ffffff`;

    return (
      <View style={styles.ticketCard}>
        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <Text style={styles.matchTitle} numberOfLines={1}>
            {item.match?.title}
          </Text>
          <View
            style={[
              styles.scannedBadge,
              { backgroundColor: item.scanned ? `${colors.danger}20` : `${colors.success}20` },
            ]}
          >
            <Text
              style={[
                styles.scannedBadgeText,
                { color: item.scanned ? colors.danger : colors.success },
              ]}
            >
              {item.scanned ? 'SCANNED' : 'VALID'}
            </Text>
          </View>
        </View>

        {/* Match details */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📍 {item.match?.venue}</Text>
          <Text style={styles.metaText}>
            🗓 {item.match ? formatMatchDate(item.match.matchDate) : ''}
          </Text>
        </View>

        {/* Dotted separator divider */}
        <View style={styles.separatorContainer}>
          <View style={styles.leftCutout} />
          <View style={styles.dottedLine} />
          <View style={styles.rightCutout} />
        </View>

        {/* Ticket Lower half (QR and Seat details) */}
        <View style={styles.ticketBody}>
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
              <Text style={styles.infoValue}>₹{item.seat?.price}</Text>
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
          <ActivityIndicator size="large" color={colors.primaryLight} />
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
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  ticketHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFBFD',
  },
  matchTitle: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  scannedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scannedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FAFBFD',
  },
  metaText: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 4,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 20,
  },
  leftCutout: {
    width: 10,
    height: 20,
    backgroundColor: colors.background,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginLeft: -1,
  },
  rightCutout: {
    width: 10,
    height: 20,
    backgroundColor: colors.background,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: -1,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  ticketBody: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  qrCode: {
    width: 120,
    height: 120,
  },
  ticketCodeText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  seatInfo: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
    gap: 12,
  },
  infoBlock: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoValue: {
    color: '#07111F',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
});
