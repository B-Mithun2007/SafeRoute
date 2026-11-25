/**
 * Location Context
 * Manages GPS tracking, permission prompts, reverse geocoding, and error states.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates, LocationPoint } from '../types/route';
import { Config } from '../constants/config';

export type LocationPermissionState = 'undetermined' | 'granted' | 'denied' | 'disabled';

interface LocationContextType {
  currentLocation: Coordinates | null;
  currentAddress: string;
  hasPermission: boolean | null;
  permissionState: LocationPermissionState;
  isLoadingLocation: boolean;
  errorMsg: string | null;
  refreshLocation: () => Promise<void>;
  asLocationPoint: LocationPoint | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('Locating GPS...');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('undetermined');
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestAndFetchLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setErrorMsg(null);

    try {
      // 1. Verify if location services are enabled on the host system
      const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);
      if (!servicesEnabled) {
        setHasPermission(false);
        setPermissionState('disabled');
        setErrorMsg('Location services are disabled on your device. Please enable GPS.');
        setIsLoadingLocation(false);
        return;
      }

      // 2. Check and request foreground permissions
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== Location.PermissionStatus.GRANTED) {
        const { status: requestedStatus } = await Location.requestForegroundPermissionsAsync();
        finalStatus = requestedStatus;
      }

      if (finalStatus !== Location.PermissionStatus.GRANTED) {
        setHasPermission(false);
        setPermissionState('denied');
        setErrorMsg('Location permission was denied. Please grant location access in browser/device settings.');
        setIsLoadingLocation(false);
        return;
      }

      setHasPermission(true);
      setPermissionState('granted');

      // 3. Retrieve accurate current coordinates with a safety timeout
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!position || !position.coords) {
        throw new Error('Location reading returned empty coordinates.');
      }

      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Validate coordinate bounds
      if (
        isNaN(coords.latitude) ||
        isNaN(coords.longitude) ||
        coords.latitude < -90 ||
        coords.latitude > 90 ||
        coords.longitude < -180 ||
        coords.longitude > 180
      ) {
        throw new Error('Invalid GPS coordinates received from device.');
      }

      setCurrentLocation(coords);

      // 4. Reverse geocode to retrieve human-readable address
      try {
        const geocode = await Location.reverseGeocodeAsync(coords);
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          const parts = [item.name, item.street, item.city, item.region].filter(Boolean);
          setCurrentAddress(parts.join(', ') || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        } else {
          setCurrentAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        }
      } catch {
        setCurrentAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err: any) {
      console.warn('[LocationContext] Location retrieval failed:', err);
      const isTimeout = err?.message?.toLowerCase().includes('timeout');
      setErrorMsg(
        isTimeout
          ? 'GPS location request timed out. Please tap retry.'
          : err?.message || 'Unable to retrieve device GPS location.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    requestAndFetchLocation();
  }, [requestAndFetchLocation]);

  const asLocationPoint: LocationPoint | null = currentLocation
    ? {
        name: currentAddress || 'Current Location',
        address: currentAddress,
        coordinates: currentLocation,
      }
    : null;

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        currentAddress,
        hasPermission,
        permissionState,
        isLoadingLocation,
        errorMsg,
        refreshLocation: requestAndFetchLocation,
        asLocationPoint,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
