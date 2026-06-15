import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/theme';

export default function DashboardFeatureCard({ feature }) {
  return (
    <View style={styles.card}>
      <Text style={styles.badge}>{feature.badge}</Text>
      <Text style={styles.title}>{feature.title}</Text>
      {feature.lines.map((line) => (
        <Text key={line} style={styles.line}>
          {line}
        </Text>
      ))}
      <TouchableOpacity style={styles.button} onPress={feature.onPress}>
        <Text style={styles.buttonText}>{feature.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  line: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  button: {
    paddingVertical: 8,
    marginTop: 4,
  },
  buttonText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
