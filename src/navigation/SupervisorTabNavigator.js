import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import SupervisorDashboardScreen from '../screens/supervisor/SupervisorDashboardScreen';
import IncidentDetailScreen from '../screens/supervisor/IncidentDetailScreen';
import OverridePanelScreen from '../screens/supervisor/OverridePanelScreen';
import GateScannerScreen from '../screens/staff/GateScannerScreen';
import TicketVerifyScreen from '../screens/staff/TicketVerifyScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { glass, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator();
const IncidentsStack = createStackNavigator();
const OverrideStack = createStackNavigator();
const ScannerStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: glass.canvasStart } };

function TabIcon({ label, focused }) {
  const icons = { Incidents: '🚨', Override: '🔓', Scanner: '📸', Account: '👤' };
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icons[label] || '•'}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
      {focused && <View style={tabStyles.activeDot} />}
    </View>
  );
}

function IncidentsNavigator() {
  return (
    <IncidentsStack.Navigator screenOptions={screenOptions}>
      <IncidentsStack.Screen name="SupervisorDashboard" component={SupervisorDashboardScreen} />
      <IncidentsStack.Screen name="SupervisorIncidentDetail" component={IncidentDetailScreen} />
    </IncidentsStack.Navigator>
  );
}

function OverrideNavigator() {
  return (
    <OverrideStack.Navigator screenOptions={screenOptions}>
      <OverrideStack.Screen name="SupervisorOverride" component={OverridePanelScreen} />
    </OverrideStack.Navigator>
  );
}

function ScannerNavigator() {
  return (
    <ScannerStack.Navigator screenOptions={screenOptions}>
      <ScannerStack.Screen name="SupervisorGateScanner" component={GateScannerScreen} />
      <ScannerStack.Screen name="SupervisorTicketVerify" component={TicketVerifyScreen} />
    </ScannerStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="SupervisorProfile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export default function SupervisorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: glass.neonMagenta,
        tabBarInactiveTintColor: glass.textMuted,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Incidents" component={IncidentsNavigator} />
      <Tab.Screen name="Override" component={OverrideNavigator} />
      <Tab.Screen name="Scanner" component={ScannerNavigator} />
      <Tab.Screen name="Account" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: '#0A0B0E',
    borderTopColor: glass.border,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
    ...shadows.xl,
  },
  iconWrap: { alignItems: 'center', gap: 3 },
  icon: { fontSize: 22 },
  iconFocused: { transform: [{ scale: 1.15 }] },
  label: { fontSize: 10, fontWeight: '600', color: glass.textMuted },
  labelFocused: { color: glass.neonMagenta, fontWeight: '700' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: glass.neonMagenta, marginTop: 2 },
});
