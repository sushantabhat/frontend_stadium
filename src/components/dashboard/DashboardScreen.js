import React, { useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, commonStyles } from '../../constants/theme';
import DashboardActionCard from './DashboardActionCard';
import DashboardFeatureCard from './DashboardFeatureCard';
import DashboardMetricCard from './DashboardMetricCard';

export default function DashboardScreen({
  greeting,
  subtitle,
  avatar,
  metrics,
  primaryAction,
  sectionTitle,
  actions,
  feature,
  onLogout,
}) {
  const { userInfo } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userInfo?.name || 'User'}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          {metrics.map((metric) => (
            <DashboardMetricCard
              key={metric.label}
              accentColor={metric.accentColor}
              icon={metric.icon}
              value={metric.value}
              label={metric.label}
            />
          ))}
        </View>

        {primaryAction ? (
          <View style={styles.primaryActionSection}>
            <TouchableOpacity style={styles.primaryActionButton} onPress={primaryAction.onPress}>
              <Text style={styles.primaryActionIcon}>{primaryAction.icon}</Text>
              <Text style={styles.primaryActionTitle}>{primaryAction.title}</Text>
              <Text style={styles.primaryActionSubtitle}>{primaryAction.subtitle}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {feature ? (
          <View style={styles.featureSection}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <DashboardFeatureCard feature={feature} />
          </View>
        ) : null}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <View style={styles.menuGrid}>
            {actions.map((action) => (
              <DashboardActionCard key={action.title} action={action} />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={commonStyles.primaryButton} onPress={onLogout}>
            <Text style={commonStyles.primaryButtonText}>Logout</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primaryLight}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    fontSize: 28,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  primaryActionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  primaryActionButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
    textAlign: 'center',
  },
  primaryActionSubtitle: {
    fontSize: 13,
    color: `${colors.background}99`,
    textAlign: 'center',
  },
  featureSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
