/**
 * MapViewComponent
 * Universal cross-platform map renderer.
 * On Web: Renders an interactive, high-performance OpenStreetMap Leaflet canvas
 * with real tile loading, live GPS user marker with animated pulse, destination flag,
 * incident markers, route polylines, and smooth pan/zoom controls.
 * On Native: Gracefully falls back to cross-platform spatial canvas or react-native-maps.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Coordinates, RouteOption } from '../types/route';
import { IncidentReport, HeatmapSegment } from '../types/incident';

interface MapViewComponentProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  origin?: Coordinates | null;
  destination?: Coordinates | null;
  routes?: RouteOption[];
  selectedRouteId?: string;
  incidents?: IncidentReport[];
  heatmapSegments?: HeatmapSegment[];
  selectedSegmentId?: string;
  onSelectCoordinate?: (coords: Coordinates) => void;
  onSelectRoute?: (routeId: string) => void;
  onSelectIncident?: (incident: IncidentReport) => void;
  onSelectSegment?: (segment: HeatmapSegment) => void;
  style?: ViewStyle;
  showZoomControls?: boolean;
  isLoading?: boolean;
  errorMsg?: string | null;
  onRetryLocation?: () => void;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  initialRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  },
  origin,
  destination,
  routes = [],
  selectedRouteId,
  incidents = [],
  heatmapSegments = [],
  selectedSegmentId,
  onSelectCoordinate,
  onSelectRoute,
  onSelectIncident,
  onSelectSegment,
  style,
  showZoomControls = true,
  isLoading = false,
  errorMsg,
  onRetryLocation,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const iframeRef = useRef<any>(null);

  // Set up message listener for web iframe events (e.g. incident clicks, segment clicks)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleWindowMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'SAFEROUTE_INCIDENT_CLICK') {
          const matched = incidents.find((inc) => inc.id === data.id);
          if (matched && onSelectIncident) {
            onSelectIncident(matched);
          }
        } else if (data.type === 'SAFEROUTE_SEGMENT_CLICK') {
          const matched = heatmapSegments.find((seg) => seg.id === data.id);
          if (matched && onSelectSegment) {
            onSelectSegment(matched);
          }
        }
      } catch (err) {
        // Ignore non-json cross-frame messages
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [incidents, heatmapSegments, onSelectIncident, onSelectSegment]);

  // Determine center coordinates
  const centerLat = origin?.latitude || initialRegion.latitude;
  const centerLng = origin?.longitude || initialRegion.longitude;

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Generate self-contained Leaflet HTML for web embedding
  const leafletHtml = useMemo(() => {
    const originJson = origin ? JSON.stringify(origin) : 'null';
    const destinationJson = destination ? JSON.stringify(destination) : 'null';
    const incidentsJson = JSON.stringify(
      incidents.map((inc) => ({
        id: inc.id,
        latitude: inc.latitude,
        longitude: inc.longitude,
        category: inc.category,
        categoryLabel: inc.categoryLabel || inc.category,
        severity: inc.severity,
        description: inc.description,
        locationName: inc.locationName,
        reportedAt: inc.reportedAt,
      }))
    );
    const heatmapSegmentsJson = JSON.stringify(
      heatmapSegments.map((seg) => ({
        id: seg.id,
        title: seg.title,
        riskLevel: seg.riskLevel,
        safetyScore: seg.safetyScore,
        description: seg.description,
        lightingRating: seg.lightingRating,
        crowdDensity: seg.crowdDensity,
        recentIncidentsCount: seg.recentIncidentsCount,
        coordinates: seg.coordinates || [],
        isSelected: seg.id === selectedSegmentId,
      }))
    );
    const routesJson = JSON.stringify(
      routes.map((r) => ({
        id: r.id,
        name: r.name,
        safetyScore: r.safetyScore,
        riskLevel: r.riskLevel,
        coordinates: r.coordinates || [],
        isSelected: r.id === (selectedRouteId || routes[0]?.id),
      }))
    );

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #f0f3f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    /* Pulse user location marker */
    .user-marker-container {
      position: relative;
      width: 24px;
      height: 24px;
    }
    .user-marker-pulse {
      position: absolute;
      width: 32px;
      height: 32px;
      left: -4px;
      top: -4px;
      border-radius: 50%;
      background: rgba(121, 40, 202, 0.3);
      animation: pulse 2s infinite ease-out;
    }
    .user-marker-core {
      position: absolute;
      width: 20px;
      height: 20px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #7928CA;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    /* Incident marker pins */
    .incident-pin {
      width: 26px;
      height: 26px;
      border-radius: 13px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: bold;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .incident-high { background: #EF4444; }
    .incident-medium { background: #F59E0B; }
    .incident-low { background: #3B82F6; }
    /* Destination pin */
    .dest-pin {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: #DC2626;
      border: 3px solid #ffffff;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    }
    /* Leaflet popup styling */
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 4px;
      box-shadow: 0 4px 12px rgba(26, 11, 46, 0.15);
      border: 1px solid #E5E7EB;
    }
    .popup-title {
      font-weight: 700;
      color: #111827;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .popup-desc {
      color: #4B5563;
      font-size: 11px;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${centerLat}, ${centerLng}], ${zoomLevel});

    // OpenStreetMap CartoDB Positron / OSM Standard Tile Layer (Clean & Safe Navigation style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      fallback: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    }).addTo(map);

    var originData = ${originJson};
    var destData = ${destinationJson};
    var incidentsData = ${incidentsJson};
    var heatmapSegmentsData = ${heatmapSegmentsJson};
    var routesData = ${routesJson};

    // User Location Marker
    if (originData && originData.latitude && originData.longitude) {
      var userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: '<div class="user-marker-container"><div class="user-marker-pulse"></div><div class="user-marker-core"></div></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([originData.latitude, originData.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="popup-title">Current Location</div><div class="popup-desc">GPS position tracked securely</div>');
    }

    // Destination Marker
    if (destData && destData.latitude && destData.longitude) {
      var destIcon = L.divIcon({
        className: 'custom-dest-icon',
        html: '<div class="dest-pin">★</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([destData.latitude, destData.longitude], { icon: destIcon })
        .addTo(map)
        .bindPopup('<div class="popup-title">Destination</div><div class="popup-desc">' + (destData.name || 'Selected Target Point') + '</div>');
    }

    // Heatmap Risk Corridors & Safety Zones
    if (heatmapSegmentsData && heatmapSegmentsData.length > 0) {
      heatmapSegmentsData.forEach(function(seg) {
        if (!seg.coordinates || seg.coordinates.length < 2) return;
        var latlngs = seg.coordinates.map(function(c) { return [c.latitude, c.longitude]; });
        var color = seg.riskLevel === 'LOW_RISK' ? '#10B981' : seg.riskLevel === 'MODERATE_RISK' ? '#F59E0B' : '#EF4444';
        var fillColor = color;
        var weight = seg.isSelected ? 8 : 5;
        var opacity = seg.isSelected ? 0.95 : 0.75;

        // Draw luminous safety corridor polyline
        var line = L.polyline(latlngs, {
          color: color,
          weight: weight,
          opacity: opacity,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: seg.riskLevel === 'HIGH_RISK' ? '8, 8' : undefined
        }).addTo(map);

        // Draw translucent safety heat halo around the segment
        var halo = L.polyline(latlngs, {
          color: color,
          weight: weight + 10,
          opacity: 0.22,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        var popupContent = '<div class="popup-title" style="color:' + color + ';">' + seg.title + '</div>' +
          '<div style="font-size:12px; font-weight:700; margin:2px 0;">Safety Score: ' + seg.safetyScore + '/100 (' + seg.riskLevel.replace('_', ' ') + ')</div>' +
          '<div class="popup-desc">' + seg.description + '</div>' +
          '<div style="font-size:10px; color:#6B7280; margin-top:4px;">Lighting: ' + Math.round(seg.lightingRating * 100) + '% • Incidents: ' + seg.recentIncidentsCount + '</div>';

        line.bindPopup(popupContent);

        line.on('click', function() {
          window.parent.postMessage({ type: 'SAFEROUTE_SEGMENT_CLICK', id: seg.id }, '*');
        });
        halo.on('click', function() {
          window.parent.postMessage({ type: 'SAFEROUTE_SEGMENT_CLICK', id: seg.id }, '*');
        });
      });
    }

    // Incident Markers with Interactive Callouts
    if (incidentsData && incidentsData.length > 0) {
      incidentsData.forEach(function(inc) {
        if (!inc.latitude || !inc.longitude) return;
        var severityClass = inc.severity === 'high' ? 'incident-high' : inc.severity === 'medium' ? 'incident-medium' : 'incident-low';
        var iconHtml = '<div class="incident-pin ' + severityClass + '">!</div>';
        var pinIcon = L.divIcon({
          className: 'custom-incident-icon',
          html: iconHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        var marker = L.marker([inc.latitude, inc.longitude], { icon: pinIcon }).addTo(map);

        var timeString = inc.reportedAt ? new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
        var popupHtml = '<div class="popup-title" style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span>' + (inc.categoryLabel || inc.category || 'Hazard Alert') + '</span>' +
          '<span style="font-size:9px; font-weight:normal; background:#F3F4F6; padding:2px 5px; border-radius:4px; text-transform:uppercase;">' + (inc.severity || 'alert') + '</span>' +
          '</div>' +
          '<div class="popup-desc" style="margin: 4px 0 6px 0;">' + inc.description + '</div>' +
          (inc.locationName ? '<div style="font-size:10px; color:#4B5563;"><strong>Loc:</strong> ' + inc.locationName + '</div>' : '') +
          '<div style="font-size:9px; color:#9CA3AF; margin-top:3px;">Reported: ' + timeString + '</div>';

        marker.bindPopup(popupHtml);

        marker.on('click', function() {
          window.parent.postMessage({ type: 'SAFEROUTE_INCIDENT_CLICK', id: inc.id }, '*');
        });
      });
    }

    // Route Polylines
    if (routesData && routesData.length > 0) {
      routesData.forEach(function(r) {
        if (!r.coordinates || r.coordinates.length < 2) return;
        var latlngs = r.coordinates.map(function(c) { return [c.latitude, c.longitude]; });
        var color = r.riskLevel === 'LOW_RISK' ? '#10B981' : r.riskLevel === 'MODERATE_RISK' ? '#F59E0B' : '#EF4444';
        var weight = r.isSelected ? 5 : 3;
        var opacity = r.isSelected ? 0.9 : 0.5;

        L.polyline(latlngs, {
          color: color,
          weight: weight,
          opacity: opacity,
          lineJoin: 'round'
        }).addTo(map);
      });
    }

    // Global listener for parent postMessage commands (zoom, recenter)
    window.addEventListener('message', function(event) {
      var data = event.data;
      if (!data) return;
      if (data.action === 'zoomIn') {
        map.zoomIn();
      } else if (data.action === 'zoomOut') {
        map.zoomOut();
      } else if (data.action === 'recenter' && data.lat && data.lng) {
        map.flyTo([data.lat, data.lng], 15, { animate: true, duration: 1.2 });
      }
    });
  </script>
</body>
</html>`;
  }, [centerLat, centerLng, zoomLevel, origin, destination, incidents, heatmapSegments, selectedSegmentId, routes, selectedRouteId]);

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(z + 1, 19));
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'zoomIn' }, '*');
    }
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(z - 1, 5));
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'zoomOut' }, '*');
    }
  };

  const handleRecenter = () => {
    if (origin) {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { action: 'recenter', lat: origin.latitude, lng: origin.longitude },
          '*'
        );
      }
      if (onSelectCoordinate) {
        onSelectCoordinate(origin);
      }
    } else if (onRetryLocation) {
      onRetryLocation();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Web Interactive Map Canvas via Leaflet OpenStreetMap */}
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={leafletHtml}
          title="SafeRoute Interactive Map"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      ) : (
        /* Fallback representation for native mobile when react-native-maps is building */
        <View style={styles.nativeFallbackContainer}>
          <Ionicons name="map-outline" size={48} color={Colors.primary} />
          <Text style={styles.nativeFallbackTitle}>SafeRoute Native Spatial Map</Text>
          <Text style={styles.nativeFallbackSub}>
            Coordinates: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Acquiring GPS position...</Text>
        </View>
      )}

      {/* Permission / GPS Error Banner */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={Colors.safetyRed} style={{ marginRight: 6 }} />
          <Text style={styles.errorBannerText} numberOfLines={2}>
            {errorMsg}
          </Text>
          {onRetryLocation && (
            <TouchableOpacity onPress={onRetryLocation} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Floating Zoom Controls (+ / -) */}
      {showZoomControls && (
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            activeOpacity={0.7}
            accessibilityLabel="Zoom In"
          >
            <Ionicons name="add" size={20} color={Colors.gray800} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            activeOpacity={0.7}
            accessibilityLabel="Zoom Out"
          >
            <Ionicons name="remove" size={20} color={Colors.gray800} />
          </TouchableOpacity>
        </View>
      )}

      {/* Recenter GPS Button */}
      <TouchableOpacity
        style={[
          styles.recenterButton,
          !origin && { borderColor: Colors.safetyRedBorder, backgroundColor: Colors.safetyRedBg },
        ]}
        onPress={handleRecenter}
        activeOpacity={0.7}
        accessibilityLabel="Recenter on current location"
      >
        <Ionicons
          name="locate"
          size={20}
          color={origin ? Colors.primary : Colors.safetyRed}
        />
      </TouchableOpacity>

      {/* Map Attribution and Mode Footer Pill */}
      <View style={styles.mapAttribution}>
        <Ionicons name="shield-checkmark" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
        <Text style={styles.attributionText}>OpenStreetMap • SafeRoute Spatial</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 360,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E8ECF2',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  nativeFallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  nativeFallbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
    marginTop: 8,
  },
  nativeFallbackSub: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  errorBanner: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safetyRedBg,
    borderColor: Colors.safetyRedBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.safetyRed,
    fontWeight: '600',
  },
  retryBtn: {
    marginLeft: 8,
    backgroundColor: Colors.safetyRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  retryBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  zoomControls: {
    position: 'absolute',
    right: 14,
    bottom: 40,
    backgroundColor: Colors.white,
    borderRadius: 14,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
    zIndex: 10,
  },
  zoomButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: Colors.gray200,
  },
  recenterButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    zIndex: 10,
  },
  mapAttribution: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    zIndex: 5,
  },
  attributionText: {
    fontSize: 9,
    color: Colors.gray600,
    fontWeight: '600',
  },
});

export default MapViewComponent;
