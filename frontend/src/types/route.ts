/**
 * Geographical, Routing, and Safety Scoring Type Definitions.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPoint {
  name: string;
  address?: string;
  coordinates: Coordinates;
}

export type RiskLevel = 'LOW_RISK' | 'MODERATE_RISK' | 'ELEVATED_RISK' | 'HIGH_RISK' | 'UNKNOWN';

export interface RouteOption {
  id: string;
  name: string;
  type: 'RECOMMENDED' | 'FASTEST' | 'ALTERNATIVE';
  distanceMeters: number;
  durationSeconds: number;
  safetyScore: number; // 0 to 100
  riskLevel: RiskLevel;
  reportedConcernsCount: number;
  wellLitPercentage: number;
  isBackendGenerated: boolean;
  coordinates: Coordinates[];
  description: string;
  highlightPill?: string;
}

export interface RouteEvaluationRequest {
  origin: Coordinates;
  destination: Coordinates;
  travelMode?: 'walking' | 'bicycling' | 'driving';
  preferences?: {
    prioritize_lighting?: boolean;
    avoid_high_incident_zones?: boolean;
    max_detour_percent?: number;
  };
}

export interface RouteEvaluationResponse {
  routes: RouteOption[];
  disclaimer: string;
}
