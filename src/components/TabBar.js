import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TabBarIcon from './TabBarIcon';
import { useColors } from '../context/ThemeContext';

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

export default function TabBar({ routeName, focused }) {
  const colors = useColors();
  const iconName = ICON_MAP[routeName] || 'person';
  const activeColor = colors.primaryLight;
  const inactiveColor = colors.textMuted;

  return (
    <View style={styles.tab}>
      <TabBarIcon name={iconName} focused={focused} />
      <Text style={[styles.label, { color: inactiveColor }, focused && { color: activeColor, fontWeight: '600' }]}>
        {routeName === 'My Tickets' ? 'Tickets' : routeName}
      </Text>
      {focused && <View style={[styles.dot, { backgroundColor: activeColor }]} />}
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
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});

export function useTabBarStyle() {
  const colors = useColors();
  return {
    backgroundColor: colors.background === '#F5F5F5' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 65,
    paddingBottom: 5,
    elevation: 0,
    shadowOpacity: 0,
  };
}

export const tabBarStyle = {
  backgroundColor: 'rgba(15, 15, 20, 0.95)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.08)',
  height: 65,
  paddingBottom: 5,
  elevation: 0,
  shadowOpacity: 0,
};
