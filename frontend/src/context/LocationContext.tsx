/**
 * Location Context
 * Manages GPS tracking, permission prompts, reverse geocoding, and fallback coordinates.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Coordinates, LocationPoint } from '../types/route';
import { Config } from '../constants/config';

interface LocationContextType {
  currentLocation: Coordinates | null;
  currentAddress: string;
  hasPermission: boolean | null;
  isLoadingLocation: boolean;
  errorMsg: string | null;
  refreshLocation: () => Promise<void>;
  asLocationPoint: LocationPoint;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>({
    latitude: Config.DEFAULT_REGION.latitude,
    longitude: Config.DEFAULT_REGION.longitude,
  });
  const [currentAddress, setCurrentAddress] = useState<string>('Market St & 4th St, Downtown');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestAndFetchLocation = async () => {
    setIsLoadingLocation(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        setErrorMsg('Location permission was denied. Showing downtown default.');
        setIsLoadingLocation(false);
        return;
      }

      setHasPermission(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCurrentLocation(coords);

      // Attempt reverse geocoding
      try {
        const geocode = await Location.reverseGeocodeAsync(coords);
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          const parts = [item.name, item.street, item.city].filter(Boolean);
          setCurrentAddress(parts.join(', ') || 'Current Location');
        }
      } catch {
        setCurrentAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err: any) {
      console.warn('[LocationContext] GPS fetch failed:', err);
      setErrorMsg('Unable to retrieve device GPS. Fallback active.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    requestAndFetchLocation();
  }, []);

  const asLocationPoint: LocationPoint = {
    name: currentAddress,
    address: currentAddress,
    coordinates: currentLocation || {
      latitude: Config.DEFAULT_REGION.latitude,
      longitude: Config.DEFAULT_REGION.longitude,
    },
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        currentAddress,
        hasPermission,
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
