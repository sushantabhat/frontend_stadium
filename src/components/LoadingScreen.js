import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { colors, spacing, typography } from '../constants/theme';

export default function LoadingScreen({ message = 'Loading...' }) {
  const theme = useContext(ThemeContext);
  return (
    <View style={[styles.container, { backgroundColor: theme?.backgroundColor || colors.background }]}>
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
      <Text style={styles.brand}>SMART STADIUM</Text>
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
    paddingHorizontal: spacing.xxxl,
  },
  loaderWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: typography.label.fontSize,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
});
