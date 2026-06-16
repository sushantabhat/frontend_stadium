import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, commonStyles } from '../../constants/theme';

export default function TicketVerifyScreen({ route, navigation }) {
  const { status, message, ticket, ticketCode, fraudPrediction } = route.params;

  const isSuccess = status === 'success';
  const isDuplicate = status === 'fraud_duplicate';
  const isBehavioral = status === 'fraud_behavioral';

  let alertColor = colors.success;
  let statusText = 'TICKET APPROVED';
  let badgeEmoji = '✅';

  if (isDuplicate) {
    alertColor = colors.danger;
    statusText = 'FRAUD ALERT: DUPLICATE';
    badgeEmoji = '🚨';
  } else if (isBehavioral) {
    alertColor = colors.warning;
    statusText = 'BEHAVIORAL ANOMALY DETECTED';
    badgeEmoji = '⚠️';
  } else if (status === 'fraud_invalid') {
    alertColor = colors.warning;
    statusText = 'INVALID TICKET';
    badgeEmoji = '⚠️';
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
        <View style={[styles.alertBanner, { backgroundColor: `${alertColor}15`, borderColor: alertColor }]}>
          <Text style={[styles.badgeText]}>{badgeEmoji}</Text>
          <Text style={[styles.statusTitle, { color: alertColor }]}>{statusText}</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Detailed stats */}
        {isSuccess && ticket ? (
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeader}>ATTENDEE METRIC</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{ticket.user?.name || ticket.userName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Seat Assignment</Text>
              <Text style={styles.value}>
                {ticket.seat?.seatLabel || ticket.seatLabel || 'N/A'} ({(ticket.seat?.category || ticket.category || 'general').toUpperCase()})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Fixture</Text>
              <Text style={styles.value}>{ticket.match?.title || ticket.matchTitle || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Ticket Code</Text>
              <Text style={styles.codeValue}>{ticket.ticketCode}</Text>
            </View>
            {fraudPrediction && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>AI Risk Assessment</Text>
                <Text style={[styles.value, { color: colors.success, fontWeight: '800' }]}>
                  {fraudPrediction.classification === 'safe' ? 'CLEAN' : fraudPrediction.classification.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeader}>SECURITY LOGS</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Scanned Code</Text>
              <Text style={styles.codeValue}>{ticketCode}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Audit Classification</Text>
              <Text style={[styles.value, { color: colors.danger, fontWeight: '800' }]}>
                {isDuplicate ? 'AI Flags: Repeated Entry Threat' : 
                 isBehavioral ? 'AI Flags: Behavioral Anomaly' : 'AI Flags: Counterfeit Signature'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Security Action</Text>
              <Text style={styles.value}>
                {isBehavioral ? 'Flag for manual review' : 'Deny stadium gates entry.'}
              </Text>
            </View>
            {isBehavioral && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Risk Level</Text>
                <Text style={[styles.value, { color: colors.warning }]}>
                  Medium-High (Behavioral Pattern Detected)
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[commonStyles.primaryButton, { backgroundColor: alertColor, shadowColor: alertColor }]}
          onPress={handleNext}
        >
          <Text style={commonStyles.primaryButtonText}>Scan Next Ticket</Text>
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
    padding: 16,
    justifyContent: 'center',
    gap: 20,
  },
  alertBanner: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: `${colors.border}40`,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  codeValue: {
    color: colors.primaryLight,
    fontFamily: 'Courier',
    fontSize: 12,
    fontWeight: '700',
  },
});
