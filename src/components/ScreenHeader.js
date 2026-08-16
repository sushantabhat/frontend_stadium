import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { spacing, typography } from '../constants/theme';
import { useColors } from '../context/ThemeContext';

export default function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={onBack} activeOpacity={0.7}>
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>←</Text>
          </TouchableOpacity>
        )}
        <View style={onBack ? styles.titleWithBack : styles.titleOnly}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
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
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  backBtnText: { fontSize: 16, fontWeight: '700' },
  titleWithBack: { flex: 1 },
  titleOnly: { flex: 1 },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xxs,
  },
  right: {},
});