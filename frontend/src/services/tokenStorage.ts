/**
 * Secure Token Storage Utility
 *
 * Uses Expo SecureStore (iOS Keychain / Android Keystore) on native platforms
 * and falls back to AsyncStorage on Expo Web where SecureStore is unsupported.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

// SecureStore keys may only contain alphanumeric characters, '.', '-', and '_'.
const SECURE_TOKEN_KEY = 'saferoute_auth_token';

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    }
    try {
      const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      if (token) return token;
      // Fallback check for legacy AsyncStorage key during migration
      return AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, token);
      return;
    }
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
    // Remove any legacy unencrypted token from AsyncStorage
    await AsyncStorage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      } catch {
        // Ignore if key does not exist
      }
    }
    await AsyncStorage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
  },
};

export default tokenStorage;
