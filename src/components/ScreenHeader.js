import React, { useContext } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/theme';

export default function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  const { userInfo, logout, isLoading } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <TouchableOpacity onPress={logout} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.primaryLight} size="small" />
            ) : (
              <Text style={styles.logoutText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.userMeta}>
          {userInfo?.name} · {userInfo?.role?.toUpperCase()}
        </Text>

        {rightAction ? <View style={styles.actionRow}>{rightAction}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 4,
  },
  backPlaceholder: {
    width: 60,
  },
  backText: {
    color: colors.primaryLight,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  userMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  actionRow: {
    marginTop: 12,
  },
});
