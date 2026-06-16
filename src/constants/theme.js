import { StyleSheet } from 'react-native';

const palette = {
  background: '#0A0E1A',
  backgroundDeep: '#060912',
  surface: '#121829',
  surfaceElevated: '#1A2238',
  surfaceHighlight: '#212B45',
  border: '#1E2A42',
  borderLight: '#2A3654',
  borderSubtle: '#161F33',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0A0E1A',

  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.15)',
  primarySurface: 'rgba(99, 102, 241, 0.08)',

  accent: '#F472B6',
  accentLight: '#F9A8D4',

  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  dangerSurface: 'rgba(239, 68, 68, 0.12)',

  success: '#10B981',
  successLight: '#6EE7B7',
  successSurface: 'rgba(16, 185, 129, 0.12)',

  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningSurface: 'rgba(245, 158, 11, 0.12)',

  info: '#06B6D4',
  infoLight: '#67E8F9',
  infoSurface: 'rgba(6, 182, 212, 0.12)',

  vip: '#FBBF24',
  vipSurface: 'rgba(251, 191, 36, 0.12)',
  premium: '#A78BFA',
  premiumSurface: 'rgba(167, 139, 250, 0.12)',
  general: '#60A5FA',
  generalSurface: 'rgba(96, 165, 250, 0.12)',

  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
  gradientAccent: '#EC4899',
};

export const colors = palette;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const typography = {
  hero: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 40,
  },
  h1: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.1,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  captionMedium: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },

  screenPadding: {
    paddingHorizontal: spacing.lg,
  },

  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },

  // Section styles
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
    letterSpacing: typography.h3.letterSpacing,
  },
  sectionSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },

  // Form styles
  formSection: {
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    letterSpacing: typography.label.letterSpacing,
  },
  inputField: {
    backgroundColor: colors.surfaceElevated,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: radii.lg,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
    ...shadows.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  ghostButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: colors.primaryLight,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },

  // Text styles
  linkText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  highlightText: {
    color: colors.primaryLight,
    fontWeight: '700',
  },

  // Brand styles
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  brandMarkText: {
    fontSize: 36,
  },
  brandTitle: {
    fontSize: typography.hero.fontSize,
    fontWeight: typography.hero.fontWeight,
    color: colors.textPrimary,
    letterSpacing: typography.hero.letterSpacing,
    marginBottom: spacing.sm,
  },
  brandSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },

  // Badge styles
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: typography.tiny.fontWeight,
    color: colors.textSecondary,
    letterSpacing: typography.tiny.letterSpacing,
  },
  badgePrimary: {
    backgroundColor: colors.primarySurface,
    borderColor: `${colors.primary}40`,
  },
  badgePrimaryText: {
    color: colors.primaryLight,
  },
  badgeSuccess: {
    backgroundColor: colors.successSurface,
    borderColor: `${colors.success}40`,
  },
  badgeSuccessText: {
    color: colors.successLight,
  },
  badgeDanger: {
    backgroundColor: colors.dangerSurface,
    borderColor: `${colors.danger}40`,
  },
  badgeDangerText: {
    color: colors.dangerLight,
  },
  badgeWarning: {
    backgroundColor: colors.warningSurface,
    borderColor: `${colors.warning}40`,
  },
  badgeWarningText: {
    color: colors.warningLight,
  },
});
