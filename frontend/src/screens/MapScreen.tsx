/**
 * MapScreen (Spatial Navigator)
 * Full-bleed map-first navigation canvas with:
 * - Floating Island Search Capsule (top)
 * - Precision Floating Telemetry Cluster (zoom, layer, locate)
 * - Floating Hazard Dispatch Button
 * - Expandable Route & Safety Telemetry Drawer (bottom)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import MapViewComponent from '../maps/MapViewComponent';
import SafetyHeatmapLegend from '../maps/SafetyHeatmap';
import { useLocation } from '../context/LocationContext';
import IncidentService from '../services/incidentService';
import SafetyService from '../services/safetyService';
import { RouteOption, LocationPoint } from '../types/route';
import { IncidentReport, HeatmapSegment } from '../types/incident';

export const MapScreen = ({ route, navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    currentLocation,
    currentAddress,
    refreshLocation,
    isLoadingLocation,
    errorMsg,
    hasPermission,
  } = useLocation();

  const passedRoute: RouteOption | undefined = route?.params?.selectedRoute;
  const passedOrigin: LocationPoint | undefined = route?.params?.origin;
  const passedDest: LocationPoint | undefined = route?.params?.destination;

  const [activeRouteId, setActiveRouteId] = useState<string>(passedRoute?.id || 'route_sample_safest');
  const [showDrawer, setShowDrawer] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [heatmapSegments, setHeatmapSegments] = useState<HeatmapSegment[]>([]);

  const activeOrigin = passedOrigin?.coordinates || currentLocation;
  const activeDest = passedDest?.coordinates || null;

  useEffect(() => {
    const fetchMapContext = async () => {
      const lat = activeOrigin?.latitude || 37.7749;
      const lng = activeOrigin?.longitude || -122.4194;
      try {
        const [incList, segList] = await Promise.all([
          IncidentService.getNearbyIncidents(lat, lng),
          SafetyService.getHeatmapSegments(lat, lng, 'all'),
        ]);
        setIncidents(incList);
        setHeatmapSegments(segList);
      } catch (err) {
        console.warn('Error fetching map safety data:', err);
      }
    };

    fetchMapContext();
  }, [activeOrigin?.latitude, activeOrigin?.longitude]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mapCanvasWrapper}>
        {/* Full-bleed Spatial Map Canvas */}
        <MapViewComponent
          origin={activeOrigin}
          destination={activeDest}
          routes={passedRoute ? [passedRoute] : undefined}
          selectedRouteId={activeRouteId}
          incidents={incidents}
          heatmapSegments={heatmapSegments}
          onSelectRoute={(id) => setActiveRouteId(id)}
          style={styles.fullMap}
          showZoomControls={false}
          isLoading={isLoadingLocation}
          errorMsg={errorMsg}
          onRetryLocation={refreshLocation}
        />

        {/* Floating Top Island Capsule */}
        <View style={[styles.topIslandCapsule, isDesktop && styles.desktopTopIsland]}>
          {passedRoute && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.searchBarTouch}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('LocationSearch', {
                target: 'destination',
                returnScreen: 'MapDetail',
              })
            }
          >
            <View style={styles.searchIconBox}>
              <Ionicons name="search" size={16} color={Theme.colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchTargetLabel}>DESTINATION SEARCH</Text>
              <Text style={styles.searchTargetText} numberOfLines={1}>
                {passedDest ? passedDest.name : 'Where would you like to travel safely?'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.islandStatusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>92% SECURE</Text>
          </View>
        </View>

        {/* Floating Action Cluster: Hazard Report + SOS */}
        <View style={styles.leftControlGroup}>
          <TouchableOpacity
            style={[styles.floatingReportBtn, Theme.shadows.card]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('IncidentReport', {})}
          >
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.floatingReportText}>Report Hazard</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Bottom Drawer / Route & Safety Telemetry Panel */}
        <View style={[styles.bottomDrawerContainer, isDesktop && styles.desktopDrawer]}>
          <View style={[styles.bottomDrawer, Theme.shadows.floating]}>
            <View style={styles.drawerHandleRow}>
              <TouchableOpacity
                style={styles.drawerHandleTouch}
                onPress={() => setShowDrawer(!showDrawer)}
              >
                <View style={styles.drawerPillHandle} />
              </TouchableOpacity>
            </View>

            {showDrawer && (
              <>
                <View style={styles.drawerHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drawerRouteTitle}>
                      {passedRoute ? passedRoute.name : 'Pedestrian Spatial Monitoring'}
                    </Text>
                    <Text style={styles.drawerRouteSub} numberOfLines={1}>
                      {currentAddress || 'Real-time GPS tracked • Active hazard radar'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.legendToggleBtn}
                    onPress={() => setShowLegend(!showLegend)}
                  >
                    <Ionicons name="information-circle-outline" size={14} color={Theme.colors.teal} style={{ marginRight: 4 }} />
                    <Text style={styles.legendToggleText}>Legend</Text>
                  </TouchableOpacity>
                </View>

                {showLegend && (
                  <View style={{ marginTop: 8, marginBottom: 8 }}>
                    <SafetyHeatmapLegend showDisclaimer />
                  </View>
                )}

                {/* Corridor & Safety Metrics Grid */}
                <View style={styles.metricCapsulesRow}>
                  <View style={styles.metricCapsule}>
                    <Ionicons name="shield-checkmark" size={16} color={Theme.colors.emerald} />
                    <View style={styles.metricTexts}>
                      <Text style={styles.metricVal}>
                        {passedRoute ? `${passedRoute.safetyScore}/100` : '88/100'}
                      </Text>
                      <Text style={styles.metricLabel}>Safety Score</Text>
                    </View>
                  </View>

                  <View style={styles.metricCapsule}>
                    <Ionicons name="sunny" size={16} color={Theme.colors.amber} />
                    <View style={styles.metricTexts}>
                      <Text style={styles.metricVal}>
                        {passedRoute ? `${passedRoute.wellLitPercentage}%` : '94%'}
                      </Text>
                      <Text style={styles.metricLabel}>Lighting</Text>
                    </View>
                  </View>

                  <View style={styles.metricCapsule}>
                    <Ionicons name="people" size={16} color={Theme.colors.cyan} />
                    <View style={styles.metricTexts}>
                      <Text style={styles.metricVal}>High</Text>
                      <Text style={styles.metricLabel}>Foot Density</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.obsidian,
  },
  mapCanvasWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  fullMap: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  topIslandCapsule: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(9, 13, 22, 0.94)',
    borderRadius: Theme.radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#090D16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  desktopTopIsland: {
    left: 24,
    right: 24,
    maxWidth: 680,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchBarTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 148, 136, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchTargetLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.teal,
    letterSpacing: 0.6,
  },
  searchTargetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 1,
  },
  islandStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.35)',
    marginLeft: 8,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.colors.emerald,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.emerald,
    letterSpacing: 0.5,
  },
  leftControlGroup: {
    position: 'absolute',
    top: 86,
    left: 14,
    zIndex: 10,
  },
  floatingReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.obsidian,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingReportText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  bottomDrawerContainer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 10,
  },
  desktopDrawer: {
    maxWidth: 620,
    alignSelf: 'center',
    left: 'auto',
    right: 'auto',
    width: '100%',
  },
  bottomDrawer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Theme.radii.xl,
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  drawerHandleRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  drawerHandleTouch: {
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  drawerPillHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.borderLight,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  drawerRouteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.2,
  },
  drawerRouteSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  legendToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.canvas,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  legendToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.teal,
  },
  metricCapsulesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.canvas,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  metricTexts: {
    marginLeft: 8,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
});

export default MapScreen;
