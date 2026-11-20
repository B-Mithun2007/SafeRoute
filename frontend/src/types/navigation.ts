/**
 * Type definitions for React Navigation Stacks and Tab Navigators.
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { LocationPoint, RouteOption } from './route';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  LocationSearch: {
    target: 'origin' | 'destination';
    currentOrigin?: LocationPoint;
    currentDestination?: LocationPoint;
  };
  RouteComparison: {
    origin: LocationPoint;
    destination: LocationPoint;
  };
  MapDetail: {
    selectedRoute?: RouteOption;
    origin?: LocationPoint;
    destination?: LocationPoint;
  };
  IncidentReport: {
    prefillLocation?: LocationPoint;
  };
  Preferences: undefined;
  SOS: undefined;
  SafetyHeatmap: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  ReportsTab: undefined;
  SafetyTab: undefined;
  ProfileTab: undefined;
};
