import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { getRoleDisplayName } from '../../constants/roleNavigation';

export default function ProfileScreen() {
  const { userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Profile" subtitle="Account overview" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{userInfo?.name || 'User'}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userInfo?.email || 'Not available'}</Text>

          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{getRoleDisplayName(userInfo?.role)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
