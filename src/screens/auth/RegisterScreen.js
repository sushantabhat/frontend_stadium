import React, { useContext, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { validateRegisterForm } from '../../utils/validation';

function getPasswordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 'Weak', color: colors.danger, width: '25%' };
  if (score <= 3) return { level: 'Fair', color: colors.warning, width: '60%' };
  return { level: 'Strong', color: colors.success, width: '100%' };
}

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ name: null, email: null, password: null, confirmPassword: null });
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const clearFieldError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
    setServerError(null);
    setSuccessMessage(null);
  };

  const handleRegister = async () => {
    const { errors: validationErrors, isValid } = validateRegisterForm({ name, email, password, confirmPassword });
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    try {
      setServerError(null);
      setSuccessMessage(null);
      await register(name.trim(), email.trim(), password);
      setSuccessMessage('Account created successfully! Redirecting...');
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
          colors={[`${colors.primaryDark}40`, `${colors.background}`, colors.background]}
          style={styles.flex}
        >
          <View style={styles.scroll}>
            {/* Brand */}
            <View style={styles.brandSection}>
              <View style={styles.brandMark}>
                <LinearGradient colors={colors.gradientPurple} style={styles.brandMarkGradient}>
                  <Text style={styles.brandEmoji}>🏟️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.brandTitle}>JOIN THE{'\n'}STADIUM</Text>
              <Text style={styles.brandSubtitle}>Create your account to start booking</Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Create Account</Text>

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
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  value={name}
                  onChangeText={(text) => { setName(text); clearFieldError('name'); }}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

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
                  placeholder="Create a password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => { setPassword(text); clearFieldError('password'); }}
                />
                {strength ? (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarTrack}>
                      <View style={[styles.strengthBarFill, { width: strength.width, backgroundColor: strength.color }]} />
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.level}</Text>
                  </View>
                ) : null}
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); clearFieldError('confirmPassword'); }}
                />
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={colors.gradientPurple} style={styles.registerBtnGradient}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.registerBtnText}>Create Account →</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink} activeOpacity={0.7}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginHighlight}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flex: 1, justifyContent: 'center' },

  brandSection: { alignItems: 'center', marginBottom: spacing.xxl },
  brandMark: { marginBottom: spacing.xl },
  brandMarkGradient: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.primary,
  },
  brandEmoji: { fontSize: 36 },
  brandTitle: {
    color: colors.textPrimary, fontSize: 32, fontWeight: '900',
    textAlign: 'center', letterSpacing: 3, lineHeight: 38, marginBottom: spacing.sm,
  },
  brandSubtitle: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: 'center' },

  formCard: {
    backgroundColor: colors.surface, marginHorizontal: spacing.xl,
    borderRadius: radii.xxl, padding: spacing.xxl,
    borderWidth: 1, borderColor: colors.border, ...shadows.lg,
  },
  formTitle: {
    color: colors.textPrimary, fontSize: typography.h2.fontSize,
    fontWeight: '800', marginBottom: spacing.xxl,
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
  inputLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceElevated, color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
    borderRadius: radii.lg, fontSize: typography.body.fontSize,
    borderWidth: 1.5, borderColor: colors.border,
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

  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  strengthBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  registerBtn: {
    borderRadius: radii.lg, overflow: 'hidden', marginTop: spacing.sm,
    ...shadows.primary,
  },
  registerBtnGradient: {
    paddingVertical: spacing.lg + 2, alignItems: 'center',
    justifyContent: 'center', minHeight: 54,
  },
  registerBtnText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800', letterSpacing: 0.3 },
  loginLink: { marginTop: spacing.xl, alignItems: 'center' },
  loginText: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  loginHighlight: { color: colors.primaryLight, fontWeight: '700' },
});
