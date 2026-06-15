import React, { useContext, useMemo, useState } from 'react';
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
import { colors } from '../../constants/theme';
import {
  canSwitchToRole,
  getDashboardRoute,
  getRoleDisplayName,
  getSwitchableRoles,
} from '../../constants/roleNavigation';

export default function ProfileMenuButton({ compact = false }) {
  const navigation = useNavigation();
  const { userInfo, isLoading, logout, switchRole } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);

  const switchableRoles = useMemo(() => getSwitchableRoles(userInfo), [userInfo]);

  const closeMenu = () => setIsVisible(false);
  const openMenu = () => setIsVisible(true);

  const handleNavigate = (routeName) => {
    closeMenu();
    navigation.navigate(routeName);
  };

  const handleSwitchRole = async (role) => {
    if (!canSwitchToRole(userInfo, role)) {
      return;
    }

    closeMenu();
    await switchRole(role);
    navigation.navigate(getDashboardRoute(role));
  };

  return (
    <>
      <TouchableOpacity
        accessibilityLabel="Open profile menu"
        onPress={openMenu}
        style={[styles.trigger, compact && styles.triggerCompact]}
      >
        <Text style={[styles.triggerIcon, compact && styles.triggerIconCompact]}>👤</Text>
      </TouchableOpacity>

      <Modal animationType="fade" transparent visible={isVisible} onRequestClose={closeMenu}>
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Pressable style={styles.sheet} onPress={() => null}>
            <View style={styles.grip} />
            <View style={styles.identityRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(userInfo?.name || 'U').slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.identityText}>
                <Text style={styles.nameText}>{userInfo?.name || 'Account'}</Text>
                <Text style={styles.roleText}>{getRoleDisplayName(userInfo?.role)}</Text>
              </View>
            </View>

            <View style={styles.menuSection}>
              <MenuItem label="Profile" onPress={() => handleNavigate('Profile')} />
              <MenuItem label="Settings" onPress={() => handleNavigate('Settings')} />
              <MenuItem
                label={isLoading ? 'Signing out...' : 'Logout'}
                onPress={logout}
                destructive
                loading={isLoading}
              />
            </View>

            {switchableRoles.length > 0 ? (
              <View style={styles.switchSection}>
                <Text style={styles.sectionLabel}>Switch Dashboard</Text>
                <View style={styles.switchRow}>
                  {switchableRoles.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={styles.switchChip}
                      onPress={() => handleSwitchRole(role)}
                    >
                      <Text style={styles.switchChipText}>{getRoleDisplayName(role)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({ label, onPress, destructive = false, loading = false }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={loading}>
      <Text style={[styles.menuItemText, destructive && styles.destructiveText]}>{label}</Text>
      {loading ? <ActivityIndicator size="small" color={colors.primaryLight} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  triggerCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  triggerIcon: {
    fontSize: 18,
  },
  triggerIconCompact: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  grip: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  identityText: {
    flex: 1,
  },
  nameText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  roleText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  menuSection: {
    gap: 8,
    marginBottom: 16,
  },
  menuItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  destructiveText: {
    color: colors.danger,
  },
  switchSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchChipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
