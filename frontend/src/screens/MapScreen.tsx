/**
 * MapScreen (Explore Map Tab & Route Detail View)
 * Fullscreen interactive safety map with live GPS tracking, route overlays,
 * safety heatmap legend, and quick hazard reporting entrypoint.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import MapViewComponent from '../maps/MapViewComponent';
import SafetyHeatmapLegend from '../maps/SafetyHeatmap';
import { useLocation } from '../context/LocationContext';
import { RouteOption, LocationPoint } from '../types/route';

export const MapScreen = ({ route, navigation }: any) => {
  const { currentLocation, currentAddress, refreshLocation } = useLocation();

  // Route parameters when navigated from RouteComparison
  const passedRoute: RouteOption | undefined = route?.params?.selectedRoute;
  const passedOrigin: LocationPoint | undefined = route?.params?.origin;
  const passedDest: LocationPoint | undefined = route?.params?.destination;

  const [activeRouteId, setActiveRouteId] = useState<string>(passedRoute?.id || 'route_sample_safest');
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const fallbackOrigin = passedOrigin?.coordinates || currentLocation || {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  const fallbackDest = passedDest?.coordinates || {
    latitude: 37.7885,
    longitude: -122.4072,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Safe Navigation Map"
        subtitle={passedRoute ? `${passedRoute.name} • ${passedRoute.safetyScore}/100` : currentAddress}
        showBack={!!passedRoute}
        onBackPress={() => navigation.goBack()}
        rightAction={{
          icon: 'locate',
          onPress: refreshLocation,
        }}
      />

      <View style={styles.mapContainer}>
        {/* Universal Map Canvas */}
        <MapViewComponent
          origin={fallbackOrigin}
          destination={fallbackDest}
          routes={passedRoute ? [passedRoute] : undefined}
          selectedRouteId={activeRouteId}
          onSelectRoute={(id) => setActiveRouteId(id)}
          style={styles.fullMap}
          showZoomControls
        />

        {/* Floating Top Controls: Location Search Trigger */}
        <TouchableOpacity
          style={styles.floatingSearchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LocationSearch', { target: 'destination' })}
        >
          <Ionicons name="search" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.floatingSearchText} numberOfLines={1}>
            {passedDest ? passedDest.name : 'Search for a safer destination...'}
          </Text>
        </TouchableOpacity>

        {/* Floating Floating Action Button (FAB) for Instant Hazard Reporting */}
        <TouchableOpacity
          style={styles.fabReport}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('IncidentReport', {})}
        >
          <Ionicons name="warning" size={20} color={Colors.white} />
          <Text style={styles.fabText}>Report Hazard</Text>
        </TouchableOpacity>

        {/* Floating SOS Trigger Button */}
        <TouchableOpacity
          style={styles.fabSOS}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SOS')}
        >
          <Ionicons name="alert" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Toggleable Safety Legend Card */}
        <View style={styles.legendWrapper}>
          <TouchableOpacity
            style={styles.legendToggle}
            onPress={() => setShowLegend(!showLegend)}
          >
            <Ionicons
              name={showLegend ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={Colors.gray700}
            />
            <Text style={styles.legendToggleText}>
              {showLegend ? 'Hide Safety Legend' : 'Show Safety Legend'}
            </Text>
          </TouchableOpacity>
          {showLegend && <SafetyHeatmapLegend showDisclaimer />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  fullMap: {
    flex: 1,
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  floatingSearchBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  floatingSearchText: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: '500',
    flex: 1,
  },
  fabReport: {
    position: 'absolute',
    left: 16,
    bottom: 140,
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  fabText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  fabSOS: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.sosRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.sosRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  legendWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  legendToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  legendToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray700,
    marginLeft: 4,
  },
});

export default MapScreen;
