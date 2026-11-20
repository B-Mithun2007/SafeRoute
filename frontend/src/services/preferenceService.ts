/**
 * User Travel Preferences Service.
 * Persists preferences locally to AsyncStorage and syncs with the FastAPI backend.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import { Config } from '../constants/config';
import { TravelPreferences } from '../types/user';

export const defaultPreferences: TravelPreferences = {
  preferWellLit: true,
  avoidIsolated: true,
  preferPublicActivity: true,
  avoidRecentIncidents: true,
  safetyPriority: 'safety_first',
  maxDetourPercent: 25,
  autoNotifyContacts: true,
};

export const PreferenceService = {
  /**
   * Load current user travel preferences
   */
  async getPreferences(): Promise<TravelPreferences> {
    try {
      const stored = await AsyncStorage.getItem(Config.STORAGE_KEYS.TRAVEL_PREFERENCES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Continue to default
    }
    return defaultPreferences;
  },

  /**
   * Save updated preferences locally and sync to backend API
   */
  async savePreferences(preferences: TravelPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        Config.STORAGE_KEYS.TRAVEL_PREFERENCES,
        JSON.stringify(preferences)
      );

      // Attempt non-blocking backend sync
      apiClient.post('/api/preferences', preferences).catch(() => {
        // Silently tolerate if backend endpoint is not yet ready
      });
    } catch (error) {
      console.error('[PreferenceService] Failed to save preferences:', error);
      throw error;
    }
  },
};

export default PreferenceService;
