import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/LoadingScreen';

function RootNavigator() {
  const { isBootstrapping } = useContext(AuthContext);

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
