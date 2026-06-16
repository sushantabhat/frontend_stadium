import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

const steps = [
  { key: 'select', label: 'Select' },
  { key: 'review', label: 'Review' },
  { key: 'pay', label: 'Pay' },
  { key: 'done', label: 'Done' },
];

export default function BookingProgress({ currentStep = 'select' }) {
  const currentIdx = steps.findIndex(s => s.key === currentStep);

  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isCompleted = idx < currentIdx;

        return (
          <React.Fragment key={step.key}>
            <View style={styles.stepWrap}>
              <View style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isActive && styles.dotActive,
              ]}>
                {isCompleted ? (
                  <Text style={styles.checkMark}>✓</Text>
                ) : (
                  <Text style={[styles.dotNumber, isActive && styles.dotNumberActive]}>
                    {idx + 1}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                isCompleted && styles.stepLabelCompleted,
                isActive && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View style={[
                styles.line,
                idx < currentIdx && styles.lineCompleted,
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  stepWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  dotActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  dotNumber: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '700',
  },
  dotNumberActive: {
    color: colors.primaryLight,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny.fontSize,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: colors.success,
  },
  stepLabelActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg + spacing.xs,
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
});
