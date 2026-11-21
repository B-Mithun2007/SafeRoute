/**
 * Global application configuration and environment defaults.
 */
import { Platform } from 'react-native';

// Resolve host URL based on target platform
const getPlatformApiHost = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator tunnels to the host machine via 10.0.2.2.
    // For a physical Android device on the same Wi-Fi, set
    // EXPO_PUBLIC_API_BASE_URL=http://<YOUR-PC-LAN-IP>:8000 in .env
    return 'http://10.0.2.2:8000';
  }
  // iOS Simulator and Expo Web share the host machine's localhost.
  return 'http://localhost:8000';
};

export const Config = {
  APP_NAME: 'SafeRoute-AI',
  TAGLINE: 'Navigate Smarter. Travel Safer.',
  VERSION: '1.0.0',

  // ---------------------------------------------------------------------------
  // API Base URL
  // Priority 1: EXPO_PUBLIC_API_BASE_URL env var (highest — covers physical devices)
  // Priority 2: Platform detection (Android emulator vs iOS/Web)
  // ---------------------------------------------------------------------------
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || getPlatformApiHost(),
  API_TIMEOUT_MS: 12000,

  // ---------------------------------------------------------------------------
  // Mock API Mode
  //
  // FORCE_MOCK_API = true  → Always use sample data, never contact backend.
  //                          Use for UI demos or when backend is unavailable.
  //
  // AUTO_FALLBACK_TO_MOCK  → When false (default for integration testing),
  //                          backend errors are thrown and visible in the console.
  //                          When true, errors are silently swallowed and replaced
  //                          with sample data (useful for hackathon demos).
  //
  // Set EXPO_PUBLIC_USE_MOCK_API=true  to force mock mode.
  // Set EXPO_PUBLIC_AUTO_FALLBACK=true to restore silent fallback behaviour.
  // ---------------------------------------------------------------------------
  FORCE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  AUTO_FALLBACK_TO_MOCK: process.env.EXPO_PUBLIC_AUTO_FALLBACK === 'true',

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
