import React, { useState, useEffect } from 'react';
import EmergencyInterface from './components/EmergencyInterface';
import IncidentCard from './components/IncidentCard';
import LiveMap from './components/LiveMap';
import { analyzeEmergency, EmergencyReport } from './services/gemini';
import { getCurrentLocation, Coordinates } from './utils/geolocation';
import { db, signInAnonymous } from './services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateShareBrief } from './utils/emergency';
import { sanitizeInput } from './utils/sanitize';
import { trackEvent } from './utils/analytics';

/**
 * Main Application Component
 * Handles the state and flow of the emergency reporting process.
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  const [report, setReport] = useState<EmergencyReport | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    // Attempt anonymous sign-in for quick reporting
    const initAuth = async () => {
      try {
        const cred = await signInAnonymous();
        setUserId(cred.user.uid);
        setAuthReady(true);
      } catch (err) {
        console.error('Auth error (Firebase might not be configured yet):', err);
        setAuthReady(true); // Continue anyway so the app works locally without DB
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
   */
  const handleEmergencySubmit = async (text: string, audioBase64?: string, imageBase64?: string) => {
    if (isRateLimited) return;
    setIsLoading(true);
    try {
      // Sanitize text input before processing
      const sanitizedText = sanitizeInput(text);

      // 1. Get location (non-blocking if it fails, but we try)
      let currentLoc: Coordinates | null = null;
      try {
        currentLoc = await getCurrentLocation();
        setLocation(currentLoc);
      } catch (locErr) {
        console.warn('Location access denied or failed:', locErr);
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

      // 3. Save to Firestore (if auth succeeded and DB is configured)
      if (userId && db) {
        try {
          await addDoc(collection(db, 'incidents'), {
            reporterId: userId,
            timestamp: serverTimestamp(),
            coordinates: currentLoc ? { lat: currentLoc.latitude, lng: currentLoc.longitude } : null,
            structuredData: analysis,
            status: 'pending'
          });
        } catch (dbErr) {
          console.error('Failed to save to Firestore:', dbErr);
        }
      } else if (!db) {
        console.warn('Firestore is not configured. Report was analyzed but not saved to the database.');
      }
    } catch (err) {
      console.error('Emergency processing failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to process emergency.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles sharing the emergency brief via Web Share API or clipboard.
   * @returns {Promise<void>}
   */
  const handleShare = async () => {
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
      console.error('Error sharing:', err);
    }
  };

  /**
   * Resets the application state to start a new report.
   */
  const handleReset = () => {
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
          <div className="flex flex-col gap-6">
            <IncidentCard report={report} onShare={handleShare} />
            <LiveMap location={location} />
          </div>
        )}
      </main>
    </div>
  );
}
