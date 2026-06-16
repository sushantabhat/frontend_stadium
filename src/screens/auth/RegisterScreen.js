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

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      Alert.alert('Registration failed', error.message);
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

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
                  placeholder="Create a password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
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
  container: { flex: 1, backgroundColor: colors.background },
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
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceElevated, color: colors.textPrimary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2,
    borderRadius: radii.lg, fontSize: typography.body.fontSize,
    borderWidth: 1.5, borderColor: colors.border,
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
