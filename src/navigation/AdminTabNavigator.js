import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminMatchListScreen from '../screens/admin/AdminMatchListScreen';
import CreateMatchScreen from '../screens/admin/CreateMatchScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import StatisticsScreen from '../screens/admin/StatisticsScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { colors, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const UsersStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: colors.background } };

function TabIcon({ label, focused }) {
  const icons = { Dashboard: '📊', Matches: '⚽', Users: '👥', Profile: '👤' };
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icons[label] || '•'}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

function DashboardNavigator() {
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <DashStack.Screen name="Statistics" component={StatisticsScreen} />
      <DashStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
    </DashStack.Navigator>
  );
}

function MatchesNavigator() {
  return (
    <MatchesStack.Navigator screenOptions={screenOptions}>
      <MatchesStack.Screen name="AdminMatchList" component={AdminMatchListScreen} />
      <MatchesStack.Screen name="CreateMatch" component={CreateMatchScreen} />
      <MatchesStack.Screen name="MatchDetail" component={MatchDetailScreen} />
    </MatchesStack.Navigator>
  );
}

function UsersNavigator() {
  return (
    <UsersStack.Navigator screenOptions={screenOptions}>
      <UsersStack.Screen name="UserManagement" component={UserManagementScreen} />
    </UsersStack.Navigator>
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

export default function AdminTabNavigator() {
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
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="Matches" component={MatchesNavigator} />
      <Tab.Screen name="Users" component={UsersNavigator} />
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
