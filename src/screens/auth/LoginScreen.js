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
          <Text style={commonStyles.brandSubtitle}>Digital Arena & Ticket Management</Text>
        </View>

        <View style={commonStyles.formSection}>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
});
