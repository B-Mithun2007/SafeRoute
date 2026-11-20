/**
 * AppNavigator
 * Root Application Navigation Stack.
 * Coordinates Splash, Onboarding, Authentication, and Main Tab flows with modal overlays.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import LocationSearchScreen from '../screens/LocationSearchScreen';
import RouteComparisonScreen from '../screens/RouteComparisonScreen';
import MapScreen from '../screens/MapScreen';
import IncidentReportScreen from '../screens/IncidentReportScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import SOSScreen from '../screens/SOSScreen';
import HeatmapScreen from '../screens/HeatmapScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />

      {/* Navigation & Safety Modals */}
      <Stack.Screen
        name="LocationSearch"
        component={LocationSearchScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="RouteComparison" component={RouteComparisonScreen} />
      <Stack.Screen name="MapDetail" component={MapScreen} />
      <Stack.Screen
        name="IncidentReport"
        component={IncidentReportScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen
        name="SOS"
        component={SOSScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="SafetyHeatmap" component={HeatmapScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
