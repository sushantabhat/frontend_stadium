import React, { useContext, useMemo } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants/theme';
import ProfileMenuButton from './profile/ProfileMenuButton';

export default function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const handleBack = useMemo(() => {
    if (onBack) {
      return onBack;
    }

    if (navigation?.canGoBack?.()) {
      return () => navigation.goBack();
    }

    return null;
  }, [navigation, onBack]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <View style={styles.topRow}>
          {handleBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <ProfileMenuButton compact />
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{userInfo?.role?.toUpperCase()}</Text>
          </View>
          {userInfo?.name ? <Text style={styles.userMeta}>{userInfo.name}</Text> : null}
        </View>

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
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  accentBar: {
    width: 56,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    marginTop: 6,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backPlaceholder: {
    width: 60,
  },
  backText: {
    color: colors.primaryLight,
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.cardBackgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaChipText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  userMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 12,
  },
});
