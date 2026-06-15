import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function LoadingScreen({ message = 'Loading session...' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🏟️</Text>
      <ActivityIndicator size="large" color={colors.primaryLight} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
