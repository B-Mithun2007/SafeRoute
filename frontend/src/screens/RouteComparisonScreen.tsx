/**
 * RouteComparisonScreen
 * Displays alternative routes ranked by safety vs. travel duration.
 * Users can compare lighting, incident density, distance, and choose their preferred path.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import RouteCard from '../components/RouteCard';
import CustomButton from '../components/CustomButton';
import LoadingIndicator from '../components/LoadingIndicator';
import RouteService from '../services/routeService';
import MapViewComponent from '../maps/MapViewComponent';
import { RouteOption, LocationPoint } from '../types/route';

export const RouteComparisonScreen = ({ route, navigation }: any) => {
  const { origin, destination } = route.params as {
    origin: LocationPoint;
    destination: LocationPoint;
  };

  const [routesList, setRoutesList] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  useEffect(() => {
    fetchEvaluatedRoutes();
  }, [origin, destination]);

  const fetchEvaluatedRoutes = async () => {
    setIsLoading(true);
    try {
      const result = await RouteService.evaluateRoutes({
        origin: origin.coordinates,
        destination: destination.coordinates,
        travelMode: 'walking',
      });
      setRoutesList(result.routes);
      setIsMockData(result.isMock);
      if (result.routes.length > 0) {
        setSelectedRouteId(result.routes[0].id);
      }
    } catch (err) {
      console.warn('Failed to load routes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoute = routesList.find((r) => r.id === selectedRouteId) || routesList[0];

  const handleStartNavigation = () => {
    navigation.navigate('MapDetail', {
      selectedRoute,
      origin,
      destination,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Compare Routes"
        subtitle={`${origin.name.split(',')[0]} → ${destination.name.split(',')[0]}`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <LoadingIndicator message="Evaluating street lighting and incident density..." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Mini Interactive Route Map Preview */}
          <View style={styles.mapContainer}>
            <MapViewComponent
              origin={origin.coordinates}
              destination={destination.coordinates}
              routes={routesList}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              style={styles.mapStyle}
              showZoomControls={false}
            />
          </View>

          {/* Development / Mock Transparency Pill */}
          {isMockData && (
            <View style={styles.mockNoticeBar}>
              <Ionicons name="information-circle" size={16} color={Colors.info} />
              <Text style={styles.mockNoticeText}>
                Showing development sample routes. Backend live routing will replace these automatically when active.
              </Text>
            </View>
          )}

          {/* Quick Route Count Banner */}
          <View style={styles.summaryBar}>
            <Text style={styles.summaryTitle}>
              {routesList.length} Safe Travel Options Found
            </Text>
            <Text style={styles.summarySub}>
              Tap any route to view details and select
            </Text>
          </View>

          {/* List of Route Cards */}
          {routesList.map((routeItem) => (
            <RouteCard
              key={routeItem.id}
              route={routeItem}
              isSelected={routeItem.id === selectedRouteId}
              onSelect={() => setSelectedRouteId(routeItem.id)}
            />
          ))}

          {/* Floating / Sticky Start Navigation Button */}
          {selectedRoute && (
            <View style={styles.actionCard}>
              <View style={styles.actionInfoRow}>
                <View>
                  <Text style={styles.actionRouteName}>{selectedRoute.name}</Text>
                  <Text style={styles.actionRouteSub}>
                    {Math.round(selectedRoute.durationSeconds / 60)} min • {(selectedRoute.distanceMeters / 1000).toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.safetyScorePill}>
                  <Text style={styles.safetyScoreVal}>{selectedRoute.safetyScore}</Text>
                  <Text style={styles.safetyScoreMax}>/100</Text>
                </View>
              </View>

              <CustomButton
                title="Start Guided Safe Navigation"
                onPress={handleStartNavigation}
                iconName="navigate"
                size="large"
                style={styles.navigateButton}
              />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  mapContainer: {
    marginBottom: 12,
  },
  mapStyle: {
    height: 200,
  },
  mockNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mockNoticeText: {
    fontSize: 11,
    color: '#1E40AF',
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
  },
  summaryBar: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray900,
  },
  summarySub: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: Colors.accentLight,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  actionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionRouteName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gray900,
  },
  actionRouteSub: {
    fontSize: 13,
    color: Colors.gray600,
    marginTop: 2,
  },
  safetyScorePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.safetyGreenBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.safetyGreenBorder,
  },
  safetyScoreVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.safetyGreen,
  },
  safetyScoreMax: {
    fontSize: 11,
    color: Colors.safetyGreen,
  },
  navigateButton: {
    width: '100%',
  },
});

export default RouteComparisonScreen;
