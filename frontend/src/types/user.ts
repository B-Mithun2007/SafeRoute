/**
 * User and Authentication Type Definitions.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface TravelPreferences {
  preferWellLit: boolean;
  avoidIsolated: boolean;
  preferPublicActivity: boolean;
  avoidRecentIncidents: boolean;
  safetyPriority: 'safety_first' | 'balanced' | 'fastest';
  maxDetourPercent: number; // e.g. 10 to 50%
  autoNotifyContacts: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
