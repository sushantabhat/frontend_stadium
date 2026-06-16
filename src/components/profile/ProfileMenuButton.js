import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { getRoleDisplayName } from '../../constants/roleNavigation';

const roleColors = {
  fan: colors.primary,
  user: colors.primary,
  staff: colors.success,
  admin: colors.accent,
};

export default function ProfileMenuButton({ compact = false }) {
  const navigation = useNavigation();
  const { userInfo, isLoading, logout } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);

  const closeMenu = () => setIsVisible(false);
  const openMenu = () => setIsVisible(true);

  const handleNavigate = (routeName) => {
    closeMenu();
    navigation.navigate(routeName);
  };

  const roleKey = userInfo?.role === 'user' ? 'fan' : userInfo?.role;
  const roleColor = roleColors[roleKey] || colors.primary;
  const initials = (userInfo?.name || 'U').slice(0, 1).toUpperCase();

  return (
    <>
      <TouchableOpacity
        accessibilityLabel="Open profile menu"
        onPress={openMenu}
        activeOpacity={0.7}
        style={[styles.trigger, compact && styles.triggerCompact]}
      >
        <View style={[styles.avatarDot, { backgroundColor: `${roleColor}20`, borderColor: `${roleColor}40` }]}>
          <Text style={[styles.avatarInitial, { color: roleColor }]}>{initials}</Text>
        </View>
      </TouchableOpacity>

      <Modal animationType="fade" transparent visible={isVisible} onRequestClose={closeMenu}>
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Pressable style={styles.sheet} onPress={() => null}>
            <View style={styles.grip} />

            <View style={styles.sheetHeader}>
              <View style={styles.identityRow}>
                <View style={[styles.avatarLarge, { backgroundColor: `${roleColor}15`, borderColor: `${roleColor}30` }]}>
                  <Text style={[styles.avatarLargeText, { color: roleColor }]}>{initials}</Text>
                </View>
                <View style={styles.identityText}>
                  <Text style={styles.nameText}>{userInfo?.name || 'Account'}</Text>
                  <Text style={styles.roleText}>{getRoleDisplayName(userInfo?.role)}</Text>
                </View>
              </View>
              <View style={[styles.sessionPill, { backgroundColor: colors.successSurface, borderColor: `${colors.success}30` }]}>
                <View style={styles.sessionDot} />
                <Text style={styles.sessionPillText}>Active session</Text>
              </View>
            </View>

            <View style={styles.menuSection}>
              <MenuItem
                icon="👤"
                label="Profile"
                onPress={() => handleNavigate('Profile')}
              />
              <MenuItem
                icon="⚙️"
                label="Settings"
                onPress={() => handleNavigate('Settings')}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="🚪"
                label={isLoading ? 'Signing out...' : 'Logout'}
                onPress={logout}
                destructive
                loading={isLoading}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({ icon, label, onPress, destructive = false, loading = false }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.6}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuItemIcon}>{icon}</Text>
        <Text style={[styles.menuItemText, destructive && styles.destructiveText]}>{label}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primaryLight} />
      ) : (
        <Text style={styles.menuItemArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerCompact: {
    width: 36,
    height: 36,
  },
  avatarDot: {
    width: '100%',
    height: '100%',
    borderRadius: radii.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 9, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xl,
  },
  grip: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetHeader: {
    marginBottom: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 22,
    fontWeight: '800',
  },
  identityText: {
    flex: 1,
  },
  nameText: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  roleText: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  sessionPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  sessionPillText: {
    color: colors.successLight,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  menuSection: {
    gap: spacing.sm,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  menuItem: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '600',
  },
  menuItemArrow: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
  destructiveText: {
    color: colors.danger,
  },
});
