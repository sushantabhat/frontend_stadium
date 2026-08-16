import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { radii } from '../constants/theme';
import { NotificationContext } from '../context/NotificationContext';

export default function NotificationBell({ onPress }) {
  const { unreadCount } = React.useContext(NotificationContext) || {};
  const count = unreadCount || 0;

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
