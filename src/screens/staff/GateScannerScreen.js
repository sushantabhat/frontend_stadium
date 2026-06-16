import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchScanHistory, verifyTicketCode } from '../../services/ticketService';

export default function GateScannerScreen({ navigation }) {
  const [ticketCode, setTicketCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load staff check-in history
  const loadHistory = useCallback(async () => {
    try {
      const historyData = await fetchScanHistory();
      setScanHistory(historyData);
    } catch {
      // Quietly ignore
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  // Handle manual code validation
  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || ticketCode;
    if (!code || !code.trim()) {
      Alert.alert('Input Required', 'Please enter or scan a ticket code.');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyTicketCode(code.trim());

      // Success -> Go to verification result screen (Green)
      navigation.navigate('TicketVerify', {
        status: 'success',
        message: response.message,
        ticket: response.ticket,
        fraudPrediction: response.fraudPrediction,
      });
      setTicketCode('');
    } catch (error) {
      const status = error.response?.status;
      const errMsg = error.response?.data?.message || 'Verification failed';

      // Duplicate scan (409 Conflict) -> Red Fraud warning
      // Invalid ticket (404 Not Found) -> Red Invalid warning
      // Behavioral anomaly (403 Forbidden) -> Yellow warning
      let screenStatus = 'fraud_invalid';
      if (status === 409) {
        screenStatus = 'fraud_duplicate';
      } else if (status === 403) {
        screenStatus = 'fraud_behavioral';
      }

      navigation.navigate('TicketVerify', {
        status: screenStatus,
        message: errMsg,
        ticketCode: code,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderHistoryItem = ({ item }) => {
    return (
      <View style={styles.historyRow}>
        <View style={styles.historyLeft}>
          <Text style={styles.historyUser}>{item.user?.name || 'Fan'}</Text>
          <Text style={styles.historySeat}>
            {item.seat?.seatLabel} ({item.seat?.category.toUpperCase()})
          </Text>
        </View>
        <View style={styles.historyRight}>
          <Text style={styles.historyTime}>
            {new Date(item.entryTime || item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>APPROVED</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Gate Scanner" subtitle="Stadium entry control panel" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mock QR Scanner visual layout */}
        <View style={styles.scannerWrapper}>
          <View style={styles.scannerFrame}>
            <Text style={styles.scannerEmoji}>📷</Text>
            <Text style={styles.scannerFrameText}>Simulator Scanner Mode Active</Text>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>

        {/* Manual entry / test bench */}
        <View style={styles.manualEntryCard}>
          <Text style={styles.cardHeader}>TICKET CODE ENTRY</Text>
          <Text style={styles.cardDesc}>
            Type in the ticket code below to simulate scanning a fan QR code.
          </Text>

          <TextInput
            style={styles.inputField}
            placeholder="e.g. TKT-69-A-1-XYZ"
            placeholderTextColor={colors.textMuted}
            value={ticketCode}
            onChangeText={setTicketCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={() => handleVerify()}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyBtnText}>Validate Ticket Code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Scan History list */}
        <View style={styles.historyCard}>
          <Text style={styles.cardHeader}>MY RECENT SCANS</Text>

          {isLoadingHistory ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : scanHistory.length === 0 ? (
            <Text style={styles.emptyHistory}>No scan records compiled in this shift.</Text>
          ) : (
            <FlatList
              data={scanHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.historyList}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  scannerWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scannerFrame: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: radii.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.md,
  },
  scannerEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  scannerFrameText: {
    color: colors.textSecondary,
    ...typography.caption,
    fontWeight: '700',
  },
  cornerTL: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primary,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primary,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primary,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  manualEntryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  cardHeader: {
    color: colors.textMuted,
    ...typography.tiny,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    color: colors.textSecondary,
    ...typography.small,
    marginBottom: spacing.lg,
  },
  inputField: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    ...shadows.sm,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '800',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  emptyHistory: {
    color: colors.textSecondary,
    ...typography.caption,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  historyList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  historyLeft: {
    flex: 1,
  },
  historyUser: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '700',
  },
  historySeat: {
    color: colors.textSecondary,
    ...typography.small,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyTime: {
    color: colors.textMuted,
    ...typography.small,
  },
  successBadge: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  successBadgeText: {
    color: colors.success,
    ...typography.tiny,
    fontWeight: '800',
  },
});
