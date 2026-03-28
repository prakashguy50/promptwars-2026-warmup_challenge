import React, { useState, useEffect, Suspense, lazy } from 'react';
import { EmergencyInterface } from './components/EmergencyInterface';
import { analyzeEmergency } from './services/gemini';
import { EmergencyReport } from './types';
import { getCurrentLocation } from './utils/geolocation';
import { GeoLocation } from './types';
import { db, signInAnonymous, auth } from './services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateShareBrief } from './utils/emergency';
import { sanitizeInput } from './utils/sanitize';
import { trackEvent } from './utils/analytics';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

/**
 * Handles Firestore errors by formatting them and throwing a structured error.
 * @param {unknown} error - The caught error.
 * @param {OperationType} operationType - The type of Firestore operation.
 * @param {string | null} path - The Firestore path.
 * @throws {Error} Always throws a structured JSON error.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const IncidentCard = lazy(() => import('./components/IncidentCard').then(m => ({ default: m.IncidentCard })));
const LiveMap = lazy(() => import('./components/LiveMap').then(m => ({ default: m.LiveMap })));

/**
 * Main Application Component
 * Handles the state and flow of the emergency reporting process.
 * @returns {JSX.Element} The rendered App component.
 * @throws {Error} Never throws directly.
 */
export const App = () => {
  const [report, setReport] = useState<EmergencyReport | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    /**
     * Initializes anonymous authentication.
     * @returns {Promise<void>}
     */
    const initAuth = async (): Promise<void> => {
      try {
        const cred = await signInAnonymous();
        setUserId(cred.user.uid);
        setAuthReady(true);
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
        setAuthReady(true);
      }
    };
    initAuth();
  }, []);

  /**
   * Handles the submission of an emergency report.
   * @param {string} text - The text description of the emergency.
   * @param {string} [audioBase64] - Optional base64 encoded audio.
   * @param {string} [imageBase64] - Optional base64 encoded image.
   * @returns {Promise<void>}
   * @throws {Error} If processing or database write fails.
   */
  const handleEmergencySubmit = async (text: string, audioBase64?: string, imageBase64?: string): Promise<void> => {
    if (isRateLimited) return;
    setIsLoading(true);
    try {
      // Sanitize text input before processing
      const sanitizedText = sanitizeInput(text);

      // 1. Get location (non-blocking if it fails, but we try)
      let currentLoc: GeoLocation | null = null;
      try {
        currentLoc = await getCurrentLocation();
        setLocation(currentLoc);
      } catch (locErr) {
        // Silently continue without location
      }

      // 2. Analyze with Gemini
      const analysis = await analyzeEmergency(sanitizedText, audioBase64, imageBase64);
      setReport(analysis);
      
      trackEvent('report_submitted', { 
        severity: analysis.severityLevel, 
        type: analysis.incidentType,
        hasAudio: !!audioBase64,
        hasImage: !!imageBase64
      });

      // Rate limit for 10 seconds
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 10000);

      // 3. Save to Firestore (MUST succeed)
      if (!userId || !db) {
        throw new Error('Database connection or authentication is missing. Cannot save report.');
      }

      try {
        await addDoc(collection(db, 'incidents'), {
          reporterId: userId,
          timestamp: serverTimestamp(),
          coordinates: currentLoc ? { lat: currentLoc.latitude, lng: currentLoc.longitude } : null,
          structuredData: analysis,
          status: 'pending'
        });
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, 'incidents');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process emergency.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles sharing the emergency brief via Web Share API or clipboard.
   * @returns {Promise<void>}
   * @throws {Error} Never throws directly.
   */
  const handleShare = async (): Promise<void> => {
    if (!report) return;

    const summary = generateShareBrief(report, location);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Alert',
          text: summary,
        });
      } else {
        await navigator.clipboard.writeText(summary);
        alert('Emergency brief copied to clipboard!');
      }
    } catch (err) {
      // Silently fail share
    }
  };

  /**
   * Resets the application state to start a new report.
   * @returns {void}
   */
  const handleReset = (): void => {
    setReport(null);
    setLocation(null);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p>{authError}</p>
          <p className="mt-4 text-sm text-red-300">Please ensure Firebase Anonymous Authentication is enabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-red-500/30">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-zinc-900 focus:text-white">Skip to content</a>
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-500 tracking-tight">SankatBridge</h1>
          {report && (
            <button 
              onClick={handleReset}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              aria-label="Start new report"
            >
              New Report
            </button>
          )}
        </div>
      </header>

      <main id="main-content" className="pb-20 pt-6">
        {!report ? (
          <EmergencyInterface onSubmit={handleEmergencySubmit} isLoading={isLoading} isRateLimited={isRateLimited} />
        ) : (
          <Suspense fallback={<div className="p-4 text-center text-zinc-400">Loading emergency details...</div>}>
            <div className="flex flex-col gap-6">
              <IncidentCard report={report} onShare={handleShare} />
              <LiveMap location={location} />
            </div>
          </Suspense>
        )}
      </main>
    </div>
  );
};
