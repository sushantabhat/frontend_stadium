import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MatchListScreen from '../screens/matches/MatchListScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import AdminMatchListScreen from '../screens/admin/AdminMatchListScreen';
import CreateMatchScreen from '../screens/admin/CreateMatchScreen';
import StaffHomeScreen from '../screens/staff/StaffHomeScreen';
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
      <UserStack.Screen name="MatchList" component={MatchListScreen} />
      <UserStack.Screen name="MatchDetail" component={MatchDetailScreen} />
    </UserStack.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={screenOptions}>
      <AdminStack.Screen name="AdminMatchList" component={AdminMatchListScreen} />
      <AdminStack.Screen name="CreateMatch" component={CreateMatchScreen} />
      <AdminStack.Screen name="MatchDetail" component={MatchDetailScreen} />
    </AdminStack.Navigator>
  );
}

function StaffNavigator() {
  return (
    <StaffStack.Navigator screenOptions={screenOptions}>
      <StaffStack.Screen name="StaffHome" component={StaffHomeScreen} />
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

export default function AppNavigator() {
  const { userToken } = useContext(AuthContext);

  if (userToken) {
    return <RoleNavigator />;
  }

  return <AuthNavigator />;
}
