/**
 * LocationSearchScreen
 * Search interface for choosing Origin or Destination points.
 * Includes GPS shortcut, recent places, and location clearing.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useLocation } from '../context/LocationContext';
import { LocationPoint } from '../types/route';

interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'recent' | 'popular' | 'transit';
}

const SAMPLE_PLACES: PlaceSuggestion[] = [
  {
    id: 'p1',
    name: 'University Campus Library',
    address: '700 Library Way, Main Quad',
    latitude: 37.7812,
    longitude: -122.411,
    type: 'recent',
  },
  {
    id: 'p2',
    name: 'Central Metro Station',
    address: 'Market St & 5th Avenue Interchange',
    latitude: 37.7834,
    longitude: -122.408,
    type: 'transit',
  },
  {
    id: 'p3',
    name: 'Downtown Medical Center',
    address: '250 Hospital Road, West Wing',
    latitude: 37.7865,
    longitude: -122.415,
    type: 'popular',
  },
  {
    id: 'p4',
    name: 'Financial Center Plaza',
    address: '100 Pine Street',
    latitude: 37.7925,
    longitude: -122.399,
    type: 'recent',
  },
  {
    id: 'p5',
    name: 'City Hall Square',
    address: '1 Dr Carlton B Goodlett Pl',
    latitude: 37.7792,
    longitude: -122.4191,
    type: 'popular',
  },
];

export const LocationSearchScreen = ({ route, navigation }: any) => {
  const { target, currentOrigin, currentDestination } = route.params || { target: 'destination' };
  const { currentLocation, currentAddress } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceSuggestion[]>(SAMPLE_PLACES);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults(SAMPLE_PLACES);
      return;
    }
    const filtered = SAMPLE_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.address.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filtered);
  };

  const handleSelectLocation = (place: PlaceSuggestion) => {
    const selectedPoint: LocationPoint = {
      name: place.name,
      address: place.address,
      coordinates: { latitude: place.latitude, longitude: place.longitude },
    };

    if (target === 'origin') {
      if (currentDestination) {
        navigation.navigate('RouteComparison', {
          origin: selectedPoint,
          destination: currentDestination,
        });
      } else {
        navigation.goBack();
      }
    } else {
      const activeOrigin = currentOrigin || {
        name: 'Current Location',
        address: currentAddress,
        coordinates: currentLocation || { latitude: 37.7749, longitude: -122.4194 },
      };

      navigation.navigate('RouteComparison', {
        origin: activeOrigin,
        destination: selectedPoint,
      });
    }
  };

  const handleSelectCurrentGPS = () => {
    if (!currentLocation) return;
    const gpsPoint: LocationPoint = {
      name: 'Current Location',
      address: currentAddress,
      coordinates: currentLocation,
    };
    if (target === 'origin') {
      if (currentDestination) {
        navigation.navigate('RouteComparison', {
          origin: gpsPoint,
          destination: currentDestination,
        });
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {target === 'origin' ? 'Set Starting Point' : 'Choose Destination'}
        </Text>
      </View>

      <View style={styles.searchBoxWrapper}>
        <Ionicons name="search" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
        <TextInput
          placeholder={target === 'origin' ? 'Search pickup point...' : 'Search safe destination...'}
          placeholderTextColor={Colors.gray400}
          value={query}
          onChangeText={handleSearch}
          style={styles.input}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        )}
      </View>

      {/* GPS Current Location Shortcut */}
      {target === 'origin' && (
        <TouchableOpacity
          style={styles.gpsShortcut}
          activeOpacity={0.7}
          onPress={handleSelectCurrentGPS}
        >
          <View style={styles.gpsIconCircle}>
            <Ionicons name="locate" size={18} color={Colors.white} />
          </View>
          <View style={styles.gpsTexts}>
            <Text style={styles.gpsTitle}>Use Current GPS Location</Text>
            <Text style={styles.gpsSub}>{currentAddress}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Suggestion list */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionHeader}>Suggested & Recent Locations</Text>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.placeItem}
              activeOpacity={0.7}
              onPress={() => handleSelectLocation(item)}
            >
              <View style={styles.placeIconBox}>
                <Ionicons
                  name={
                    item.type === 'transit'
                      ? 'train-outline'
                      : item.type === 'recent'
                      ? 'time-outline'
                      : 'location-outline'
                  }
                  size={18}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.placeTexts}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.placeAddress}>{item.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray900,
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderWidth: 1.5,
    borderColor: Colors.accentLight,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray900,
  },
  gpsShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  gpsIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  gpsTexts: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  gpsSub: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  placeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeTexts: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
  },
  placeAddress: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
});

export default LocationSearchScreen;
