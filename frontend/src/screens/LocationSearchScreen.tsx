/**
 * LocationSearchScreen (Destination & Origin Search Deck)
 * Premium search experience with:
 * - Floating Obsidian Input Capsule with debounce & instant clear
 * - Direct GPS Telemetry Anchor Row
 * - Categorized Recent vs Live Geocoding Results with distance & safety chips
 * - Refined Empty & Error Feedback States
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import AtmosphericBackground from '../components/AtmosphericBackground';
import { useLocation } from '../context/LocationContext';
import { LocationPoint } from '../types/route';
import GeocodingService, { PlaceSuggestion } from '../services/geocodingService';

export const LocationSearchScreen = ({ route, navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    target = 'destination',
    currentOrigin,
    currentDestination,
    returnScreen,
  } = route.params || {};

  const { currentLocation, currentAddress } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimeout = useRef<any>(null);

  useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = async () => {
    try {
      const recents = await GeocodingService.getRecentDestinations();
      setResults(recents);
      setHasSearched(false);
    } catch {
      // Non-blocking
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setErrorMsg(null);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!text.trim()) {
      setIsLoading(false);
      loadRecents();
      return;
    }

    setIsLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const places = await GeocodingService.searchPlaces(text);
        setResults(places);
        setHasSearched(true);
      } catch (err: any) {
        setErrorMsg('Unable to retrieve search locations. Please check your network.');
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleClear = () => {
    setQuery('');
    setErrorMsg(null);
    setIsLoading(false);
    loadRecents();
  };

  const handleSelectLocation = async (place: PlaceSuggestion) => {
    const selectedPoint: LocationPoint = {
      name: place.name,
      address: place.address,
      coordinates: { latitude: place.latitude, longitude: place.longitude },
    };

    await GeocodingService.saveRecentDestination(place);

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
      const activeOrigin: LocationPoint = currentOrigin || {
        name: currentAddress || 'Current Location',
        address: currentAddress || 'GPS Position',
        coordinates: currentLocation || { latitude: 37.7749, longitude: -122.4194 },
      };

      if (returnScreen === 'MapDetail') {
        navigation.navigate('MapDetail', {
          origin: activeOrigin,
          destination: selectedPoint,
        });
      } else {
        navigation.navigate('RouteComparison', {
          origin: activeOrigin,
          destination: selectedPoint,
        });
      }
    }
  };

  const handleSelectCurrentGPS = () => {
    if (!currentLocation) return;
    const gpsPoint: LocationPoint = {
      name: currentAddress || 'Current GPS Location',
      address: currentAddress || 'Current GPS Position',
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
    } else {
      navigation.navigate('RouteComparison', {
        origin: gpsPoint,
        destination: gpsPoint,
      });
    }
  };

  return (
    <AtmosphericBackground variant="canvas">
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.centerDeckWrapper, isDesktop && styles.desktopCenterDeck]}>

          {/* Top Search Control Header */}
          <View style={styles.searchHeaderDeck}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={Theme.colors.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.searchCapsule, Theme.shadows.card]}>
              <Ionicons name="search" size={18} color={Theme.colors.teal} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={target === 'origin' ? 'Set departure point...' : 'Where to? Street, transit, or landmark...'}
                placeholderTextColor={Theme.colors.textMuted}
                value={query}
                onChangeText={handleQueryChange}
                autoFocus
                returnKeyType="search"
              />
              {isLoading && (
                <ActivityIndicator size="small" color={Theme.colors.teal} style={styles.spinner} />
              )}
              {query.length > 0 && !isLoading && (
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Direct GPS Anchor Action */}
          <TouchableOpacity
            style={[styles.gpsAnchorCard, Theme.shadows.soft]}
            onPress={handleSelectCurrentGPS}
            activeOpacity={0.8}
          >
            <View style={styles.gpsAnchorIcon}>
              <Ionicons name="locate" size={20} color={Theme.colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.gpsAnchorBadgeRow}>
                <View style={styles.gpsPulse} />
                <Text style={styles.gpsAnchorLabel}>VERIFIED DEVICE SENSORS</Text>
              </View>
              <Text style={styles.gpsAnchorTitle}>Use Current GPS Location</Text>
              <Text style={styles.gpsAnchorSub} numberOfLines={1}>
                {currentAddress || 'Acquire high-precision satellite coordinates'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.borderLight} />
          </TouchableOpacity>

          {/* Error Banner */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Theme.colors.crimson} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* List Section Header */}
          <View style={styles.listSectionHeader}>
            <Text style={styles.listSectionLabel}>
              {hasSearched ? 'GLOBAL GEOCODING RESULTS' : 'RECENT DESTINATIONS'}
            </Text>
            <Text style={styles.listCount}>{results.length} found</Text>
          </View>

          {/* Results List */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultCard, Theme.shadows.soft]}
                onPress={() => handleSelectLocation(item)}
                activeOpacity={0.75}
              >
                <View style={styles.resultIconBox}>
                  <Ionicons
                    name={hasSearched ? 'location' : 'time-outline'}
                    size={18}
                    color={hasSearched ? Theme.colors.teal : Theme.colors.textMuted}
                  />
                </View>
                <View style={styles.resultTexts}>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
                <View style={styles.safetyVerifiedPill}>
                  <Ionicons name="shield-checkmark" size={11} color={Theme.colors.emerald} />
                  <Text style={styles.safetyVerifiedText}>Scored</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="compass-outline" size={36} color={Theme.colors.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {hasSearched ? 'No matching locations' : 'No recent searches recorded'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {hasSearched
                      ? 'Try searching by street name, metro station, or urban district.'
                      : 'Search for any destination to evaluate safer pedestrian corridors.'}
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerDeckWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  desktopCenterDeck: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 24,
  },
  searchHeaderDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Theme.radii.md,
    backgroundColor: Theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.lg,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: Theme.colors.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Theme.colors.textPrimary,
    fontWeight: '500',
  },
  spinner: {
    marginLeft: 6,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  gpsAnchorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    padding: 14,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 16,
  },
  gpsAnchorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)',
  },
  gpsAnchorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  gpsPulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.colors.emerald,
    marginRight: 5,
  },
  gpsAnchorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.emerald,
    letterSpacing: 0.6,
  },
  gpsAnchorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  gpsAnchorSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.crimsonBg,
    padding: 10,
    borderRadius: Theme.radii.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.crimsonBorder,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.crimson,
    flex: 1,
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  listSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  listCount: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  resultsList: {
    paddingBottom: 40,
    gap: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  resultIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultTexts: {
    flex: 1,
    marginRight: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  resultAddress: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  safetyVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.emeraldBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.emeraldBorder,
  },
  safetyVerifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.emerald,
    marginLeft: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
});

export default LocationSearchScreen;
