/**
 * Core TypeScript type definitions for SankatBridge.
 * @module types
 */

/** Severity levels for an emergency incident (1=minor, 5=critical). */
export type SeverityLevel = '1' | '2' | '3' | '4' | '5' | string;

/** Incident type classifications. */
export type IncidentType = 'Medical' | 'Fire' | 'Police' | 'Rescue' | 'Other';

/** Incident lifecycle statuses. */
export type IncidentStatus = 'pending' | 'dispatched' | 'resolved';

/** Google Analytics event names tracked in the application. */
export type AnalyticsEvent =
  | 'report_submitted'
  | 'share_brief_clicked'
  | 'first_aid_viewed'
  | 'voice_input_used'
  | 'photo_captured';

/** Geographic location from device GPS. */
export interface GeoLocation {
  /** Latitude in decimal degrees. */
  latitude: number;
  /** Longitude in decimal degrees. */
  longitude: number;
  /** Accuracy in meters. */
  accuracy?: number;
}

/** Simplified coordinates for Firestore storage. */
export interface GeoCoordinates {
  /** Latitude. */
  lat: number;
  /** Longitude. */
  lng: number;
}

/** A first aid instruction step. */
export interface FirstAidStep {
  /** Brief title. */
  step: string;
  /** Detailed instruction. */
  description: string;
}

/** Structured emergency data returned by Gemini API. */
export interface EmergencyReport {
  /** Classification of the emergency type. */
  incidentType: string;
  /** Severity from 1 (minor) to 5 (critical). */
  severityLevel: SeverityLevel;
  /** Brief summary of the immediate danger. */
  criticalContext: string;
  /** Step-by-step first aid instructions. */
  firstAidInstructions: string[];
  /** Estimated number of casualties. */
  estimatedCasualties: number;
  /** Whether weapons are involved. */
  weaponsInvolved: boolean;
  /** Whether environmental hazards are present. */
  hazardsPresent: boolean;
  /** Location extracted from user input. */
  extractedLocation: string | null;
  /** List of required emergency services. */
  requiredServices: string[];
}

/** Full incident document as stored in Firestore. */
export interface IncidentDocument {
  /** Firebase Auth user ID of the reporter. */
  reporterId: string;
  /** Server timestamp when created. */
  timestamp: Date;
  /** GPS coordinates of the reporter. */
  coordinates: GeoCoordinates | null;
  /** Structured emergency data from Gemini. */
  structuredData: EmergencyReport;
  /** Current lifecycle status. */
  status: IncidentStatus;
}

/** Gemini API service configuration. */
export interface GeminiConfig {
  /** Model identifier (e.g. 'gemini-2.5-flash'). */
  modelName: string;
  /** API key from environment variables. */
  apiKey: string;
}

/** Firebase configuration shape. */
export interface FirebaseConfig {
  /** Firebase project API key. */
  apiKey: string;
  /** Firebase auth domain. */
  authDomain: string;
  /** Firebase project ID. */
  projectId: string;
  /** Firebase storage bucket. */
  storageBucket: string;
  /** Firebase messaging sender ID. */
  messagingSenderId: string;
  /** Firebase app ID. */
  appId: string;
  /** Google Analytics measurement ID. */
  measurementId: string;
}

/** Props for IncidentCard component. */
export interface IncidentCardProps {
  /** The structured emergency report. */
  report: EmergencyReport;
  /** GPS coordinates for map display. */
  location: GeoLocation | null;
}

/** Props for LiveMap component. */
export interface LiveMapProps {
  /** Latitude for map center. */
  latitude: number;
  /** Longitude for map center. */
  longitude: number;
}

/** Props for EmergencyInterface component. */
export interface EmergencyInterfaceProps {
  /** Callback when emergency data is captured. */
  onSubmit: (text: string, audioBase64: string | null, imageBase64: string | null) => void;
  /** Whether the form is currently submitting. */
  isLoading: boolean;
}

/** Firestore error tracking interface. */
export interface FirestoreErrorInfo {
  /** Error message string. */
  error: string;
  /** Type of operation that failed. */
  operationType: string;
  /** Collection/document path. */
  path: string | null;
}
