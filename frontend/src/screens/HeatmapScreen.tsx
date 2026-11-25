/**
 * HeatmapScreen (Urban Threat Heatmap & Corridor Telemetry)
 * Transformed into an executive telemetry dashboard:
 * - Ambient atmospheric backdrop & centered responsive layout
 * - Luminescent time-of-day temporal risk strip
 * - High-contrast embedded spatial risk corridor preview
 * - Corridor breakdown deck with lighting & pedestrian density progress tracks
 * - Evaluated pedestrian corridor cards with live status badges
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import AtmosphericBackground from '../components/AtmosphericBackground';
import Header from '../components/Header';
import SafetyBadge from '../components/SafetyBadge';
import SafetyHeatmapLegend from '../maps/SafetyHeatmap';
import MapViewComponent from '../maps/MapViewComponent';
import SafetyService from '../services/safetyService';
import IncidentService from '../services/incidentService';
import { useLocation } from '../context/LocationContext';
import { HeatmapSegment, TimeOfDayFilter, IncidentReport } from '../types/incident';

export const HeatmapScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

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
    { key: 'morning', label: 'Morning Peak', icon: 'sunny-outline' },
    { key: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline' },
    { key: 'evening', label: 'Evening Commute', icon: 'cloudy-night-outline' },
    { key: 'night', label: 'Night (High Risk)', icon: 'moon-outline' },
  ];

  return (
    <AtmosphericBackground variant="canvas">
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Threat Radar & Heatmap"
          subtitle="Dynamic temporal risk variances across metropolitan corridors"
        />

        {/* Temporal Risk Pill Strip */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filterRow, isDesktop && styles.desktopFilterRow]}
          >
            {timeOptions.map((opt) => {
              const isActive = timeFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setTimeFilter(opt.key)}
                  style={[styles.filterPill, isActive && styles.activeFilterPill]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={14}
                    color={isActive ? '#FFFFFF' : Theme.colors.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.filterPillText, isActive && styles.activeFilterPillText]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}>
          <View style={[styles.deckGrid, isDesktop && styles.desktopDeckGrid]}>

            {/* Left Column: Spatial Heatmap Canvas */}
            <View style={[styles.leftColumn, isDesktop && styles.desktopLeftCol]}>
              <View style={[styles.mapCard, Theme.shadows.card]}>
                <View style={styles.mapHeaderRow}>
                  <View style={styles.radarLiveBadge}>
                    <View style={styles.livePulse} />
                    <Text style={styles.radarLiveText}>LIVE SPATIAL HEATMAP</Text>
                  </View>
                  <Text style={styles.corridorCountText}>{segments.length} Evaluated Zones</Text>
                </View>

                <MapViewComponent
                  initialRegion={{
                    latitude: centerLat,
                    longitude: centerLng,
                  }}
                  origin={currentLocation}
                  incidents={incidents}
                  heatmapSegments={segments}
                  selectedSegmentId={selectedSegment?.id}
                  onSelectSegment={(seg) => setSelectedSegment(seg)}
                  style={styles.mapCanvas}
                  showZoomControls={true}
                />
              </View>

              <View style={styles.legendContainer}>
                <SafetyHeatmapLegend showDisclaimer />
              </View>
            </View>

            {/* Right Column: Corridor Telemetry & Evaluations */}
            <View style={[styles.rightColumn, isDesktop && styles.desktopRightCol]}>
              {selectedSegment && (
                <View style={[styles.detailCard, Theme.shadows.card]}>
                  <View style={styles.detailHeader}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.detailZoneTag}>SELECTED CORRIDOR</Text>
                      <Text style={styles.detailTitle}>{selectedSegment.title}</Text>
                    </View>
                    <SafetyBadge
                      score={selectedSegment.safetyScore}
                      riskLevel={selectedSegment.riskLevel}
                      size="large"
                    />
                  </View>

                  <Text style={styles.detailDescription}>{selectedSegment.description}</Text>

                  {/* Telemetry Indicator Bars */}
                  <View style={styles.metricGrid}>
                    <View style={styles.metricItem}>
                      <View style={styles.metricHeaderRow}>
                        <Ionicons name="sunny" size={14} color={Theme.colors.amber} />
                        <Text style={styles.metricLabel}>Illumination</Text>
                        <Text style={styles.metricVal}>
                          {Math.round(selectedSegment.lightingRating * 100)}%
                        </Text>
                      </View>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${Math.round(selectedSegment.lightingRating * 100)}%`,
                              backgroundColor: Theme.colors.amber,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.metricItem}>
                      <View style={styles.metricHeaderRow}>
                        <Ionicons name="people" size={14} color={Theme.colors.teal} />
                        <Text style={styles.metricLabel}>Activity</Text>
                        <Text style={styles.metricVal}>
                          {Math.round(selectedSegment.crowdDensity * 100)}%
                        </Text>
                      </View>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${Math.round(selectedSegment.crowdDensity * 100)}%`,
                              backgroundColor: Theme.colors.teal,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* City Corridors List */}
              <View style={styles.corridorsHeaderRow}>
                <Text style={styles.corridorsHeaderTitle}>Monitored Pedestrian Corridors</Text>
                <Text style={styles.corridorsSubtitle}>Tap to inspect safety factors</Text>
              </View>

              {segments.map((seg) => (
                <TouchableOpacity
                  key={seg.id}
                  onPress={() => setSelectedSegment(seg)}
                  style={[
                    styles.segmentCard,
                    Theme.shadows.soft,
                    selectedSegment?.id === seg.id && styles.activeSegmentCard,
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.segmentDot,
                      {
                        backgroundColor:
                          seg.riskLevel === 'LOW_RISK'
                            ? Theme.colors.emerald
                            : seg.riskLevel === 'MODERATE_RISK'
                            ? Theme.colors.amber
                            : Theme.colors.crimson,
                      },
                    ]}
                  />
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={styles.segmentName}>{seg.title}</Text>
                    <Text style={styles.segmentDesc} numberOfLines={1}>
                      {seg.description}
                    </Text>
                  </View>
                  <SafetyBadge score={seg.safetyScore} riskLevel={seg.riskLevel} size="small" />
                </TouchableOpacity>
              ))}
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
  filterSection: {
    backgroundColor: Theme.colors.surfaceLight,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  desktopFilterRow: {
    paddingHorizontal: 36,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Theme.radii.full,
    backgroundColor: Theme.colors.canvas,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  activeFilterPill: {
    backgroundColor: Theme.colors.obsidian,
    borderColor: Theme.colors.obsidian,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  activeFilterPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  desktopScrollContent: {
    paddingHorizontal: 36,
    paddingTop: 24,
  },
  deckGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  desktopDeckGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.1,
  },
  rightColumn: {
    width: '100%',
  },
  desktopRightCol: {
    flex: 0.9,
  },
  mapCard: {
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 16,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  radarLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.teal,
    marginRight: 6,
  },
  radarLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.teal,
    letterSpacing: 0.8,
  },
  corridorCountText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  mapCanvas: {
    height: 280,
    borderRadius: Theme.radii.lg,
    overflow: 'hidden',
  },
  legendContainer: {
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailZoneTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginTop: 2,
  },
  detailDescription: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  metricGrid: {
    gap: 12,
  },
  metricItem: {
    width: '100%',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.canvas,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  corridorsHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  corridorsHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  corridorsSubtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  segmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.radii.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  activeSegmentCard: {
    borderColor: Theme.colors.teal,
    backgroundColor: '#FAFDFD',
  },
  segmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  segmentDesc: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
});

export default HeatmapScreen;
