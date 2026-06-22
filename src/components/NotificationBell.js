import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { radii } from '../constants/theme';
import { fetchUnreadCount } from '../services/notificationService';

export default function NotificationBell({ onPress }) {
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const { unreadCount } = await fetchUnreadCount();
          if (active) setCount(unreadCount);
        } catch {}
      };
      load();
      const interval = setInterval(load, 30000);
      return () => { active = false; clearInterval(interval); };
    }, [])
  );

  return (
    <TouchableOpacity style={styles.bell} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.bellIcon}>🔔</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bell: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 22 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#FF4757', borderRadius: radii.full,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});
