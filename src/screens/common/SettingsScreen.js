import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.icon}>⚙️</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.text}>App preferences and configuration options.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  icon: { fontSize: 48, marginBottom: spacing.lg },
  title: {
    color: colors.textPrimary, fontSize: typography.h3.fontSize,
    fontWeight: '700', marginBottom: spacing.sm,
  },
  text: {
    color: colors.textMuted, fontSize: typography.caption.fontSize,
    textAlign: 'center', lineHeight: 20,
  },
});
