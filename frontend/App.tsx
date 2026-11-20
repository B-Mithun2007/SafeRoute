/**
 * SafeRoute-AI Main Application Component
 * Initializes global context providers and root navigation container.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <PreferencesProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <AppNavigator />
            </NavigationContainer>
          </PreferencesProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
