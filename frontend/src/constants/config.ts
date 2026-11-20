/**
 * Global application configuration and environment defaults.
 */
import { Platform } from 'react-native';

// Resolve host URL based on target platform
const getPlatformApiHost = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator connects to host via 10.0.2.2
    return 'http://10.0.2.2:8000';
  }
  // iOS Simulator and Web connect via localhost
  return 'http://localhost:8000';
};

export const Config = {
  APP_NAME: 'SafeRoute-AI',
  TAGLINE: 'Navigate Smarter. Travel Safer.',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || getPlatformApiHost(),
  API_TIMEOUT_MS: 12000,
  // If true, mock data will be used automatically when backend fails or is offline
  AUTO_FALLBACK_TO_MOCK: true,
  FORCE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
  DEFAULT_REGION: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  STORAGE_KEYS: {
    AUTH_TOKEN: '@saferoute_auth_token',
    USER_PROFILE: '@saferoute_user_profile',
    ONBOARDING_COMPLETED: '@saferoute_onboarding_completed',
    TRAVEL_PREFERENCES: '@saferoute_travel_preferences',
    EMERGENCY_CONTACTS: '@saferoute_emergency_contacts',
    RECENT_DESTINATIONS: '@saferoute_recent_destinations',
  },
};

export default Config;
