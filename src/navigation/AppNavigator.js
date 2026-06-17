import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import FanTabNavigator from './FanTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import StaffTabNavigator from './StaffTabNavigator';
import SupervisorTabNavigator from './SupervisorTabNavigator';
import { ROLES } from '../constants/config';
import { colors } from '../constants/theme';

const AuthStack = createStackNavigator();

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

export default function AppNavigator() {
  const { userToken } = useContext(AuthContext);

  if (userToken) {
    return <RoleNavigator />;
  }

  return <AuthNavigator />;
}
