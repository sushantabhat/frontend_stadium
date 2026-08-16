import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography } from '../constants/theme';

const DURATION = 4000;
const ANIM_LENGTH = 300;

const TYPE_CONFIG = {
  refund_processing: { icon: '⏳', color: '#FFD93D' },
  refund_completed: { icon: '✓', color: '#A29BFE' },
  match_cancelled: { icon: '✕', color: '#FF6B6B' },
  booking_confirmed: { icon: '🎫', color: '#69F0AE' },
  general: { icon: 'ℹ', color: colors.textMuted },
};

export default function InAppToast({ notification, onDismiss }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: ANIM_LENGTH, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: ANIM_LENGTH, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: ANIM_LENGTH, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -80, duration: ANIM_LENGTH, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, DURATION);

    return () => clearTimeout(timer);
  }, []);

  if (!notification) return null;

  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.inner} onPress={onDismiss} activeOpacity={0.8}>
        <View style={[styles.iconWrap, { backgroundColor: `${config.color}20` }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 9999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  body: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.small.fontSize,
    lineHeight: 16,
  },
});
