import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, shadows } from '../../constants/theme';

export default function ZoomControls({ onZoomIn, onZoomOut }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onZoomIn} activeOpacity={0.7}>
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onZoomOut} activeOpacity={0.7}>
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    gap: spacing.sm,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  btnText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
});
