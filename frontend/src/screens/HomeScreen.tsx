/**
 * HomeScreen
 * Central dashboard with location search inputs, SOS quick trigger, recent destinations,
 * nearby safety incident highlights, and personal safety tips.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import SafetyBadge from '../components/SafetyBadge';
import CustomButton from '../components/CustomButton';
import IncidentService from '../services/incidentService';
import IncidentCard from '../components/IncidentCard';
import { IncidentReport } from '../types/incident';
import { LocationPoint } from '../types/route';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { currentLocation, currentAddress, refreshLocation, isLoadingLocation } = useLocation();

  const [origin, setOrigin] = useState<LocationPoint>({
    name: 'Current Location',
    address: currentAddress || 'Your Current GPS Position',
    coordinates: currentLocation || { latitude: 37.7749, longitude: -122.4194 },
  });

  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [nearbyIncidents, setNearbyIncidents] = useState<IncidentReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      setOrigin({
        name: 'Current Location',
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

  const handleFindSaferRoute = () => {
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

  const selectRecentDestination = (name: string, address: string, lat: number, lng: number) => {
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Top Header & Profile Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Hello, {user?.name?.split(' ')[0] || 'Traveler'} 👋</Text>
            <View style={styles.locationSubRow}>
              <Ionicons name="location-sharp" size={14} color={Colors.primary} />
              <Text style={styles.locationSubText} numberOfLines={1}>
                {currentAddress || 'Locating GPS...'}
              </Text>
            </View>
          </View>

          {/* SOS Quick Button in Header */}
          <TouchableOpacity
            style={styles.sosQuickBadge}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SOS')}
          >
            <Ionicons name="alert" size={16} color={Colors.white} />
            <Text style={styles.sosQuickText}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Live Safety Status Banner */}
        <View style={styles.safetyStatusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusTitle}>Current Zone Rating</Text>
            <Text style={styles.statusSubtitle}>Well-monitored arterial street with high foot traffic</Text>
          </View>
          <SafetyBadge score={88} riskLevel="LOW_RISK" size="large" />
        </View>

        {/* Route Planner Card */}
        <View style={styles.plannerCard}>
          <Text style={styles.plannerTitle}>Where are you heading?</Text>

          {/* Origin Field */}
          <TouchableOpacity
            style={styles.inputBox}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('LocationSearch', {
                target: 'origin',
                currentOrigin: origin,
                currentDestination: destination || undefined,
              })
            }
          >
            <View style={styles.originIconCircle}>
              <View style={styles.originInnerDot} />
            </View>
            <View style={styles.inputTexts}>
              <Text style={styles.inputLabel}>Starting Location</Text>
              <Text style={styles.inputVal} numberOfLines={1}>
                {origin.name}
              </Text>
            </View>
            <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>

          {/* Vertical Connecting Dots */}
          <View style={styles.connectDotsRow}>
            <View style={styles.connectingDot} />
            <View style={styles.connectingDot} />
          </View>

          {/* Destination Field */}
          <TouchableOpacity
            style={[styles.inputBox, styles.destInputBox]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('LocationSearch', {
                target: 'destination',
                currentOrigin: origin,
                currentDestination: destination || undefined,
              })
            }
          >
            <Ionicons name="location" size={20} color={Colors.sosRed} style={{ marginRight: 10 }} />
            <View style={styles.inputTexts}>
              <Text style={styles.inputLabel}>Destination</Text>
              <Text
                style={[styles.inputVal, !destination && { color: Colors.gray400 }]}
                numberOfLines={1}
              >
                {destination ? destination.name : 'Enter safe destination'}
              </Text>
            </View>
            <Ionicons name="search" size={18} color={Colors.gray400} />
          </TouchableOpacity>

          <CustomButton
            title="Find Safer Route"
            onPress={handleFindSaferRoute}
            iconName="shield-checkmark"
            size="large"
            style={styles.findButton}
          />
        </View>

        {/* Quick Travel Shortcuts / Recent Destinations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Safe Destinations</Text>
        </View>

        <View style={styles.recentCardsRow}>
          <TouchableOpacity
            style={styles.recentCard}
            onPress={() =>
              selectRecentDestination(
                'University Campus Library',
                '700 Library Way, Downtown',
                37.7812,
                -122.411
              )
            }
          >
            <View style={styles.recentIconBox}>
              <Ionicons name="school-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.recentTitle}>University Library</Text>
            <Text style={styles.recentScore}>Safety 92/100</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recentCard}
            onPress={() =>
              selectRecentDestination(
                'Central Metro Station',
                'Market St & 5th Avenue',
                37.7834,
                -122.408
              )
            }
          >
            <View style={styles.recentIconBox}>
              <Ionicons name="train-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.recentTitle}>Metro Station</Text>
            <Text style={styles.recentScore}>Safety 85/100</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recentCard}
            onPress={() =>
              selectRecentDestination(
                'Financial Center Plaza',
                '100 Pine Street',
                37.7925,
                -122.399
              )
            }
          >
            <View style={styles.recentIconBox}>
              <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.recentTitle}>Tech Office Park</Text>
            <Text style={styles.recentScore}>Safety 89/100</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Incident Reports Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Community Safety Watch</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
            <Text style={styles.seeAllText}>View All</Text>
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
          <View style={styles.emptyIncidentsCard}>
            <Ionicons name="shield-checkmark-outline" size={28} color={Colors.safetyGreen} />
            <Text style={styles.emptyIncidentsText}>
              No critical safety hazards reported nearby in the past 24 hours.
            </Text>
          </View>
        )}

        {/* Daily Safety Advisory Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconCircle}>
            <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.tipTexts}>
            <Text style={styles.tipHeader}>Nighttime Travel Advisory</Text>
            <Text style={styles.tipBody}>
              When walking after 9 PM, enable "Prefer Well-Lit Roads" in your travel preferences to stay on monitored pedestrian corridors.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gray900,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationSubText: {
    fontSize: 12,
    color: Colors.gray600,
    marginLeft: 4,
    maxWidth: 220,
  },
  sosQuickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sosRed,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.sosRed,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sosQuickText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 4,
  },
  safetyStatusCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusLeft: {
    flex: 1,
    marginRight: 10,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
  },
  statusSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
    lineHeight: 16,
  },
  plannerCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  plannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  destInputBox: {
    borderColor: Colors.accentLight,
    backgroundColor: '#FAF5FF',
  },
  originIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  originInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  inputTexts: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  inputVal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
    marginTop: 1,
  },
  connectDotsRow: {
    paddingLeft: 20,
    paddingVertical: 4,
  },
  connectingDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.gray300,
    marginVertical: 2,
  },
  findButton: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray900,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safetyRedBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safetyRed,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.safetyRed,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  recentCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  recentCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
  },
  recentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray900,
    textAlign: 'center',
  },
  recentScore: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.safetyGreen,
    marginTop: 4,
  },
  emptyIncidentsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 16,
  },
  emptyIncidentsText: {
    fontSize: 13,
    color: Colors.gray600,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginTop: 6,
  },
  tipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipTexts: {
    flex: 1,
  },
  tipHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  tipBody: {
    fontSize: 12,
    color: Colors.gray700,
    lineHeight: 16,
  },
});

export default HomeScreen;
