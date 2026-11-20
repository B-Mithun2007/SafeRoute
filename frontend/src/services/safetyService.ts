/**
 * Safety Scoring & Heatmap Visualization Service.
 */
import { apiClient } from './api';
import { Config } from '../constants/config';
import { HeatmapSegment, TimeOfDayFilter } from '../types/incident';

export const SafetyService = {
  /**
   * Get safety rating for a specific geographic coordinate.
   */
  async getCoordinateSafety(lat: number, lng: number): Promise<{
    safetyScore: number;
    riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
    lighting: number;
    incidentsNearby: number;
  }> {
    try {
      const response = await apiClient.get('/api/v1/safety-score', {
        params: { lat, lng },
      });
      return {
        safetyScore: response.data.safety_score,
        riskLevel: response.data.risk_level,
        lighting: response.data.indicators?.lighting_rating ?? 0.8,
        incidentsNearby: response.data.indicators?.recent_incidents ?? 0,
      };
    } catch {
      // Mock score based on time of day
      const hour = new Date().getHours();
      const isNight = hour >= 20 || hour <= 5;
      return {
        safetyScore: isNight ? 72 : 88,
        riskLevel: isNight ? 'MODERATE_RISK' : 'LOW_RISK',
        lighting: isNight ? 0.65 : 0.95,
        incidentsNearby: isNight ? 1 : 0,
      };
    }
  },

  /**
   * Fetch heatmap segments filtered by time of day.
   */
  async getHeatmapSegments(
    centerLat: number,
    centerLng: number,
    timeFilter: TimeOfDayFilter = 'all'
  ): Promise<HeatmapSegment[]> {
    try {
      const response = await apiClient.get('/api/safety/heatmap', {
        params: { lat: centerLat, lng: centerLng, time: timeFilter },
      });
      return response.data;
    } catch {
      // Return curated sample road segments for hackathon visualization
      return this._generateSampleHeatmapSegments(centerLat, centerLng, timeFilter);
    }
  },

  _generateSampleHeatmapSegments(lat: number, lng: number, filter: TimeOfDayFilter): HeatmapSegment[] {
    const isNightTime = filter === 'night';

    return [
      {
        id: 'seg_green_1',
        title: 'Grand Commercial Avenue',
        riskLevel: 'LOW_RISK',
        safetyScore: isNightTime ? 85 : 94,
        lightingRating: 0.92,
        crowdDensity: 0.88,
        recentIncidentsCount: 0,
        timeOfDay: 'all',
        description: 'Vibrant corridor with 24/7 commercial stores, active public surveillance, and high-density street lamps.',
        coordinates: [
          { latitude: lat + 0.005, longitude: lng - 0.004 },
          { latitude: lat + 0.002, longitude: lng - 0.001 },
          { latitude: lat - 0.001, longitude: lng + 0.002 },
        ],
      },
      {
        id: 'seg_yellow_2',
        title: 'Market Bypass Road',
        riskLevel: 'MODERATE_RISK',
        safetyScore: isNightTime ? 56 : 68,
        lightingRating: 0.6,
        crowdDensity: 0.45,
        recentIncidentsCount: 2,
        timeOfDay: isNightTime ? 'night' : 'evening',
        description: 'Medium traffic during daylight; lighting drops noticeably after market stalls close at 8 PM.',
        coordinates: [
          { latitude: lat + 0.003, longitude: lng + 0.002 },
          { latitude: lat + 0.001, longitude: lng + 0.005 },
          { latitude: lat - 0.002, longitude: lng + 0.007 },
        ],
      },
      {
        id: 'seg_red_3',
        title: 'Industrial Canal Pathway',
        riskLevel: 'HIGH_RISK',
        safetyScore: isNightTime ? 32 : 44,
        lightingRating: 0.25,
        crowdDensity: 0.15,
        recentIncidentsCount: 4,
        timeOfDay: 'night',
        description: 'Poorly lit road bordered by warehouse walls with zero pedestrian exits and frequent incident reports.',
        coordinates: [
          { latitude: lat - 0.003, longitude: lng - 0.006 },
          { latitude: lat - 0.006, longitude: lng - 0.003 },
          { latitude: lat - 0.008, longitude: lng - 0.001 },
        ],
      },
    ];
  },
};

export default SafetyService;
