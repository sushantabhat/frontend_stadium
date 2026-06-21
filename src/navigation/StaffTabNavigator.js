import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import GateScannerScreen from '../screens/staff/GateScannerScreen';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import TicketVerifyScreen from '../screens/staff/TicketVerifyScreen';
import DailyReportScreen from '../screens/staff/DailyReportScreen';
import MyShiftsScreen from '../screens/staff/MyShiftsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { colors } from '../constants/theme';
import TabBar, { tabBarStyle } from '../components/TabBar';

const Tab = createBottomTabNavigator();
const ScannerStack = createStackNavigator();
const DashStack = createStackNavigator();
const ToolsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: colors.background } };

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
      <DashStack.Screen name="TicketVerify" component={TicketVerifyScreen} />
      <DashStack.Screen name="MyShifts" component={MyShiftsScreen} />
      <DashStack.Screen name="DailyReport" component={DailyReportScreen} />
    </DashStack.Navigator>
  );
}

function ToolsNavigator() {
  return (
    <ToolsStack.Navigator screenOptions={screenOptions}>
      <ToolsStack.Screen name="ToolsHome" component={StaffDashboardScreen} />
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
        tabBarIcon: ({ focused }) => <TabBar routeName={route.name} focused={focused} />,
        tabBarStyle,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Scanner" component={ScannerNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="Tools" component={ToolsNavigator} />
      <Tab.Screen name="Account" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
