import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import GateScannerScreen from '../screens/staff/GateScannerScreen';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import TicketVerifyScreen from '../screens/staff/TicketVerifyScreen';
import DailyReportScreen from '../screens/staff/DailyReportScreen';
import MyShiftsScreen from '../screens/staff/MyShiftsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { colors, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator();
const ScannerStack = createStackNavigator();
const DashStack = createStackNavigator();
const ToolsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: colors.background } };

function TabIcon({ label, focused }) {
  const icons = { Scanner: '📸', Dashboard: '📊', Tools: '🔧', Profile: '👤' };
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icons[label] || '•'}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

function ScannerNavigator() {
  return (
    <ScannerStack.Navigator screenOptions={screenOptions}>
      <ScannerStack.Screen name="GateScanner" component={GateScannerScreen} />
      <ScannerStack.Screen name="TicketVerify" component={TicketVerifyScreen} />
    </ScannerStack.Navigator>
  );
}

function DashboardNavigator() {
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
      <DashStack.Screen name="DailyReport" component={DailyReportScreen} />
    </DashStack.Navigator>
  );
}

function ToolsNavigator() {
  return (
    <ToolsStack.Navigator screenOptions={screenOptions}>
      <ToolsStack.Screen name="TicketVerifyMain" component={TicketVerifyScreen} />
      <ToolsStack.Screen name="MyShifts" component={MyShiftsScreen} />
      <ToolsStack.Screen name="DailyReportAlt" component={DailyReportScreen} />
    </ToolsStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export default function StaffTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Scanner" component={ScannerNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="Tools" component={ToolsNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
    ...shadows.xl,
  },
  iconWrap: { alignItems: 'center', gap: 3 },
  icon: { fontSize: 22 },
  iconFocused: { transform: [{ scale: 1.15 }] },
  label: { fontSize: 10, fontWeight: '600', color: colors.textMuted },
  labelFocused: { color: colors.primaryLight, fontWeight: '700' },
});
