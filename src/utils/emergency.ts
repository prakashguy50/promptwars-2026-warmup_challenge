import { EmergencyReport } from '../services/gemini';
import { Coordinates } from './geolocation';

/**
 * Generates a shareable text brief for an emergency report.
 * @param {EmergencyReport} report - The structured emergency report.
 * @param {Coordinates | null} location - The user's coordinates.
 * @returns {string} The formatted share brief.
 */
export const generateShareBrief = (report: EmergencyReport, location: Coordinates | null): string => {
  if (!report) return '';
  
  const locStr = report.extractedLocation || (location ? `${location.latitude}, ${location.longitude}` : 'Unknown');
  const dangerStr = report.weaponsInvolved || report.hazardsPresent ? '\n\n⚠️ DANGER: Weapons or hazards present!' : '';
  
  return `🚨 EMERGENCY ALERT 🚨
Type: ${report.incidentType} (Level ${report.severityLevel})
Location: ${locStr}
Casualties: ${report.estimatedCasualties}
Services Needed: ${report.requiredServices.join(', ')}

Context: ${report.criticalContext}${dangerStr}

Sent via SankatBridge`;
};

/**
 * Gets the tailwind color classes based on severity level.
 * @param {string} level - The severity level (1-5).
 * @returns {string} Tailwind classes for the severity badge.
 */
export const getSeverityColor = (level: string): string => {
  const num = parseInt(level, 10);
  if (isNaN(num)) return 'bg-zinc-700 text-zinc-100 border-zinc-600';
  if (num >= 4) return 'bg-red-900/50 text-red-200 border-red-500';
  if (num === 3) return 'bg-orange-900/50 text-orange-200 border-orange-500';
  return 'bg-green-900/50 text-green-200 border-green-500';
};
