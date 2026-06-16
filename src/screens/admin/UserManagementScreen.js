import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography } from '../../constants/theme';

const MOCK_USERS = [
  { name: 'Aman Kumar', email: 'aman@email.com', role: 'fan', status: 'active', lastActive: '2h ago' },
  { name: 'Riya Sharma', email: 'riya@email.com', role: 'fan', status: 'active', lastActive: '5h ago' },
  { name: 'Staff Gate A', email: 'gata@stadium.com', role: 'staff', status: 'active', lastActive: 'Now' },
  { name: 'Vikram Rao', email: 'vikram@email.com', role: 'fan', status: 'suspended', lastActive: '3d ago' },
];

const ROLE_COLORS = {
  fan: colors.primary,
  staff: colors.success,
  admin: colors.accent,
};

export default function UserManagementScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Users" subtitle="Manage accounts" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats */}
        <View style={styles.statRow}>
          {[
            { label: 'Total Users', value: '1,247', icon: '👥', color: colors.primary },
            { label: 'Active Today', value: '89', icon: '🟢', color: colors.success },
            { label: 'Staff Online', value: '12', icon: '🛡️', color: colors.warning },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* User list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Users</Text>
          <View style={styles.listCard}>
            {MOCK_USERS.map((user, idx) => (
              <View key={idx} style={[styles.userItem, idx < MOCK_USERS.length - 1 && styles.userItemBorder]}>
                <View style={styles.userLeft}>
                  <View style={[styles.userAvatar, { backgroundColor: `${ROLE_COLORS[user.role]}20` }]}>
                    <Text style={[styles.userInitial, { color: ROLE_COLORS[user.role] }]}>
                      {user.name[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.userRight}>
                  <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[user.role]}20`, borderColor: `${ROLE_COLORS[user.role]}30` }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[user.role] }]}>{user.role.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.lastActive}>{user.lastActive}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.md },

  statRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center',
  },
  statIcon: { fontSize: 16, marginBottom: spacing.sm },
  statValue: { fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  statLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '600', textAlign: 'center' },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', marginBottom: spacing.md },

  listCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  userItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
  },
  userItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  userAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  userInitial: { fontSize: typography.captionMedium.fontSize, fontWeight: '800' },
  userName: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700' },
  userEmail: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  userRight: { alignItems: 'flex-end', gap: spacing.xxs },
  rolePill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full, borderWidth: 1 },
  roleText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  lastActive: { color: colors.textMuted, fontSize: 9 },
});
