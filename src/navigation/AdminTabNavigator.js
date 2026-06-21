import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminMatchListScreen from '../screens/admin/AdminMatchListScreen';
import CreateMatchScreen from '../screens/admin/CreateMatchScreen';
import AdminEditMatchScreen from '../screens/admin/AdminEditMatchScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import StatisticsScreen from '../screens/admin/StatisticsScreen';
import TicketValidationScreen from '../screens/admin/TicketValidationScreen';
import ScannerDashboardScreen from '../screens/admin/ScannerDashboardScreen';
import PromotionalHubScreen from '../screens/admin/PromotionalHubScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { glass } from '../constants/theme';
import TabBar, { tabBarStyle } from '../components/TabBar';

const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const TicketsStack = createStackNavigator();
const UsersStack = createStackNavigator();
const ScannersStack = createStackNavigator();
const ReportsStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: glass.canvasStart } };

function DashboardNavigator() {
  return (
    <DashStack.Navigator screenOptions={screenOptions}>
      <DashStack.Screen name="AdminDash" component={AdminDashboardScreen} />
      <DashStack.Screen name="AdminStatistics" component={StatisticsScreen} />
      <DashStack.Screen name="AdminTicketValidation" component={TicketValidationScreen} />
      <DashStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <DashStack.Screen name="AdminProfile" component={ProfileScreen} />
    </DashStack.Navigator>
  );
}

function MatchesNavigator() {
  return (
    <MatchesStack.Navigator screenOptions={screenOptions}>
      <MatchesStack.Screen name="AdminMatchList" component={AdminMatchListScreen} />
      <MatchesStack.Screen name="AdminCreateMatch" component={CreateMatchScreen} />
      <MatchesStack.Screen name="AdminEditMatch" component={AdminEditMatchScreen} />
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
        tabBarIcon: ({ focused }) => <TabBar routeName={route.name} focused={focused} />,
        tabBarStyle,
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
