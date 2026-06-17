import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

export default function TicketVerifyScreen({ route, navigation }) {
  const { status, message, ticket, ticketCode } = route.params || {};

  console.log(`[TicketVerifyScreen] status=${status} code=${ticketCode || ticket?.ticketCode || 'N/A'} msg="${message || ''}"`);

  const isSuccess = status === 'success';
  const isDuplicate = status === 'duplicate';
  const isNetworkError = status === 'network_error';

  let alertColor = colors.success;
  let alertSurface = colors.successSurface;
  let statusText = 'TICKET APPROVED';
  let badgeEmoji = '\u2705';

  if (isDuplicate) {
    alertColor = colors.danger;
    alertSurface = colors.dangerSurface;
    statusText = 'ALREADY USED';
    badgeEmoji = '\u26A0\uFE0F';
  } else if (isNetworkError) {
    alertColor = '#FF9500';
    alertSurface = 'rgba(255,149,0,0.12)';
    statusText = 'CONNECTION ERROR';
    badgeEmoji = '\uD83D\uDD0C';
  } else if (status === 'invalid') {
    alertColor = colors.danger;
    alertSurface = colors.dangerSurface;
    statusText = 'INVALID TICKET';
    badgeEmoji = '\u26A0\uFE0F';
  }

  const handleNext = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Scan Verification" onBack={handleNext} />

      <View style={styles.content}>
        {/* Status Alert Banner */}
        <View style={[styles.alertBanner, { backgroundColor: alertSurface, borderColor: alertColor }]}>
          <Text style={styles.badgeText}>{badgeEmoji}</Text>
          <Text style={[styles.statusTitle, { color: alertColor }]}>{statusText}</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Ticket details (success only) */}
        {isSuccess && ticket ? (
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeader}>TICKET DETAILS</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{ticket.user?.name || ticket.userName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Seat</Text>
              <Text style={styles.value}>
                {ticket.seat?.seatLabel || ticket.seatLabel || 'N/A'} ({(ticket.seat?.category || ticket.category || 'general').toUpperCase()})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Match</Text>
              <Text style={styles.value}>{ticket.match?.title || ticket.matchTitle || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Ticket Code</Text>
              <Text style={styles.codeValue}>{ticket.ticketCode}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: colors.success, fontWeight: '800' }]}>VERIFIED</Text>
            </View>
          </View>
        ) : (
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeader}>SCAN LOG</Text>
            {ticketCode ? (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Scanned Code</Text>
                <Text style={styles.codeValue}>{ticketCode}</Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Result</Text>
              <Text style={[styles.value, { color: isNetworkError ? '#FF9500' : colors.danger, fontWeight: '800' }]}>
                {isNetworkError ? 'Server unreachable' : isDuplicate ? 'Ticket already used' : 'Invalid ticket code'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Action</Text>
              <Text style={styles.value}>
                {isNetworkError ? 'Check WiFi and try again' : isDuplicate ? 'Deny entry — duplicate scan' : 'Deny entry — ticket not found'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: alertColor }]}
          onPress={handleNext}
        >
          <Text style={styles.actionButtonText}>Scan Next Ticket</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  alertBanner: {
    borderWidth: 2,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.md,
  },
  badgeText: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h2,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  messageText: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  cardHeader: {
    color: colors.textMuted,
    ...typography.tiny,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  value: {
    color: colors.textPrimary,
    ...typography.caption,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  codeValue: {
    color: colors.primary,
    fontFamily: 'Courier',
    ...typography.small,
    fontWeight: '700',
  },
  actionButton: {
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    ...shadows.sm,
  },
  actionButtonText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '800',
  },
});
