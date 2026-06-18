import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import FanDashboardScreen from '../screens/home/FanDashboardScreen';
import MatchListScreen from '../screens/matches/MatchListScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import SeatSelectionScreen from '../screens/matches/SeatSelectionScreen';
import BookingScreen from '../screens/matches/BookingScreen';
import MyTicketsScreen from '../screens/home/MyTicketsScreen';
import TicketDetailScreen from '../screens/home/TicketDetailScreen';
import WishlistScreen from '../screens/home/WishlistScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { colors, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const BrowseStack = createStackNavigator();
const TicketsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false, cardStyle: { backgroundColor: colors.background } };

function TabIcon({ label, focused }) {
  const icons = { Home: '🏠', Browse: '🔍', 'My Tickets': '🎫', Account: '👤' };
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icons[label] || '•'}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="FanHome" component={FanDashboardScreen} />
      <HomeStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <HomeStack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <HomeStack.Screen name="Booking" component={BookingScreen} />
      <HomeStack.Screen name="Wishlist" component={WishlistScreen} />
    </HomeStack.Navigator>
  );
}

function BrowseNavigator() {
  return (
    <BrowseStack.Navigator screenOptions={screenOptions}>
      <BrowseStack.Screen name="MatchList" component={MatchListScreen} />
      <BrowseStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <BrowseStack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <BrowseStack.Screen name="Booking" component={BookingScreen} />
    </BrowseStack.Navigator>
  );
}

function TicketsNavigator() {
  return (
    <TicketsStack.Navigator screenOptions={screenOptions}>
      <TicketsStack.Screen name="MyTickets" component={MyTicketsScreen} />
      <TicketsStack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <TicketsStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <TicketsStack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <TicketsStack.Screen name="Booking" component={BookingScreen} />
    </TicketsStack.Navigator>
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

export default function FanTabNavigator() {
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
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Browse" component={BrowseNavigator} />
      <Tab.Screen name="My Tickets" component={TicketsNavigator} />
      <Tab.Screen name="Account" component={ProfileNavigator} />
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
