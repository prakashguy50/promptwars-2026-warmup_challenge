export type SeverityLevel = '1' | '2' | '3' | '4' | '5' | string;

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface FirstAidStep {
  step: string;
  description: string;
}

export type IncidentStatus = 'pending' | 'dispatched' | 'resolved';

export interface EmergencyReport {
  incidentType: string;
  severityLevel: SeverityLevel;
  criticalContext: string;
  firstAidInstructions: string[];
  estimatedCasualties: number;
  weaponsInvolved: boolean;
  hazardsPresent: boolean;
  extractedLocation: string | null;
  requiredServices: string[];
}
