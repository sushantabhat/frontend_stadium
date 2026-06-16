import React, { useContext, useMemo } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { colors, spacing, radii, typography } from '../constants/theme';
import ProfileMenuButton from './profile/ProfileMenuButton';

const roleColors = {
  fan: colors.primary,
  user: colors.primary,
  staff: colors.success,
  admin: colors.accent,
};

export default function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const handleBack = useMemo(() => {
    if (onBack) return onBack;
    if (navigation?.canGoBack?.()) return () => navigation.goBack();
    return null;
  }, [navigation, onBack]);

  const roleKey = userInfo?.role === 'user' ? 'fan' : userInfo?.role;
  const roleColor = roleColors[roleKey] || colors.primary;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={[styles.accentLine, { backgroundColor: roleColor }]} />

        <View style={styles.topRow}>
          {handleBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <ProfileMenuButton compact />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.roleChip, { backgroundColor: `${roleColor}18`, borderColor: `${roleColor}40` }]}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleChipText, { color: roleColor }]}>
              {userInfo?.role?.toUpperCase()}
            </Text>
          </View>
          {userInfo?.name ? (
            <Text style={styles.userName}>{userInfo.name}</Text>
          ) : null}
        </View>

        {rightAction ? <View style={styles.actionRow}>{rightAction}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  accentLine: {
    width: 40,
    height: 3,
    borderRadius: 3,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  backArrow: {
    color: colors.primaryLight,
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
  },
  backText: {
    color: colors.primaryLight,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
  backPlaceholder: {
    width: 60,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    letterSpacing: typography.h1.letterSpacing,
    lineHeight: typography.h1.lineHeight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    lineHeight: typography.caption.lineHeight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: spacing.xs + 2,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleChipText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: typography.tiny.fontWeight,
    letterSpacing: typography.tiny.letterSpacing,
  },
  userName: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: spacing.md,
  },
});
