import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography } from '../../constants/theme';

const SETTINGS_SECTIONS = [
  {
    title: 'Pricing',
    items: [
      { icon: '💰', label: 'Base Pricing', value: 'VIP ₹2500 / Premium ₹1500 / General ₹800' },
      { icon: '📈', label: 'Dynamic Multiplier', value: 'Enabled (1.0x — 1.4x)' },
      { icon: '⏰', label: 'Last-minute Surge', value: '2x within 2 hours' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { icon: '🔔', label: 'Push Notifications', value: 'On' },
      { icon: '📧', label: 'Email Alerts', value: 'On' },
      { icon: '🚨', label: 'Fraud Alerts', value: 'Staff + Admin' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: '🔒', label: 'Seat Lock Timeout', value: '10 minutes' },
      { icon: '🔄', label: 'Auto-cancel Unpaid', value: '15 minutes' },
      { icon: '📊', label: 'Analytics Retention', value: '90 days' },
    ],
  },
];

export default function AdminSettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Settings" subtitle="System configuration" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.item, itemIdx < section.items.length - 1 && styles.itemBorder]}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIcon}>{item.icon}</Text>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemValue}>{item.value}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.md },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.md },

  card: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  itemIcon: { fontSize: 16 },
  itemLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemValue: { color: colors.textMuted, fontSize: typography.small.fontSize },
  chevron: { color: colors.textMuted, fontSize: 18, fontWeight: '600' },
});
