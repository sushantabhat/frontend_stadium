import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, typography } from '../../constants/theme';

export default function WishlistScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="My Wishlist" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.icon}>❤️</Text>
        <Text style={styles.title}>No Saved Matches</Text>
        <Text style={styles.text}>Save matches you&apos;re interested in for quick access later.</Text>
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
