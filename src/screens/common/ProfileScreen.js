import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { getRoleDisplayName } from '../../constants/roleNavigation';
import { ROLES } from '../../constants/config';

export default function ProfileScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);
  const initials = (userInfo?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isAdmin = userInfo?.role === ROLES.ADMIN;
  const isStaff = userInfo?.role === ROLES.STAFF;
  const isSupervisor = userInfo?.role === ROLES.SUPERVISOR;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Header */}
        <LinearGradient colors={[`${colors.primaryDark}EE`, `${colors.primary}BB`, `${colors.primaryDark}66`]} style={styles.hero}>
          <View style={styles.avatarOuter}>
            <LinearGradient colors={colors.gradientGold} style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.name}>{userInfo?.name || 'User'}</Text>
          <Text style={styles.email}>{userInfo?.email || 'Not available'}</Text>
          <View style={styles.roleBadge}>
            <LinearGradient colors={[`${colors.primary}30`, `${colors.primary}15`]} style={styles.roleBadgeInner}>
              <Text style={styles.roleIcon}>🛡️</Text>
              <Text style={styles.roleText}>{getRoleDisplayName(userInfo?.role)}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            {[
              { value: isAdmin ? '12' : isSupervisor ? '8' : isStaff ? '48' : '3', label: isAdmin ? 'Matches' : isSupervisor ? 'Incidents' : isStaff ? 'Scans' : 'Bookings', icon: isAdmin ? '🏟️' : isSupervisor ? '🚨' : isStaff ? '📋' : '🎫' },
              { value: isAdmin ? 'Rs.2.4L' : isSupervisor ? '94%' : isStaff ? '99%' : 'Rs.4,800', label: isAdmin ? 'Revenue' : isSupervisor ? 'Resolved' : isStaff ? 'Accuracy' : 'Spent', icon: isAdmin ? '💰' : isSupervisor ? '✅' : isStaff ? '✅' : '💳' },
              { value: isAdmin ? '186' : isSupervisor ? '4' : isStaff ? '6' : '12', label: isAdmin ? 'Users' : isSupervisor ? 'Gates' : isStaff ? 'Gates' : 'Tickets', icon: isAdmin ? '👥' : isSupervisor ? '🚪' : isStaff ? '🚪' : '🎟️' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            {[
              { icon: '👤', label: 'Full Name', value: userInfo?.name || 'User' },
              { icon: '📧', label: 'Email', value: userInfo?.email || 'Not available' },
              { icon: '🛡️', label: 'Role', value: getRoleDisplayName(userInfo?.role) },
              { icon: '📅', label: 'Member Since', value: '2025' },
            ].map((item, idx) => (
              <View key={item.label} style={[styles.cardItem, idx < 3 && styles.cardItemBorder]}>
                <View style={styles.cardItemLeft}>
                  <Text style={styles.cardItemIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.cardItemLabel}>{item.label}</Text>
                    <Text style={styles.cardItemValue}>{item.value}</Text>
                  </View>
                </View>
                <Text style={styles.cardItemArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            {[
              { icon: '🔔', label: 'Notifications', value: 'On' },
              { icon: '🌙', label: 'Dark Mode', value: 'Always' },
              { icon: '📍', label: 'Location', value: 'Mumbai' },
              { icon: '🌐', label: 'Language', value: 'English' },
            ].map((item, idx) => (
              <TouchableOpacity key={item.label} style={[styles.cardItem, idx < 3 && styles.cardItemBorder]} activeOpacity={0.6}>
                <View style={styles.cardItemLeft}>
                  <Text style={styles.cardItemIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.cardItemLabel}>{item.label}</Text>
                    <Text style={styles.cardItemValue}>{item.value}</Text>
                  </View>
                </View>
                <Text style={styles.cardItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {[
              { icon: '❓', label: 'Help Center' },
              { icon: '💬', label: 'Contact Support' },
              { icon: '📜', label: 'Terms of Service' },
              { icon: '🔒', label: 'Privacy Policy' },
            ].map((item, idx) => (
              <TouchableOpacity key={item.label} style={[styles.cardItem, idx < 3 && styles.cardItemBorder]} activeOpacity={0.6}>
                <View style={styles.cardItemLeft}>
                  <Text style={styles.cardItemIcon}>{item.icon}</Text>
                  <Text style={styles.cardItemLabel}>{item.label}</Text>
                </View>
                <Text style={styles.cardItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <LinearGradient colors={[`${colors.danger}20`, `${colors.danger}08`]} style={styles.logoutInner}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Smart Stadium v1.0.0</Text>

        <View style={{ height: spacing.xxxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {},

  // Hero
  hero: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  avatarOuter: { marginBottom: spacing.lg },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    ...shadows.primary,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  name: { color: '#FFF', fontSize: typography.h2.fontSize, fontWeight: '900', marginBottom: spacing.xs },
  email: { color: 'rgba(255,255,255,0.6)', fontSize: typography.caption.fontSize, marginBottom: spacing.lg },
  roleBadge: { borderRadius: radii.full, overflow: 'hidden' },
  roleBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: `${colors.primaryLight}30`,
  },
  roleIcon: { fontSize: 12 },
  roleText: { color: colors.primaryLight, fontSize: typography.small.fontSize, fontWeight: '700' },

  // Stats
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statIcon: { fontSize: 20, marginBottom: spacing.sm },
  statValue: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '900', marginBottom: spacing.xxs },
  statLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

  // Sections
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  cardItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  cardItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  cardItemIcon: { fontSize: 18 },
  cardItemLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 1 },
  cardItemValue: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '600' },
  cardItemArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },

  // Logout
  logoutBtn: { borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.danger}25` },
  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  logoutIcon: { fontSize: 16 },
  logoutText: { color: colors.danger, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },

  version: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.5,
  },
});
