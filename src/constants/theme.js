import { Platform, StyleSheet } from 'react-native';

const palette = {
  background: '#0F111A',
  backgroundDeep: '#080A12',
  surface: '#1A1D2A',
  surfaceElevated: '#222638',
  surfaceHighlight: '#2C3048',
  border: '#2A2E3E',
  borderLight: '#363B50',
  borderSubtle: '#1E2130',

  textPrimary: '#FFFFFF',
  textSecondary: '#B0B8C8',
  textMuted: '#6B7280',
  textInverse: '#0F111A',

  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',
  primaryGlow: 'rgba(108, 92, 231, 0.25)',
  primarySurface: 'rgba(108, 92, 231, 0.10)',

  accent: '#FFD700',
  accentLight: '#FFE44D',
  accentDark: '#E6C200',
  accentSurface: 'rgba(255, 215, 0, 0.10)',

  danger: '#FF3B30',
  dangerLight: '#FF6B61',
  dangerSurface: 'rgba(255, 59, 48, 0.12)',

  success: '#00C853',
  successLight: '#69F0AE',
  successSurface: 'rgba(0, 200, 83, 0.12)',

  warning: '#FFB300',
  warningLight: '#FFD54F',
  warningSurface: 'rgba(255, 179, 0, 0.12)',

  info: '#00B0FF',
  infoLight: '#40C4FF',
  infoSurface: 'rgba(0, 176, 255, 0.12)',

  platinum: '#E8E8E8',
  platinumSurface: 'rgba(232, 232, 232, 0.12)',
  premium: '#6C5CE7',
  premiumSurface: 'rgba(108, 92, 231, 0.12)',
  general: '#5B9BD5',
  generalSurface: 'rgba(91, 155, 213, 0.12)',

  category1: '#FFD700',
  category1Surface: 'rgba(255, 215, 0, 0.12)',
  category2: '#FF6B6B',
  category2Surface: 'rgba(255, 107, 107, 0.12)',
  category3: '#A29BFE',
  category3Surface: 'rgba(162, 155, 254, 0.12)',
  category4: '#EF5350',
  category4Surface: 'rgba(239, 83, 80, 0.12)',
  gold: '#FFD700',
  goldSurface: 'rgba(255, 215, 0, 0.12)',
  silver: '#A8A8A8',
  silverSurface: 'rgba(168, 168, 168, 0.12)',
  bronze: '#CD7F32',
  bronzeSurface: 'rgba(205, 127, 50, 0.12)',
  supporters: '#81C784',
  supportersSurface: 'rgba(129, 199, 132, 0.12)',

  gradientStart: '#6C5CE7',
  gradientEnd: '#4834D4',
  gradientAccent: '#FFD700',
  gradientHero: ['#0B1C3D', '#1A1D2A'],
  gradientCard: ['#1A1D2A', '#222638'],
  gradientPurple: ['#6C5CE7', '#4834D4'],
  gradientGold: ['#FFD700', '#E6C200'],
  gradientLive: ['#FF3B30', '#FF6B61'],
};

/* ─── Glassmorphic Design Tokens ───
 * Additive export for the admin glassmorphic UI layer.
 * Existing screens using `colors` remain unaffected. */
export const glass = {
  /* Canvas: pitch-black workspace background */
  canvasStart: '#07080B',
  canvasEnd: '#0A0B0E',

  /* Component surfaces: semi-transparent dark cards */
  surface: 'rgba(18, 21, 34, 0.65)',
  surfaceElevated: 'rgba(18, 21, 34, 0.75)',
  card: '#161B22',

  /* Borders: super-fine translucent high-contrast paths */
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(255, 255, 255, 0.15)',

  /* Gradient backdrop: top-left highlight → bottom-right dark fade */
  highlight: 'rgba(255, 255, 255, 0.05)',
  highlightStrong: 'rgba(255, 255, 255, 0.10)',

  /* Neon brand accents */
  neonCyan: '#00E5FF',
  neonMagenta: '#FF2E93',
  neonPurple: '#8A2BE2',
  neonAmber: '#FFEE55',

  /* TICKETPRO admin palette */
  brandPurple: '#7B61FF',
  brandPurpleGlow: 'rgba(123, 97, 255, 0.35)',
  brandPurpleSurface: 'rgba(123, 97, 255, 0.15)',
  occupancyTeal: '#00D4AA',
  occupancyTealGlow: 'rgba(0, 212, 170, 0.25)',

  /* Neon glow colors (for shadows) */
  neonCyanGlow: 'rgba(0, 229, 255, 0.35)',
  neonMagentaGlow: 'rgba(255, 46, 147, 0.35)',
  neonPurpleGlow: 'rgba(138, 43, 226, 0.30)',
  neonAmberGlow: 'rgba(255, 238, 85, 0.25)',

  /* Semantic status badge fills (low-opacity tints) */
  statusSuccessFill: 'rgba(0, 230, 118, 0.12)',
  statusSuccessText: '#00E676',
  statusWarningFill: 'rgba(255, 179, 0, 0.10)',
  statusWarningText: '#FFB300',
  statusDangerFill: 'rgba(255, 23, 68, 0.12)',
  statusDangerText: '#FF1744',

  /* Labels & secondary text */
  textMuted: '#94A3B8',
  textSecondary: '#A0AEC0',

  /* Monospace typography reference (used in StyleSheet) */
  monoFont: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  xxh: 48,
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  accent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  gold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  /* Glassmorphic neon glow shadows */
  neonCyan: {
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  neonMagenta: {
    shadowColor: '#FF2E93',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  neonPurple: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
  glassCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const CATEGORY_COLORS = {
  platinum: { accent: palette.platinum, bg: palette.platinumSurface, label: 'Platinum' },
  gold: { accent: palette.gold, bg: palette.goldSurface, label: 'Gold' },
  silver: { accent: palette.silver, bg: palette.silverSurface, label: 'Silver' },
  bronze: { accent: palette.bronze, bg: palette.bronzeSurface, label: 'Bronze' },
  general: { accent: palette.general, bg: palette.generalSurface, label: 'General' },
  supporters: { accent: palette.supporters, bg: palette.supportersSurface, label: 'Supporters' },
  category1: { accent: palette.category1, bg: palette.category1Surface, label: 'Category 1' },
  category2: { accent: palette.category2, bg: palette.category2Surface, label: 'Category 2' },
  category3: { accent: palette.category3, bg: palette.category3Surface, label: 'Category 3' },
  category4: { accent: palette.category4, bg: palette.category4Surface, label: 'Category 4' },
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

  linkText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  highlightText: {
    color: colors.primaryLight,
    fontWeight: '700',
  },

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
