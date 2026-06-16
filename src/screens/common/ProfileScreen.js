import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { getRoleDisplayName } from '../../constants/roleNavigation';

export default function ProfileScreen() {
  const { userInfo, logout } = useContext(AuthContext);
  const initials = (userInfo?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={colors.gradientPurple} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{userInfo?.name || 'User'}</Text>
          <Text style={styles.email}>{userInfo?.email || 'Not available'}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{getRoleDisplayName(userInfo?.role)}</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          {[
            { label: 'Name', value: userInfo?.name || 'User', icon: '👤' },
            { label: 'Email', value: userInfo?.email || 'Not available', icon: '📧' },
            { label: 'Role', value: getRoleDisplayName(userInfo?.role), icon: '🛡️' },
          ].map((item) => (
            <View key={item.label} style={styles.infoCard}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.xl },

  header: { alignItems: 'center', marginBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg, ...shadows.primary,
  },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  name: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '800', marginBottom: spacing.xs },
  email: { color: colors.textMuted, fontSize: typography.caption.fontSize, marginBottom: spacing.md },
  rolePill: {
    backgroundColor: colors.primarySurface, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, borderRadius: radii.full,
    borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  roleText: { color: colors.primaryLight, fontSize: typography.tiny.fontSize, fontWeight: '700', letterSpacing: 0.5 },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.xl, padding: spacing.xl, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.lg,
  },
  infoIcon: { fontSize: 20 },
  infoContent: { flex: 1 },
  infoLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xxs },
  infoValue: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '600' },

  logoutBtn: {
    marginHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.surface,
  },
  logoutText: { color: colors.danger, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
});
