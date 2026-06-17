import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

/* ── Admin Screen Imports ── */
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminMatchListScreen from '../screens/admin/AdminMatchListScreen';
import CreateMatchScreen from '../screens/admin/CreateMatchScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import StatisticsScreen from '../screens/admin/StatisticsScreen';
import TicketValidationScreen from '../screens/admin/TicketValidationScreen';
import PromotionalHubScreen from '../screens/admin/PromotionalHubScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { glass, shadows } from '../constants/theme';

/* ── Navigator instances ── */
const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const UsersStack = createStackNavigator();
const ProfileStack = createStackNavigator();

/* ── Shared screen options: no headers, dark canvas ── */
const screenOptions = { headerShown: false, cardStyle: { backgroundColor: glass.canvasStart } };

/* ──────────────────────────────────────────────────────
 * Tab Icon Component
 * Maps each tab label to an emoji icon with active/inactive states.
 * ────────────────────────────────────────────────────── */
function TabIcon({ label, focused }) {
  const icons = { Dashboard: '📊', Matches: '⚽', Users: '👥', Account: '👤' };
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icons[label] || '•'}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
      {/* Active tab indicator dot */}
      {focused && <View style={tabStyles.activeDot} />}
    </View>
  );
}

/* ──────────────────────────────────────────────────────
 * Dashboard Stack Navigator
 * Contains: Main Dashboard → Statistics → Ticket Validation → Settings
 * ────────────────────────────────────────────────────── */
function DashboardNavigator() {
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen name="AdminDash" component={AdminDashboardScreen} />
      <DashStack.Screen name="AdminStatistics" component={StatisticsScreen} />
      <DashStack.Screen name="AdminTicketValidation" component={TicketValidationScreen} />
      <DashStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
    </DashStack.Navigator>
  );
}

/* ──────────────────────────────────────────────────────
 * Matches Stack Navigator
 * Contains: Match List (Scheduler) → Create Match → Match Detail
 * ────────────────────────────────────────────────────── */
function MatchesNavigator() {
  return (
    <MatchesStack.Navigator screenOptions={screenOptions}>
      <MatchesStack.Screen name="AdminMatchList" component={AdminMatchListScreen} />
      <MatchesStack.Screen name="AdminCreateMatch" component={CreateMatchScreen} />
      <MatchesStack.Screen name="AdminMatchDetail" component={MatchDetailScreen} />
    </MatchesStack.Navigator>
  );
}

/* ──────────────────────────────────────────────────────
 * Users Stack Navigator
 * Contains: User Management → Promotional Hub
 * ────────────────────────────────────────────────────── */
function UsersNavigator() {
  return (
    <UsersStack.Navigator screenOptions={screenOptions}>
      <UsersStack.Screen name="AdminUserManagement" component={UserManagementScreen} />
      <UsersStack.Screen name="AdminPromotionalHub" component={PromotionalHubScreen} />
    </UsersStack.Navigator>
  );
}

/* ──────────────────────────────────────────────────────
 * Profile Stack Navigator
 * Contains: Profile → Settings
 * ────────────────────────────────────────────────────── */
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="AdminProfile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

/* ──────────────────────────────────────────────────────
 * Main Admin Tab Navigator
 * 4 tabs: Dashboard | Matches | Users | Account
 * ────────────────────────────────────────────────────── */
export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: glass.neonCyan,
        tabBarInactiveTintColor: glass.textMuted,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="Matches" component={MatchesNavigator} />
      <Tab.Screen name="Users" component={UsersNavigator} />
      <Tab.Screen name="Account" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

/* ═══ TAB BAR STYLES ═══ */
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
  labelFocused: { color: glass.neonCyan, fontWeight: '700' },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: glass.neonCyan, marginTop: 2,
  },
});
