import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminMatchListScreen from '../screens/admin/AdminMatchListScreen';
import CreateMatchScreen from '../screens/admin/CreateMatchScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import StatisticsScreen from '../screens/admin/StatisticsScreen';
import TicketValidationScreen from '../screens/admin/TicketValidationScreen';
import ScannerDashboardScreen from '../screens/admin/ScannerDashboardScreen';
import PromotionalHubScreen from '../screens/admin/PromotionalHubScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { glass } from '../constants/theme';

const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const TicketsStack = createStackNavigator();
const UsersStack = createStackNavigator();
const ScannersStack = createStackNavigator();
const ReportsStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: glass.canvasStart } };

const TAB_CONFIG = {
  Home: { icon: '🏠', label: 'Home' },
  Events: { icon: '📅', label: 'Events' },
  Tickets: { icon: '🎫', label: 'Tickets' },
  Users: { icon: '👥', label: 'Users' },
  Scanners: { icon: '📷', label: 'Scanners' },
  Reports: { icon: '📊', label: 'Reports' },
};

function TabIcon({ routeName, focused }) {
  const config = TAB_CONFIG[routeName] || { icon: '•', label: routeName };
  return (
    <View style={tabStyles.iconWrap}>
      <View style={[tabStyles.iconCircle, focused && tabStyles.iconCircleActive]}>
        <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{config.icon}</Text>
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{config.label}</Text>
    </View>
  );
}

function DashboardNavigator() {
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen name="AdminDash" component={AdminDashboardScreen} />
      <DashStack.Screen name="AdminStatistics" component={StatisticsScreen} />
      <DashStack.Screen name="AdminTicketValidation" component={TicketValidationScreen} />
      <DashStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <DashStack.Screen name="AdminProfile" component={ProfileScreen} />
      <DashStack.Screen name="Settings" component={SettingsScreen} />
    </DashStack.Navigator>
  );
}

function MatchesNavigator() {
  return (
    <MatchesStack.Navigator screenOptions={screenOptions}>
      <MatchesStack.Screen name="AdminMatchList" component={AdminMatchListScreen} />
      <MatchesStack.Screen name="AdminCreateMatch" component={CreateMatchScreen} />
      <MatchesStack.Screen name="AdminMatchDetail" component={MatchDetailScreen} />
    </MatchesStack.Navigator>
  );
}

function TicketsNavigator() {
  return (
    <TicketsStack.Navigator screenOptions={screenOptions}>
      <TicketsStack.Screen name="AdminTicketValidation" component={TicketValidationScreen} />
    </TicketsStack.Navigator>
  );
}

function UsersNavigator() {
  return (
    <UsersStack.Navigator screenOptions={screenOptions}>
      <UsersStack.Screen name="AdminUserManagement" component={UserManagementScreen} />
      <UsersStack.Screen name="AdminPromotionalHub" component={PromotionalHubScreen} />
    </UsersStack.Navigator>
  );
}

function ScannersNavigator() {
  return (
    <ScannersStack.Navigator screenOptions={screenOptions}>
      <ScannersStack.Screen name="AdminScannerHub" component={ScannerDashboardScreen} />
    </ScannersStack.Navigator>
  );
}

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator screenOptions={screenOptions}>
      <ReportsStack.Screen name="AdminReports" component={StatisticsScreen} />
    </ReportsStack.Navigator>
  );
}

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: glass.brandPurple,
        tabBarInactiveTintColor: glass.textMuted,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Home" component={DashboardNavigator} />
      <Tab.Screen name="Events" component={MatchesNavigator} />
      <Tab.Screen name="Tickets" component={TicketsNavigator} />
      <Tab.Screen name="Users" component={UsersNavigator} />
      <Tab.Screen name="Scanners" component={ScannersNavigator} />
      <Tab.Screen name="Reports" component={ReportsNavigator} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: '#0A0B0E',
    borderTopColor: glass.border,
    borderTopWidth: 1,
    height: 88,
    paddingTop: 6,
    paddingBottom: 24,
  },
  iconWrap: { alignItems: 'center', gap: 4, minWidth: 52 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: glass.brandPurpleSurface,
  },
  icon: { fontSize: 20, opacity: 0.55 },
  iconFocused: { opacity: 1, transform: [{ scale: 1.05 }] },
  label: { fontSize: 10, fontWeight: '600', color: glass.textMuted },
  labelFocused: { color: glass.brandPurple, fontWeight: '700' },
});
