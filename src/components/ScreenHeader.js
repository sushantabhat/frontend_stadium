import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

export default function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={onBack ? styles.titleWithBack : styles.titleOnly}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && <View style={styles.right}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  backBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  titleWithBack: { flex: 1 },
  titleOnly: { flex: 1 },
  title: {
    color: colors.textPrimary, fontSize: typography.h3.fontSize,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted, fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  right: {},
});
