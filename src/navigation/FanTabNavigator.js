import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import FanDashboardScreen from '../screens/home/FanDashboardScreen';
import MatchListScreen from '../screens/matches/MatchListScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import SeatSelectionScreen from '../screens/matches/SeatSelectionScreen';
import BookingScreen from '../screens/matches/BookingScreen';
import MyTicketsScreen from '../screens/home/MyTicketsScreen';
import MatchTicketsScreen from '../screens/home/MatchTicketsScreen';
import TicketDetailScreen from '../screens/home/TicketDetailScreen';
import WishlistScreen from '../screens/home/WishlistScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { useBackgroundColor, useTheme } from '../context/ThemeContext';
import TabBar from '../components/TabBar';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const BrowseStack = createStackNavigator();
const TicketsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const screenOptions = { headerShown: false };

function HomeNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <HomeStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <HomeStack.Screen name="FanHome" component={FanDashboardScreen} />
      <HomeStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <HomeStack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <HomeStack.Screen name="Booking" component={BookingScreen} />
      <HomeStack.Screen name="Wishlist" component={WishlistScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function BrowseNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <BrowseStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <BrowseStack.Screen name="MatchList" component={MatchListScreen} />
      <BrowseStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <BrowseStack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <BrowseStack.Screen name="Booking" component={BookingScreen} />
    </BrowseStack.Navigator>
  );
}

function TicketsNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <TicketsStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <TicketsStack.Screen name="MyTickets" component={MyTicketsScreen} />
      <TicketsStack.Screen name="MatchTickets" component={MatchTicketsScreen} />
      <TicketsStack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <TicketsStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <TicketsStack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <TicketsStack.Screen name="Booking" component={BookingScreen} />
    </TicketsStack.Navigator>
  );
}

function ProfileNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <ProfileStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

function FanTabContent() {
  const { isLight } = useTheme();
  const tabStyle = {
    backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: isLight ? '#E5E7EB' : 'rgba(255, 255, 255, 0.08)',
    height: 65,
    paddingBottom: 5,
    elevation: 0,
    shadowOpacity: 0,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabBar routeName={route.name} focused={focused} />,
        tabBarStyle: tabStyle,
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

export default function FanTabNavigator() {
  return <FanTabContent />;
}
