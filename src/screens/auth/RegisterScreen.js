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
import { commonStyles } from '../../constants/theme';

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill out all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      Alert.alert('Registration failed', error.message);
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
          <Text style={commonStyles.logoIcon}>🎫</Text>
          <Text style={commonStyles.brandTitle}>JOIN THE ARENA</Text>
          <Text style={commonStyles.brandSubtitle}>Create your fan account</Text>
        </View>

        <View style={commonStyles.formSection}>
          <Text style={commonStyles.inputLabel}>Full Name</Text>
          <TextInput
            style={commonStyles.inputField}
            placeholder="your name"
            placeholderTextColor="#666"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

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
            placeholder="minimum 6 characters"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={commonStyles.primaryButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={commonStyles.linkText}>
              Already have an account?{' '}
              <Text style={commonStyles.highlightText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
});
