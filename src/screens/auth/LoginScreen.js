import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows, commonStyles } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollViewWrapper>
          {/* Brand Header */}
          <View style={styles.brandSection}>
            <View style={styles.brandMark}>
              <Text style={styles.brandEmoji}>🏟️</Text>
            </View>
            <Text style={styles.brandTitle}>SMART{'\n'}STADIUM</Text>
            <Text style={styles.brandSubtitle}>
              Secure access for fans, staff, and administrators
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formTitle}>Welcome back</Text>
                <Text style={styles.formDesc}>Sign in to your account</Text>
              </View>
              <View style={styles.protectedBadge}>
                <Text style={styles.protectedBadgeText}>🔐 SECURE</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerText}>
                Don&apos;t have an account?{' '}
                <Text style={styles.registerHighlight}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Your role is assigned by the system administrator
          </Text>

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>⚡ Quick Login (Dev Only)</Text>
            {[
              { label: 'Admin', email: 'admin@stadium.com', password: 'admin123', color: '#EF4444' },
              { label: 'Staff', email: 'staff@stadium.com', password: 'staff123', color: colors.warningLight },
              { label: 'Fan', email: 'fan@stadium.com', password: 'fan123', color: colors.primaryLight },
            ].map((cred) => (
              <TouchableOpacity
                key={cred.label}
                style={styles.demoRow}
                onPress={() => { setEmail(cred.email); setPassword(cred.password); }}
                activeOpacity={0.7}
              >
                <View style={[styles.demoDot, { backgroundColor: cred.color }]} />
                <View style={styles.demoInfo}>
                  <Text style={styles.demoLabel}>{cred.label}</Text>
                  <Text style={styles.demoCred}>{cred.email} / {cred.password}</Text>
                </View>
                <Text style={styles.demoFill}>Tap to fill →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollViewWrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ScrollViewWrapper({ children }) {
  const { ScrollView } = require('react-native');
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: spacing.huge + 8,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  brandMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: `${colors.primary}25`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  brandEmoji: {
    fontSize: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  brandSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
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
    alignItems: 'flex-start',
    marginBottom: spacing.xxl,
  },
  formTitle: {
    color: colors.textPrimary,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
  },
  formDesc: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  protectedBadge: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  protectedBadgeText: {
    color: colors.successLight,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: radii.lg,
    fontSize: typography.body.fontSize,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 54,
    justifyContent: 'center',
    ...shadows.primary,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  registerLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  registerText: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  registerHighlight: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    textAlign: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  demoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.warning}40`,
    marginTop: spacing.sm,
  },
  demoTitle: {
    color: colors.warningLight,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '800',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  demoInfo: {
    flex: 1,
  },
  demoLabel: {
    color: colors.textPrimary,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
  demoCred: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    marginTop: 1,
  },
  demoFill: {
    color: colors.primaryLight,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },
});
