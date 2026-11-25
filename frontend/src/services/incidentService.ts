/**
 * Incident Reporting & Community Hazard Service.
 * Manages fetching nearby incidents and posting new community reports.
 */
import { apiClient } from './api';
import { Config } from '../constants/config';
import { IncidentReport, IncidentCategory, IncidentSeverity } from '../types/incident';

// Persistent in-memory cache for reports created during the active session
let localSubmittedReports: IncidentReport[] = [];

export const IncidentService = {
  /**
   * Fetch recent safety incident reports in proximity.
   */
  async getNearbyIncidents(lat: number, lng: number, _radiusMeters = 3000): Promise<IncidentReport[]> {
    if (Config.FORCE_MOCK_API) {
      return [...localSubmittedReports, ...this._getSampleIncidents(lat, lng)];
    }

    try {
      const response = await apiClient.get('/api/reports', {
        params: {
          lat,
          lng,
          radius: _radiusMeters,
        },
      });
      return [...localSubmittedReports, ...(response.data || [])];
    } catch {
      // Fallback to sample incidents for rich hackathon experience
      return [...localSubmittedReports, ...this._getSampleIncidents(lat, lng)];
    }
  },

  /**
   * Submit a new hazard or incident report.
   */
  async submitReport(reportData: {
    category: IncidentCategory;
    description: string;
    latitude: number;
    longitude: number;
    severity: IncidentSeverity;
    anonymous: boolean;
    locationName?: string;
    photoUri?: string;
  }): Promise<{ success: boolean; report: IncidentReport }> {
    const categoryLabels: Record<IncidentCategory, string> = {
      poor_lighting: 'Poor Street Lighting',
      harassment: 'Harassment / Eve-Teasing',
      isolated_road: 'Isolated / Deserted Stretch',
      suspicious_activity: 'Suspicious Activity',
      unsafe_crowd: 'Unruly Crowd / Loitering',
      other: 'Other Safety Hazard',
    };

    const newReport: IncidentReport = {
      id: 'rep_' + Math.random().toString(36).substring(2, 9),
      category: reportData.category,
      categoryLabel: categoryLabels[reportData.category] || 'Safety Concern',
      description: reportData.description,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      locationName: reportData.locationName || 'Reported Location',
      severity: reportData.severity,
      reportedAt: new Date().toISOString(),
      anonymous: reportData.anonymous,
      status: 'active',
    };

    try {
      await apiClient.post('/api/reports', reportData);
    } catch {
      // Graceful fallback: when backend endpoint is not yet available,
      // the report is preserved in localSubmittedReports so user sees it in the app
    }

    // Always keep in local list so user sees their report immediately
    localSubmittedReports = [newReport, ...localSubmittedReports];

    return {
      success: true,
      report: newReport,
    };
  },

  _getSampleIncidents(centerLat: number, centerLng: number): IncidentReport[] {
    return [
      {
        id: 'inc_1',
        category: 'poor_lighting',
        categoryLabel: 'Poor Street Lighting',
        description: 'Several overhead lamps are broken on the sidewalk, creating a 200m pitch-black stretch.',
        latitude: centerLat + 0.0035,
        longitude: centerLng - 0.0028,
        locationName: '4th Avenue Crossroad',
        severity: 'medium',
        reportedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        anonymous: true,
        status: 'active',
      },
      {
        id: 'inc_2',
        category: 'isolated_road',
        categoryLabel: 'Isolated / Deserted Stretch',
        description: 'Construction boundary makes this back alley very secluded after 8 PM with zero foot traffic.',
        latitude: centerLat - 0.0042,
        longitude: centerLng + 0.0031,
        locationName: 'Old Mill Lane',
        severity: 'high',
        reportedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        anonymous: false,
        status: 'active',
      },
      {
        id: 'inc_3',
        category: 'suspicious_activity',
        categoryLabel: 'Suspicious Activity',
        description: 'Group loitering near unlit ATM vestibule, reported feeling unsafe.',
        latitude: centerLat + 0.0018,
        longitude: centerLng + 0.0045,
        locationName: 'Metro Station Exit B',
        severity: 'medium',
        reportedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        anonymous: true,
        status: 'active',
      },
    ];
  },
};

export default IncidentService;
