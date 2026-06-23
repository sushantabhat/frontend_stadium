import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import SupervisorDashboardScreen from '../screens/supervisor/SupervisorDashboardScreen';
import IncidentDetailScreen from '../screens/supervisor/IncidentDetailScreen';
import OverridePanelScreen from '../screens/supervisor/OverridePanelScreen';
import GateScannerScreen from '../screens/staff/GateScannerScreen';
import TicketVerifyScreen from '../screens/staff/TicketVerifyScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import TicketValidationScreen from '../screens/admin/TicketValidationScreen';
import { useBackgroundColor } from '../context/ThemeContext';
import TabBar, { tabBarStyle } from '../components/TabBar';

const Tab = createBottomTabNavigator();
const IncidentsStack = createStackNavigator();
const OverrideStack = createStackNavigator();
const ScannerStack = createStackNavigator();
const TicketsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false };

function IncidentsNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <IncidentsStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <IncidentsStack.Screen name="SupervisorDashboard" component={SupervisorDashboardScreen} />
      <IncidentsStack.Screen name="SupervisorIncidentDetail" component={IncidentDetailScreen} />
    </IncidentsStack.Navigator>
  );
}

function OverrideNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <OverrideStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <OverrideStack.Screen name="SupervisorOverride" component={OverridePanelScreen} />
    </OverrideStack.Navigator>
  );
}

function ScannerNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <ScannerStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <ScannerStack.Screen name="SupervisorGateScanner" component={GateScannerScreen} />
      <ScannerStack.Screen name="SupervisorTicketVerify" component={TicketVerifyScreen} />
    </ScannerStack.Navigator>
  );
}

function TicketsNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <TicketsStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <TicketsStack.Screen name="SupervisorTicketValidation" component={TicketValidationScreen} />
    </TicketsStack.Navigator>
  );
}

function ProfileNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <ProfileStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
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
        tabBarIcon: ({ focused }) => <TabBar routeName={route.name} focused={focused} />,
        tabBarStyle,
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Incidents" component={IncidentsNavigator} />
      <Tab.Screen name="Tickets" component={TicketsNavigator} />
      <Tab.Screen name="Scanner" component={ScannerNavigator} />
      <Tab.Screen name="Override" component={OverrideNavigator} />
      <Tab.Screen name="Account" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
