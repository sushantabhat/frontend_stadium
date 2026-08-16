import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function TopLoadingBar({ loading }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      widthAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(widthAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(widthAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      ).start();
    } else {
      widthAnim.stopAnimation();
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['15%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    zIndex: 9999,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  bar: {
    height: 6,
    backgroundColor: '#FF453A',
    borderRadius: 3,
  },
});
