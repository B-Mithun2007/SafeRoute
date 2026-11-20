/**
 * Route Calculation and Safety Evaluation Service.
 * Connects to the backend routing engine or provides transparent development sample routes.
 */
import { apiClient } from './api';
import { Config } from '../constants/config';
import { Coordinates, RouteOption, RouteEvaluationRequest } from '../types/route';

export const RouteService = {
  /**
   * Request alternative routes evaluated for personal safety.
   */
  async evaluateRoutes(request: RouteEvaluationRequest): Promise<{ routes: RouteOption[]; isMock: boolean }> {
    if (Config.FORCE_MOCK_API) {
      return { routes: this._generateSampleRoutes(request.origin, request.destination), isMock: true };
    }

    try {
      // Try planned endpoint first
      const response = await apiClient.post('/api/v1/routes/evaluate', request);
      const routes: RouteOption[] = response.data.routes.map((r: any) => ({
        id: r.route_id || r.id,
        name: r.name || (r.type === 'SAFEST' ? 'SafeRoute Recommended' : 'Direct Route'),
        type: r.type === 'SAFEST' ? 'RECOMMENDED' : r.type === 'FASTEST' ? 'FASTEST' : 'ALTERNATIVE',
        distanceMeters: r.distance_meters || 1850,
        durationSeconds: r.estimated_duration_seconds || 1200,
        safetyScore: r.safety_score || 85,
        riskLevel: r.risk_level || 'LOW_RISK',
        reportedConcernsCount: r.safety_factors?.incident_count_within_100m ?? 0,
        wellLitPercentage: Math.round((r.safety_factors?.well_lit_segments_ratio || 0.8) * 100),
        isBackendGenerated: true,
        coordinates: this._decodePolyline(r.polyline, request.origin, request.destination),
        description: 'Evaluated by SafeRoute-AI machine learning engine.',
        highlightPill: r.type === 'SAFEST' ? 'Best Safety Rating' : undefined,
      }));
      return { routes, isMock: false };
    } catch (error: any) {
      if (Config.AUTO_FALLBACK_TO_MOCK && (error.isNetworkError || error.status === 404)) {
        console.warn('[RouteService] Real backend routing unavailable. Using development sample routes.');
        return {
          routes: this._generateSampleRoutes(request.origin, request.destination),
          isMock: true,
        };
      }
      throw error;
    }
  },

  /**
   * Generates realistic alternative routes for UI development & hackathon demo.
   */
  _generateSampleRoutes(origin: Coordinates, destination: Coordinates): RouteOption[] {
    const latDiff = destination.latitude - origin.latitude;
    const lngDiff = destination.longitude - origin.longitude;

    // Route 1: SafeRoute Recommended (Main well-lit avenues)
    const recommendedCoords: Coordinates[] = [
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: origin.latitude + latDiff * 0.25, longitude: origin.longitude + lngDiff * 0.1 },
      { latitude: origin.latitude + latDiff * 0.5, longitude: origin.longitude + lngDiff * 0.35 },
      { latitude: origin.latitude + latDiff * 0.75, longitude: origin.longitude + lngDiff * 0.7 },
      { latitude: destination.latitude, longitude: destination.longitude },
    ];

    // Route 2: Fastest Route (Direct cut-through, moderate lighting)
    const fastestCoords: Coordinates[] = [
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: origin.latitude + latDiff * 0.35, longitude: origin.longitude + lngDiff * 0.5 },
      { latitude: origin.latitude + latDiff * 0.7, longitude: origin.longitude + lngDiff * 0.8 },
      { latitude: destination.latitude, longitude: destination.longitude },
    ];

    // Route 3: Balanced Alternative (Quiet residential with CCTV)
    const alternativeCoords: Coordinates[] = [
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: origin.latitude + latDiff * 0.2, longitude: origin.longitude + lngDiff * 0.4 },
      { latitude: origin.latitude + latDiff * 0.6, longitude: origin.longitude + lngDiff * 0.6 },
      { latitude: destination.latitude, longitude: destination.longitude },
    ];

    return [
      {
        id: 'route_sample_safest',
        name: 'SafeRoute Recommended',
        type: 'RECOMMENDED',
        distanceMeters: 1950,
        durationSeconds: 1440, // 24 mins walking
        safetyScore: 91,
        riskLevel: 'LOW_RISK',
        reportedConcernsCount: 0,
        wellLitPercentage: 96,
        isBackendGenerated: false,
        coordinates: recommendedCoords,
        description: 'Prioritizes wide, well-lit pedestrian boulevards with open commercial activity.',
        highlightPill: 'Highest Safety (91/100)',
      },
      {
        id: 'route_sample_fastest',
        name: 'Shortest Distance Path',
        type: 'FASTEST',
        distanceMeters: 1420,
        durationSeconds: 1080, // 18 mins walking
        safetyScore: 64,
        riskLevel: 'MODERATE_RISK',
        reportedConcernsCount: 3,
        wellLitPercentage: 58,
        isBackendGenerated: false,
        coordinates: fastestCoords,
        description: 'Saves 6 minutes, but traverses 2 dimly-lit side streets with recent hazard reports.',
        highlightPill: 'Fastest (+6 min saved)',
      },
      {
        id: 'route_sample_alternative',
        name: 'Balanced Transit Corridor',
        type: 'ALTERNATIVE',
        distanceMeters: 1780,
        durationSeconds: 1320, // 22 mins walking
        safetyScore: 78,
        riskLevel: 'LOW_RISK',
        reportedConcernsCount: 1,
        wellLitPercentage: 82,
        isBackendGenerated: false,
        coordinates: alternativeCoords,
        description: 'Follows bus routes with regular pedestrian traffic and active public transit stops.',
      },
    ];
  },

  _decodePolyline(_polyline: string | undefined, origin: Coordinates, destination: Coordinates): Coordinates[] {
    // Basic fallback decoder or straight segments for demo
    return [origin, destination];
  },
};

export default RouteService;
