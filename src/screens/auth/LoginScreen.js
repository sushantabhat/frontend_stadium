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
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@stadium.com', password: 'admin123', icon: '👑', color: colors.accent },
  { label: 'Staff', email: 'staff@stadium.com', password: 'staff123', icon: '🛡️', color: colors.info },
  { label: 'Fan', email: 'fan@stadium.com', password: 'fan123', icon: '🎟️', color: colors.primary },
];

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
          <View style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }}>
            {/* Brand */}
            <View style={styles.brandSection}>
              <View style={styles.brandMark}>
                <LinearGradient
                  colors={colors.gradientPurple}
                  style={styles.brandMarkGradient}
                >
                  <Text style={styles.brandEmoji}>🏟️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.brandTitle}>SMART{'\n'}STADIUM</Text>
              <Text style={styles.brandSubtitle}>Premium sports ticketing experience</Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formDesc}>Sign in to continue</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL</Text>
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
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={colors.gradientPurple}
                  style={styles.loginBtnGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.loginBtnText}>Sign In →</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={styles.registerLink}
                activeOpacity={0.7}
              >
                <Text style={styles.registerText}>
                  Don&apos;t have an account? <Text style={styles.registerHighlight}>Create one</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Accounts */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick Access (Dev)</Text>
              <View style={styles.demoRow}>
                {DEMO_ACCOUNTS.map((a) => (
                  <TouchableOpacity
                    key={a.label}
                    style={styles.demoCard}
                    onPress={() => { setEmail(a.email); setPassword(a.password); }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[`${a.color}25`, `${a.color}08`]}
                      style={styles.demoGradient}
                    >
                      <Text style={styles.demoIcon}>{a.icon}</Text>
                      <Text style={styles.demoLabel}>{a.label}</Text>
                      <Text style={styles.demoEmail}>{a.email.split('@')[0]}</Text>
                    </LinearGradient>
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

  // Brand
  brandSection: { alignItems: 'center', marginBottom: spacing.xxl },
  brandMark: { marginBottom: spacing.xl },
  brandMarkGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  brandEmoji: { fontSize: 36 },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  brandSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
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
  formTitle: {
    color: colors.textPrimary,
    fontSize: typography.h2.fontSize,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  formDesc: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.xxl,
  },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    color: colors.textMuted,
    fontSize: typography.label.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
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
  loginBtn: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
    ...shadows.primary,
  },
  loginBtnGradient: {
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  registerLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  registerText: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  registerHighlight: { color: colors.primaryLight, fontWeight: '700' },

  // Demo
  demoSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  demoTitle: {
    color: colors.accent,
    fontSize: typography.tiny.fontSize,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoCard: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoGradient: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  demoIcon: { fontSize: 18 },
  demoLabel: {
    color: colors.textPrimary,
    fontSize: typography.small.fontSize,
    fontWeight: '700',
  },
  demoEmail: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
  },
});
