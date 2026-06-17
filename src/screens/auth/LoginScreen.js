import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { validateLoginForm } from '../../utils/validation';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@stadium.com', password: 'admin123', icon: '👑', color: colors.accent },
  { label: 'Staff', email: 'staff@stadium.com', password: 'staff123', icon: '🛡️', color: colors.info },
  { label: 'Supervisor', email: 'supervisor@gmail.com', password: 'supervisor123', icon: '🔧', color: colors.magenta },
  { label: 'Fan', email: 'fan@stadium.com', password: 'fan12345', icon: '🎟️', color: colors.primary },
];

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: null, password: null });
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearFieldError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
    setServerError(null);
    setSuccessMessage(null);
  };

  const handleLogin = async () => {
    const { errors: validationErrors, isValid } = validateLoginForm({ email, password });
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    try {
      setServerError(null);
      setSuccessMessage(null);
      await login(email.trim(), password);
      setSuccessMessage('Login successful! Redirecting...');
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <LinearGradient
          colors={[`${colors.primaryDark}50`, `${colors.primaryDark}20`, colors.background, colors.background]}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.flex}
        >
          <View style={styles.scroll}>
            {/* Brand — left aligned, asymmetric */}
            <View style={styles.brandSection}>
              <View style={styles.brandMark}>
                <LinearGradient colors={colors.gradientPurple} style={styles.brandMarkInner}>
                  <Text style={styles.brandEmoji}>🏟️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.brandTitle}>SMART{'\n'}STADIUM</Text>
              <Text style={styles.brandTagline}>
                Your seat is waiting.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Sign in</Text>
                <View style={styles.secureBadge}>
                  <Text style={styles.secureDot}>●</Text>
                  <Text style={styles.secureText}>SECURED</Text>
                </View>
              </View>

              {serverError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{serverError}</Text>
                </View>
              ) : null}

              {successMessage ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerText}>{successMessage}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => { setPassword(text); clearFieldError('password'); }}
                />
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={colors.gradientPurple}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtnInner}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.loginBtnText}>Sign In</Text>
                      <Text style={styles.loginBtnArrow}>→</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={styles.registerLink}
                activeOpacity={0.7}
              >
                <Text style={styles.registerText}>
                  New here?{' '}
                  <Text style={styles.registerHighlight}>Create an account</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo accounts — horizontal pills */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>TRY A DEMO</Text>
              <View style={styles.demoRow}>
                {DEMO_ACCOUNTS.map((a) => (
                  <TouchableOpacity
                    key={a.label}
                    style={styles.demoPill}
                    onPress={() => { setEmail(a.email); setPassword(a.password); setErrors({ email: null, password: null }); setServerError(null); setSuccessMessage(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.demoIcon}>{a.icon}</Text>
                    <Text style={styles.demoText}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flex: 1, justifyContent: 'center' },

  // Brand — left aligned, not centered
  brandSection: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  brandMarkInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEmoji: { fontSize: 32 },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  brandTagline: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    fontWeight: '400',
  },

  // Form
  formCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  formTitle: {
    color: colors.textPrimary,
    fontSize: typography.h2.fontSize,
    fontWeight: '800',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  secureDot: { color: colors.success, fontSize: 6 },
  secureText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  errorBanner: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.danger}30`,
  },
  errorBannerText: {
    color: colors.dangerLight,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: colors.successSurface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  successBannerText: {
    color: colors.successLight,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },

  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 4,
    borderRadius: radii.md,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.dangerLight,
    fontSize: 11,
    marginTop: spacing.xs,
    fontWeight: '500',
  },

  loginBtn: {
    borderRadius: radii.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    gap: spacing.sm,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loginBtnArrow: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  registerLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  registerText: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  registerHighlight: { color: colors.primaryLight, fontWeight: '700' },

  // Demo — horizontal pills
  demoSection: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
  },
  demoLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  demoIcon: { fontSize: 12 },
  demoText: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
});
