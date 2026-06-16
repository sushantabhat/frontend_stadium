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
import { colors, commonStyles } from '../../constants/theme';

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
        style={commonStyles.innerContainer}
      >
        <View style={commonStyles.headerSection}>
          <Text style={commonStyles.logoIcon}>🏟️</Text>
          <Text style={commonStyles.brandTitle}>SMART STADIUM</Text>
          <Text style={commonStyles.brandSubtitle}>Secure access for fans, staff, and administrators</Text>
        </View>

        <View style={commonStyles.formSection}>
          <View style={styles.formHeaderRow}>
            <Text style={styles.sectionTitle}>Sign in</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Protected</Text>
            </View>
          </View>
          <Text style={styles.sectionText}>
            Use your account to open the correct workspace automatically.
          </Text>

          <Text style={commonStyles.inputLabel}>Email Address</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="enter your email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={commonStyles.inputLabel}>Password</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="••••••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={commonStyles.primaryButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={commonStyles.linkText}>
              Don&apos;t have an account?{' '}
              <Text style={commonStyles.highlightText}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Your role is controlled by the account assigned by the system admin.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.cardBackgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
  },
});
