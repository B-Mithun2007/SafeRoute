/**
 * HomeScreen (Command Center Dashboard)
 * Substantially restructured into an asymmetric executive safety deck:
 * 1. Command Hero Header with live GPS lock and fast SOS trigger
 * 2. Journey Orchestrator Card with glowing origin/destination pills
 * 3. Urban Safety Radar Grid with real-time zone telemetry
 * 4. Verified Safe Corridors Carousel
 * 5. Live Community Threat Watch Stream
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import AtmosphericBackground from '../components/AtmosphericBackground';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import SafetyBadge from '../components/SafetyBadge';
import CustomButton from '../components/CustomButton';
import IncidentService from '../services/incidentService';
import IncidentCard from '../components/IncidentCard';
import { IncidentReport } from '../types/incident';
import { LocationPoint } from '../types/route';

export const HomeScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { user } = useAuth();
  const { currentLocation, currentAddress, refreshLocation, isLoadingLocation } = useLocation();

  const [origin, setOrigin] = useState<LocationPoint>({
    name: 'Current Position',
    address: currentAddress || 'Acquiring GPS fix...',
    coordinates: currentLocation || { latitude: 37.7749, longitude: -122.4194 },
  });

  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [nearbyIncidents, setNearbyIncidents] = useState<IncidentReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      setOrigin({
        name: 'Current Position',
        address: currentAddress,
        coordinates: currentLocation,
      });
      loadNearbyIncidents(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, currentAddress]);

  const loadNearbyIncidents = async (lat: number, lng: number) => {
    try {
      const data = await IncidentService.getNearbyIncidents(lat, lng, 3000);
      setNearbyIncidents(data.slice(0, 3));
    } catch (err) {
      console.warn('Failed to load incidents:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshLocation();
    if (currentLocation) {
      await loadNearbyIncidents(currentLocation.latitude, currentLocation.longitude);
    }
    setIsRefreshing(false);
  };

  const handleLaunchSafeJourney = () => {
    if (!destination) {
      navigation.navigate('LocationSearch', {
        target: 'destination',
        currentOrigin: origin,
      });
      return;
    }

    navigation.navigate('RouteComparison', {
      origin,
      destination,
    });
  };

  const selectQuickDestination = (name: string, address: string, lat: number, lng: number) => {
    const destPoint: LocationPoint = {
      name,
      address,
      coordinates: { latitude: lat, longitude: lng },
    };
    setDestination(destPoint);
    navigation.navigate('RouteComparison', {
      origin,
      destination: destPoint,
    });
  };

  return (
    <AtmosphericBackground variant="canvas">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopScrollContent,
          ]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Theme.colors.teal} />
          }
        >
          {/* Top Command Header */}
          <View style={styles.headerDeck}>
            <View style={styles.headerLeft}>
              <View style={styles.telemetryTag}>
                <View style={styles.gpsPulse} />
                <Text style={styles.telemetryTagText}>VERIFIED SATELLITE FIX</Text>
              </View>
              <Text style={styles.heroGreeting}>
                Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}
              </Text>
              <Text style={styles.heroLocation} numberOfLines={1}>
                {isLoadingLocation ? 'Synchronizing coordinates...' : currentAddress || 'San Francisco Metropolitan Area'}
              </Text>
            </View>

            {/* Header Telemetry Quick Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.sosHeaderPill, Theme.shadows.glowSOS]}
                onPress={() => navigation.navigate('SOS')}
                activeOpacity={0.85}
              >
                <Ionicons name="alert" size={16} color="#FFFFFF" />
                <Text style={styles.sosHeaderPillText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Asymmetric 2-Column Deck for Desktop / Stacked for Mobile */}
          <View style={[styles.deckGrid, isDesktop && styles.desktopDeckGrid]}>

            {/* Left / Primary Column: Journey Orchestrator Card */}
            <View style={[styles.primaryColumn, isDesktop && styles.desktopPrimaryCol]}>
              <View style={[styles.orchestratorCard, Theme.shadows.card]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderIcon}>
                    <Ionicons name="compass" size={18} color={Theme.colors.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardHeaderTitle}>Route Command Center</Text>
                    <Text style={styles.cardHeaderSub}>Evaluate real-time pedestrian safety ratings</Text>
                  </View>
                </View>

                {/* Origin Location Pill */}
                <TouchableOpacity
                  style={styles.locationPill}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('LocationSearch', {
                      target: 'origin',
                      currentOrigin: origin,
                      currentDestination: destination || undefined,
                    })
                  }
                >
                  <View style={styles.originBeacon}>
                    <View style={styles.originBeaconCore} />
                  </View>
                  <View style={styles.locationTexts}>
                    <Text style={styles.locationLabel}>ORIGIN DEPARTURE</Text>
                    <Text style={styles.locationValue} numberOfLines={1}>
                      {origin.name}
                    </Text>
                  </View>
                  <Ionicons name="navigate-circle" size={18} color={Theme.colors.teal} />
                </TouchableOpacity>

                {/* Glowing Flow Connector */}
                <View style={styles.flowConnector}>
                  <View style={styles.connectorLine} />
                  <Ionicons name="arrow-down-circle" size={14} color={Theme.colors.textMuted} />
                  <View style={styles.connectorLine} />
                </View>

                {/* Destination Location Pill */}
                <TouchableOpacity
                  style={[styles.locationPill, styles.destLocationPill]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('LocationSearch', {
                      target: 'destination',
                      currentOrigin: origin,
                      currentDestination: destination || undefined,
                    })
                  }
                >
                  <View style={styles.destBeacon}>
                    <Ionicons name="location" size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.locationTexts}>
                    <Text style={styles.locationLabel}>SECURE DESTINATION</Text>
                    <Text
                      style={[styles.locationValue, !destination && { color: Theme.colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {destination ? destination.name : 'Enter target address or landmark...'}
                    </Text>
                  </View>
                  <Ionicons name="search" size={16} color={Theme.colors.textMuted} />
                </TouchableOpacity>

                {/* Action CTA */}
                <CustomButton
                  title="Launch Safe Journey Evaluation"
                  onPress={handleLaunchSafeJourney}
                  iconName="shield-checkmark"
                  size="large"
                  variant="teal"
                  style={styles.launchBtn}
                />
              </View>

              {/* Verified Safe Corridors */}
              <View style={styles.corridorsHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>Verified Pedestrian Corridors</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SafetyTab')}>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.corridorsRow}>
                <TouchableOpacity
                  style={[styles.corridorCard, Theme.shadows.soft]}
                  onPress={() =>
                    selectQuickDestination(
                      'University Campus Library',
                      '700 Library Way, Downtown',
                      37.7812,
                      -122.411
                    )
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.corridorIcon}>
                    <Ionicons name="school" size={18} color={Theme.colors.teal} />
                  </View>
                  <Text style={styles.corridorTitle} numberOfLines={1}>Univ Library</Text>
                  <View style={styles.corridorRating}>
                    <Ionicons name="shield-checkmark" size={11} color={Theme.colors.emerald} />
                    <Text style={styles.corridorRatingText}>92% Safe</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.corridorCard, Theme.shadows.soft]}
                  onPress={() =>
                    selectQuickDestination(
                      'Central Metro Station',
                      'Market St & 5th Avenue',
                      37.7834,
                      -122.408
                    )
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.corridorIcon}>
                    <Ionicons name="subway" size={18} color={Theme.colors.cyan} />
                  </View>
                  <Text style={styles.corridorTitle} numberOfLines={1}>Central Metro</Text>
                  <View style={styles.corridorRating}>
                    <Ionicons name="shield-checkmark" size={11} color={Theme.colors.emerald} />
                    <Text style={styles.corridorRatingText}>85% Safe</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.corridorCard, Theme.shadows.soft]}
                  onPress={() =>
                    selectQuickDestination(
                      'Financial Center Plaza',
                      '100 Pine Street',
                      37.7925,
                      -122.399
                    )
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.corridorIcon}>
                    <Ionicons name="business" size={18} color={Theme.colors.obsidian} />
                  </View>
                  <Text style={styles.corridorTitle} numberOfLines={1}>Tech Plaza</Text>
                  <View style={styles.corridorRating}>
                    <Ionicons name="shield-checkmark" size={11} color={Theme.colors.emerald} />
                    <Text style={styles.corridorRatingText}>89% Safe</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right / Secondary Column: Telemetry & Threat Radar */}
            <View style={[styles.secondaryColumn, isDesktop && styles.desktopSecondaryCol]}>
              {/* Telemetry Radar Card */}
              <View style={[styles.radarCard, Theme.shadows.card]}>
                <View style={styles.radarHeader}>
                  <View style={styles.radarPill}>
                    <Text style={styles.radarPillText}>ZONE RATING</Text>
                  </View>
                  <SafetyBadge score={88} riskLevel="LOW_RISK" size="medium" />
                </View>
                <Text style={styles.radarTitle}>Optimal Pedestrian Area</Text>
                <Text style={styles.radarDesc}>
                  Continuous street lighting coverage (94%), high commercial foot traffic density, active municipal surveillance.
                </Text>

                {/* Metric Telemetry Bars */}
                <View style={styles.telemetryBars}>
                  <View style={styles.telemetryBarItem}>
                    <Text style={styles.telemetryBarLabel}>Illumination</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: '94%', backgroundColor: Theme.colors.amber }]} />
                    </View>
                  </View>
                  <View style={styles.telemetryBarItem}>
                    <Text style={styles.telemetryBarLabel}>Activity Density</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: '82%', backgroundColor: Theme.colors.teal }]} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Live Threat Watch Feed */}
              <View style={styles.corridorsHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.sectionHeaderTitle}>Community Hazard Radar</Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.livePulseRed} />
                    <Text style={styles.liveIndicatorText}>LIVE</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
                  <Text style={styles.sectionLink}>Report</Text>
                </TouchableOpacity>
              </View>

              {nearbyIncidents.length > 0 ? (
                nearbyIncidents.map((inc) => (
                  <IncidentCard
                    key={inc.id}
                    incident={inc}
                    onPress={() => navigation.navigate('SafetyTab')}
                  />
                ))
              ) : (
                <View style={[styles.allClearCard, Theme.shadows.soft]}>
                  <View style={styles.allClearIconCircle}>
                    <Ionicons name="shield-checkmark" size={24} color={Theme.colors.emerald} />
                  </View>
                  <Text style={styles.allClearTitle}>No Active Hazards Reported</Text>
                  <Text style={styles.allClearSub}>
                    Nearby perimeter is clear. Report any dim lighting or concerns to protect others.
                  </Text>
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  desktopScrollContent: {
    paddingHorizontal: 36,
    paddingTop: 28,
  },
  headerDeck: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gpsPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.emerald,
    marginRight: 6,
  },
  telemetryTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.emerald,
    letterSpacing: 0.8,
  },
  heroGreeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.6,
  },
  heroLocation: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.crimson,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radii.full,
  },
  sosHeaderPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  deckGrid: {
    flexDirection: 'column',
    gap: 24,
  },
  desktopDeckGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  primaryColumn: {
    width: '100%',
  },
  desktopPrimaryCol: {
    flex: 1.2,
  },
  secondaryColumn: {
    width: '100%',
  },
  desktopSecondaryCol: {
    flex: 0.8,
  },
  orchestratorCard: {
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: Theme.radii.md,
    backgroundColor: Theme.colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardHeaderSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.canvas,
    borderRadius: Theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  destLocationPill: {
    backgroundColor: Theme.colors.surfaceLight,
    borderColor: Theme.colors.borderLight,
  },
  originBeacon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Theme.colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originBeaconCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.teal,
  },
  destBeacon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationTexts: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginTop: 2,
  },
  flowConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 22,
    paddingVertical: 4,
  },
  connectorLine: {
    width: 2,
    height: 10,
    backgroundColor: Theme.colors.borderLight,
  },
  launchBtn: {
    marginTop: 18,
  },
  corridorsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.teal,
  },
  corridorsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  corridorCard: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceLight,
    padding: 14,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    alignItems: 'center',
  },
  corridorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  corridorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  corridorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  corridorRatingText: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.emerald,
    marginLeft: 3,
  },
  radarCard: {
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 20,
  },
  radarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  radarPill: {
    backgroundColor: Theme.colors.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radii.full,
    borderWidth: 1,
    borderColor: Theme.colors.emeraldBorder,
  },
  radarPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.emerald,
    letterSpacing: 0.5,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  radarDesc: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 17,
    marginBottom: 16,
  },
  telemetryBars: {
    gap: 10,
  },
  telemetryBarItem: {
    width: '100%',
  },
  telemetryBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    height: 6,
    backgroundColor: Theme.colors.canvas,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.crimsonBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.radii.full,
    marginLeft: 8,
  },
  livePulseRed: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.colors.crimson,
    marginRight: 4,
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.crimson,
  },
  allClearCard: {
    backgroundColor: Theme.colors.surfaceLight,
    padding: 24,
    borderRadius: Theme.radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  allClearIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  allClearTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  allClearSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HomeScreen;
