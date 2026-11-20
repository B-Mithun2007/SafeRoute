/**
 * Incident Reporting and Heatmap Visualization Type Definitions.
 */
import { Coordinates } from './route';

export type IncidentCategory =
  | 'harassment'
  | 'poor_lighting'
  | 'isolated_road'
  | 'suspicious_activity'
  | 'unsafe_crowd'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface IncidentReport {
  id: string;
  category: IncidentCategory;
  categoryLabel: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  severity: IncidentSeverity;
  reportedAt: string;
  anonymous: boolean;
  status?: 'active' | 'investigating' | 'resolved';
}

export type TimeOfDayFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface HeatmapSegment {
  id: string;
  title: string;
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
  safetyScore: number;
  lightingRating: number;
  crowdDensity: number;
  recentIncidentsCount: number;
  timeOfDay: TimeOfDayFilter;
  coordinates: Coordinates[];
  description: string;
}
