import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { useBackgroundColor } from '../context/ThemeContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import FanTabNavigator from './FanTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import StaffTabNavigator from './StaffTabNavigator';
import SupervisorTabNavigator from './SupervisorTabNavigator';
import { ROLES } from '../constants/config';

const AuthStack = createStackNavigator();

const screenOptions = {
  headerShown: false,
};

function AuthNavigator() {
  const bgColor = useBackgroundColor();
  return (
    <AuthStack.Navigator screenOptions={{ ...screenOptions, cardStyle: { backgroundColor: bgColor } }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function RoleNavigator() {
  const { userInfo } = useContext(AuthContext);

  switch (userInfo?.role) {
    case ROLES.ADMIN:
      return <AdminTabNavigator />;
    case ROLES.SUPERVISOR:
      return <SupervisorTabNavigator />;
    case ROLES.STAFF:
      return <StaffTabNavigator />;
    case ROLES.USER:
    default:
      return <FanTabNavigator />;
  }
}

function AppContent() {
  const { userToken } = useContext(AuthContext);

  if (userToken) {
    return <RoleNavigator />;
  }

  return <AuthNavigator />;
}

export default function AppNavigator() {
  return <AppContent />;
}
