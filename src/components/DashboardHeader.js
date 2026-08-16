import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography } from '../constants/theme';
import { useColors } from '../context/ThemeContext';

export default function DashboardHeader({
  topLabel,
  title,
  subtitle,
  avatarLabel,
  avatarColors,
  avatarBorderColor,
  fallbackIcon,
  onAvatarPress,
  onBack,
}) {
  const colors = useColors();
  const showAvatar = avatarLabel && (onAvatarPress || fallbackIcon);
  const showFallback = !avatarLabel && fallbackIcon;

  const resolvedAvatarColors = avatarColors || colors.gradientPurple;
  const resolvedBorderColor = avatarBorderColor || colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={onBack} activeOpacity={0.7}>
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>←</Text>
          </TouchableOpacity>
        )}
        <View style={onBack ? styles.titleWithBack : styles.titleOnly}>
          {topLabel ? <Text style={[styles.topLabel, { color: colors.textMuted }]}>{topLabel}</Text> : null}
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {showAvatar ? (
        <TouchableOpacity
          style={[styles.avatarWrap, { borderColor: resolvedBorderColor }]}
          onPress={onAvatarPress}
          activeOpacity={0.8}
        >
          <LinearGradient colors={resolvedAvatarColors} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{avatarLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : showFallback ? (
        <View style={[styles.avatarWrap, { borderColor: resolvedBorderColor }]}>
          <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.md },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  backBtnText: { fontSize: 16, fontWeight: '700' },
  titleWithBack: { flex: 1 },
  titleOnly: { flex: 1 },
  topLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  fallbackIcon: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 42,
  },
});