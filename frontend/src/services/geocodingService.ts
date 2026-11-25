/**
 * Geocoding & Place Search Service
 * Provides forward geocoding using OpenStreetMap Nominatim with offline fallback
 * and persistent recent destinations cache in AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'recent' | 'popular' | 'transit' | 'search';
}

const CURATED_DEFAULT_PLACES: PlaceSuggestion[] = [
  {
    id: 'p_library',
    name: 'University Campus Library',
    address: '700 Library Way, Main Quad',
    latitude: 37.7812,
    longitude: -122.411,
    type: 'popular',
  },
  {
    id: 'p_metro',
    name: 'Central Metro Station',
    address: 'Market St & 5th Avenue Interchange',
    latitude: 37.7834,
    longitude: -122.408,
    type: 'transit',
  },
  {
    id: 'p_hospital',
    name: 'Downtown Medical Center',
    address: '250 Hospital Road, West Wing',
    latitude: 37.7865,
    longitude: -122.415,
    type: 'popular',
  },
  {
    id: 'p_plaza',
    name: 'Financial Center Plaza',
    address: '100 Pine Street',
    latitude: 37.7925,
    longitude: -122.399,
    type: 'popular',
  },
  {
    id: 'p_cityhall',
    name: 'City Hall Square',
    address: '1 Dr Carlton B Goodlett Pl',
    latitude: 37.7792,
    longitude: -122.4191,
    type: 'popular',
  },
];

export const GeocodingService = {
  /**
   * Searches for matching places using OpenStreetMap Nominatim.
   * Falls back to local curated dataset on network failure or rate limits.
   */
  async searchPlaces(query: string): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return this.getRecentDestinations();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&limit=8&addressdetails=1`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const rawResults = await response.json();
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          return rawResults.map((item: any, idx: number) => {
            const displayNameParts = (item.display_name || '').split(',');
            const primaryName = displayNameParts[0]?.trim() || item.name || 'Location';
            const secondaryAddress = displayNameParts.slice(1).join(',').trim();

            return {
              id: `osm_${item.place_id || idx}_${Date.now()}`,
              name: primaryName,
              address: secondaryAddress || item.display_name || 'Mapped address',
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              type: 'search' as const,
            };
          });
        }
      }
    } catch (err: any) {
      console.warn('[GeocodingService] Online search error, falling back to curated list:', err?.message);
    }

    // Fallback: Filter local curated list by matching query
    const lower = trimmed.toLowerCase();
    const localMatches = CURATED_DEFAULT_PLACES.filter(
      (p) => p.name.toLowerCase().includes(lower) || p.address.toLowerCase().includes(lower)
    );

    return localMatches;
  },

  /**
   * Retrieves user's recent destinations from AsyncStorage.
   */
  async getRecentDestinations(): Promise<PlaceSuggestion[]> {
    try {
      const stored = await AsyncStorage.getItem(Config.STORAGE_KEYS.RECENT_DESTINATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to defaults
    }
    return CURATED_DEFAULT_PLACES;
  },

  /**
   * Persists a selected destination to recent history (max 10 entries).
   */
  async saveRecentDestination(place: PlaceSuggestion): Promise<void> {
    try {
      const current = await this.getRecentDestinations();
      const filtered = current.filter(
        (p) =>
          Math.abs(p.latitude - place.latitude) > 0.0001 ||
          Math.abs(p.longitude - place.longitude) > 0.0001
      );
      const updated = [{ ...place, type: 'recent' as const }, ...filtered].slice(0, 10);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.RECENT_DESTINATIONS, JSON.stringify(updated));
    } catch (err) {
      console.warn('[GeocodingService] Failed to save recent place:', err);
    }
  },
};

export default GeocodingService;
