import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { colors } from '../../constants/theme';

export default function StaffHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Staff Gate"
        subtitle="QR scanning tools arrive in Sprint 4"
      />

      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>Gate Scanner</Text>
        <Text style={styles.message}>
          Staff will scan fan QR tickets here to validate stadium entry. This module will be built
          in the next sprint after booking goes live.
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
