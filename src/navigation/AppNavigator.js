import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MatchListScreen from '../screens/matches/MatchListScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminMatchListScreen from '../screens/admin/AdminMatchListScreen';
import CreateMatchScreen from '../screens/admin/CreateMatchScreen';
import StatisticsScreen from '../screens/admin/StatisticsScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import GateScannerScreen from '../screens/staff/GateScannerScreen';
import MyShiftsScreen from '../screens/staff/MyShiftsScreen';
import DailyReportScreen from '../screens/staff/DailyReportScreen';
import TicketVerifyScreen from '../screens/staff/TicketVerifyScreen';
import FanDashboardScreen from '../screens/home/FanDashboardScreen';
import MyTicketsScreen from '../screens/home/MyTicketsScreen';
import WishlistScreen from '../screens/home/WishlistScreen';
import FanProfileScreen from '../screens/home/FanProfileScreen';
import { ROLES } from '../constants/config';
import { colors } from '../constants/theme';

const AuthStack = createStackNavigator();
const UserStack = createStackNavigator();
const AdminStack = createStackNavigator();
const StaffStack = createStackNavigator();

const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: colors.background },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={screenOptions}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function UserNavigator() {
  return (
    <UserStack.Navigator screenOptions={screenOptions}>
      <UserStack.Screen name="FanDashboard" component={FanDashboardScreen} />
      <UserStack.Screen name="MatchList" component={MatchListScreen} />
      <UserStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <UserStack.Screen name="MyTickets" component={MyTicketsScreen} />
      <UserStack.Screen name="Wishlist" component={WishlistScreen} />
      <UserStack.Screen name="FanProfile" component={FanProfileScreen} />
    </UserStack.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={screenOptions}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AdminMatchList" component={AdminMatchListScreen} />
      <AdminStack.Screen name="CreateMatch" component={CreateMatchScreen} />
      <AdminStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <AdminStack.Screen name="Statistics" component={StatisticsScreen} />
      <AdminStack.Screen name="UserManagement" component={UserManagementScreen} />
      <AdminStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
    </AdminStack.Navigator>
  );
}

function StaffNavigator() {
  return (
    <StaffStack.Navigator screenOptions={screenOptions}>
      <StaffStack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
      <StaffStack.Screen name="GateScanner" component={GateScannerScreen} />
      <StaffStack.Screen name="MyShifts" component={MyShiftsScreen} />
      <StaffStack.Screen name="DailyReport" component={DailyReportScreen} />
      <StaffStack.Screen name="TicketVerify" component={TicketVerifyScreen} />
    </StaffStack.Navigator>
  );
}

function RoleNavigator() {
  const { userInfo } = useContext(AuthContext);

  switch (userInfo?.role) {
    case ROLES.ADMIN:
      return <AdminNavigator />;
    case ROLES.STAFF:
      return <StaffNavigator />;
    case ROLES.USER:
    default:
      return <UserNavigator />;
  }
}

export function useInitialRoute() {
  const { userInfo } = useContext(AuthContext);

  switch (userInfo?.role) {
    case ROLES.ADMIN:
      return 'AdminDashboard';
    case ROLES.STAFF:
      return 'StaffDashboard';
    case ROLES.USER:
    default:
      return 'FanDashboard';
  }
}

export default function AppNavigator() {
  const { userToken } = useContext(AuthContext);

  if (userToken) {
    return <RoleNavigator />;
  }

  return <AuthNavigator />;
}
