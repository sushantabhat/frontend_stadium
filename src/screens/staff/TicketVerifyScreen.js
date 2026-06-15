import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors } from '../../constants/theme';

export default function TicketVerifyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="Ticket Verification"
        subtitle="Validate and verify tickets"
      />

      <View style={styles.content}>
        <Text style={styles.icon}>🎫</Text>
        <Text style={styles.title}>Verify Tickets</Text>
        <Text style={styles.message}>
          Verify ticket authenticity and validity before allowing entry to the stadium.
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
