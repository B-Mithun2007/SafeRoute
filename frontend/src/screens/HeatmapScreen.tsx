/**
 * HeatmapScreen (Safety Tab)
 * Visualizes urban safety risk zones with temporal filters (Morning, Afternoon, Evening, Night)
 * and interactive inspection cards for road segments.
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
import SafetyBadge from '../components/SafetyBadge';
import SafetyHeatmapLegend from '../maps/SafetyHeatmap';
import MapViewComponent from '../maps/MapViewComponent';
import SafetyService from '../services/safetyService';
import IncidentService from '../services/incidentService';
import { useLocation } from '../context/LocationContext';
import { HeatmapSegment, TimeOfDayFilter, IncidentReport } from '../types/incident';

export const HeatmapScreen = () => {
  const { currentLocation } = useLocation();
  const [timeFilter, setTimeFilter] = useState<TimeOfDayFilter>('night');
  const [segments, setSegments] = useState<HeatmapSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<HeatmapSegment | null>(null);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);

  const centerLat = currentLocation?.latitude || 37.7749;
  const centerLng = currentLocation?.longitude || -122.4194;

  useEffect(() => {
    loadHeatmapData();
  }, [timeFilter, centerLat, centerLng]);

  const loadHeatmapData = async () => {
    try {
      const [segs, incs] = await Promise.all([
        SafetyService.getHeatmapSegments(centerLat, centerLng, timeFilter),
        IncidentService.getNearbyIncidents(centerLat, centerLng),
      ]);
      setSegments(segs);
      setIncidents(incs);
      if (segs.length > 0) {
        setSelectedSegment(segs[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch heatmap data:', err);
    }
  };

  const timeOptions: { key: TimeOfDayFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All Hours', icon: 'time-outline' },
    { key: 'morning', label: 'Morning', icon: 'sunny-outline' },
    { key: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline' },
    { key: 'evening', label: 'Evening', icon: 'cloudy-night-outline' },
    { key: 'night', label: 'Night (High Risk)', icon: 'moon-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Urban Safety Heatmap"
        subtitle="Dynamic risk indices across time of day"
      />

      {/* Time Filter Pill Selector */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {timeOptions.map((opt) => {
            const isActive = timeFilter === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setTimeFilter(opt.key)}
                style={[styles.filterPill, isActive && styles.activeFilterPill]}
              >
                <Ionicons
                  name={opt.icon}
                  size={14}
                  color={isActive ? Colors.white : Colors.gray600}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.filterPillText, isActive && styles.activeFilterPillText]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Heatmap Map Canvas Preview */}
        <View style={styles.mapCard}>
          <MapViewComponent
            initialRegion={{
              latitude: centerLat,
              longitude: centerLng,
            }}
            incidents={incidents}
            style={styles.mapCanvas}
            showZoomControls={false}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendWrapper}>
          <SafetyHeatmapLegend showDisclaimer />
        </View>

        {/* Selected Road Segment Details */}
        {selectedSegment && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailTitle}>{selectedSegment.title}</Text>
                <Text style={styles.detailSub}>Selected Corridor Risk Breakdown</Text>
              </View>
              <SafetyBadge
                score={selectedSegment.safetyScore}
                riskLevel={selectedSegment.riskLevel}
                size="large"
              />
            </View>

            <Text style={styles.detailDescription}>{selectedSegment.description}</Text>

            {/* Metrics Breakdown Grid */}
            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Ionicons name="sunny-outline" size={18} color={Colors.safetyYellow} />
                <Text style={styles.metricVal}>
                  {Math.round(selectedSegment.lightingRating * 100)}%
                </Text>
                <Text style={styles.metricLabel}>Street Lighting</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Ionicons name="people-outline" size={18} color={Colors.primary} />
                <Text style={styles.metricVal}>
                  {Math.round(selectedSegment.crowdDensity * 100)}%
                </Text>
                <Text style={styles.metricLabel}>Foot Activity</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={selectedSegment.recentIncidentsCount > 0 ? Colors.safetyRed : Colors.safetyGreen}
                />
                <Text style={styles.metricVal}>{selectedSegment.recentIncidentsCount}</Text>
                <Text style={styles.metricLabel}>Recent Alerts</Text>
              </View>
            </View>
          </View>
        )}

        {/* List of Corridors */}
        <Text style={styles.sectionTitle}>Key Evaluated Corridors</Text>
        {segments.map((seg) => (
          <TouchableOpacity
            key={seg.id}
            onPress={() => setSelectedSegment(seg)}
            style={[
              styles.segmentItem,
              selectedSegment?.id === seg.id && styles.activeSegmentItem,
            ]}
          >
            <View
              style={[
                styles.segmentDot,
                {
                  backgroundColor:
                    seg.riskLevel === 'LOW_RISK'
                      ? Colors.safetyGreen
                      : seg.riskLevel === 'MODERATE_RISK'
                      ? Colors.safetyYellow
                      : Colors.safetyRed,
                },
              ]}
            />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.segmentName}>{seg.title}</Text>
              <Text style={styles.segmentDesc} numberOfLines={1}>
                {seg.description}
              </Text>
            </View>
            <SafetyBadge score={seg.safetyScore} riskLevel={seg.riskLevel} size="small" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  filterSection: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
  },
  activeFilterPill: {
    backgroundColor: Colors.primaryDark,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
  },
  activeFilterPillText: {
    color: Colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mapCanvas: {
    height: 220,
  },
  legendWrapper: {
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.accentLight,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray900,
  },
  detailSub: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  detailDescription: {
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 18,
    marginBottom: 14,
  },
  metricGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray900,
    marginTop: 3,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.gray500,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gray900,
    marginBottom: 10,
    marginTop: 4,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  activeSegmentItem: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF5FF',
  },
  segmentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  segmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray900,
  },
  segmentDesc: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 1,
  },
});

export default HeatmapScreen;
