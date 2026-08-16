import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TabBarIcon from './TabBarIcon';

const ICON_MAP = {
  Home: 'home',
  Browse: 'search',
  'My Tickets': 'ticket',
  Account: 'person',
  Scanner: 'camera',
  Dashboard: 'dashboard',
  Tools: 'wrench',
  Events: 'calendar',
  Tickets: 'ticket',
  Users: 'users',
  Scanners: 'camera',
  Reports: 'chart',
  Incidents: 'alert',
  Override: 'shield',
};

const ACTIVE_COLOR = '#10B981';
const INACTIVE_COLOR = '#6B7280';

export default function TabBar({ routeName, focused }) {
  const iconName = ICON_MAP[routeName] || 'person';

  return (
    <View style={styles.tab}>
      <TabBarIcon name={iconName} focused={focused} />
      <Text style={[styles.label, focused && { color: ACTIVE_COLOR, fontWeight: '600' }]}>
        {routeName === 'My Tickets' ? 'Tickets' : routeName}
      </Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    color: INACTIVE_COLOR,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
    marginTop: 3,
  },
});

export const tabBarStyle = {
  backgroundColor: 'rgba(15, 15, 20, 0.95)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.08)',
  height: 65,
  paddingBottom: 5,
  elevation: 0,
  shadowOpacity: 0,
};
