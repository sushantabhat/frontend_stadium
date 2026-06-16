import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, typography } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CARD_HEIGHT = 180;
const AUTO_SCROLL_INTERVAL = 4000;

const BANNERS = [
  {
    id: '1',
    title: 'IPL 2026\nis Here!',
    subtitle: 'Book your seats before they sell out',
    cta: 'Book Now',
    gradient: ['#6C5CE7', '#4834D4'],
    emoji: '🏏',
    tag: 'SEASON OPENER',
  },
  {
    id: '2',
    title: 'Weekend\nDerby',
    subtitle: 'The biggest rivalry of the season',
    cta: 'Get Tickets',
    gradient: ['#0B1C3D', '#1A3A5C'],
    emoji: '⚽',
    tag: 'SOLD OUT SOON',
  },
  {
    id: '3',
    title: 'VIP\nExperience',
    subtitle: 'Premium seats, unlimited food & drinks',
    cta: 'Upgrade',
    gradient: ['#FFD700', '#E6C200'],
    emoji: '🥂',
    tag: 'EXCLUSIVE',
    dark: true,
  },
  {
    id: '4',
    title: 'Refer &\nEarn',
    subtitle: 'Invite friends, get 20% off next booking',
    cta: 'Invite Now',
    gradient: ['#00C853', '#00A844'],
    emoji: '🎁',
    tag: 'LIMITED TIME',
  },
];

export default function BannerCarousel({ onBannerPress }) {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const activeIndexRef = useRef(0);

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      activeIndexRef.current = (activeIndexRef.current + 1) % BANNERS.length;
      flatListRef.current?.scrollToOffset({ offset: activeIndexRef.current * CARD_WIDTH, animated: true });
    }, AUTO_SCROLL_INTERVAL);
  }, [stopAutoScroll]);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  const onScrollBeginDrag = useCallback(() => stopAutoScroll(), [stopAutoScroll]);
  const onScrollEndDrag = useCallback(() => startAutoScroll(), [startAutoScroll]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      activeIndexRef.current = viewableItems[0].index;
    }
  }, []);

  const viewabilityConfig = useCallback(() => ({ viewAreaCoveragePercentThreshold: 50 }), []);

  const renderItem = useCallback(({ item }) => {
    const isDark = item.dark;
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onBannerPress?.(item)}
        style={styles.cardWrap}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Background emoji — large, faded */}
          <Text style={styles.bgEmoji}>{item.emoji}</Text>

          {/* Tag */}
          <View style={[styles.tag, isDark && styles.tagDark]}>
            <Text style={[styles.tagText, isDark && styles.tagTextDark]}>{item.tag}</Text>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.cardSubtitle, isDark && styles.cardSubtitleDark]} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>

          {/* CTA */}
          <View style={[styles.ctaWrap, isDark && styles.ctaWrapDark]}>
            <Text style={[styles.ctaText, isDark && styles.ctaTextDark]}>{item.cta}</Text>
            <Text style={[styles.ctaArrow, isDark && styles.ctaArrowDark]}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [onBannerPress]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig()}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {BANNERS.map((_, idx) => {
          const inputRange = [
            (idx - 1) * (CARD_WIDTH + spacing.md),
            idx * (CARD_WIDTH + spacing.md),
            (idx + 1) * (CARD_WIDTH + spacing.md),
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 20, 6],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={idx}
              style={[
                styles.dot,
                { width: dotWidth, opacity: dotOpacity },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  cardWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },

  bgEmoji: {
    position: 'absolute',
    right: -8,
    bottom: -12,
    fontSize: 100,
    opacity: 0.12,
    transform: [{ rotate: '-12deg' }],
  },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagDark: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(0,0,0,0.12)',
  },
  tagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tagTextDark: {
    color: '#1A1D2A',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  cardTitleDark: {
    color: '#0F111A',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  cardSubtitleDark: {
    color: 'rgba(15,17,26,0.6)',
  },

  ctaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ctaWrapDark: {
    backgroundColor: 'rgba(15,17,26,0.1)',
    borderColor: 'rgba(15,17,26,0.15)',
  },
  ctaText: {
    color: '#FFF',
    fontSize: typography.small.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaTextDark: {
    color: '#0F111A',
  },
  ctaArrow: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ctaArrowDark: {
    color: '#0F111A',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },
});
