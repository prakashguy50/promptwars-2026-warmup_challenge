import React, { useEffect } from 'react';
import { Share2, AlertTriangle, HeartPulse, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { EmergencyReport } from '../services/gemini';
import { getSeverityColor } from '../utils/emergency';
import { trackEvent } from '../utils/analytics';

/**
 * Interface for the IncidentCard component props.
 */
interface IncidentCardProps {
  report: EmergencyReport;
  onShare: () => void;
}

/**
 * Component to display the structured emergency report and first aid instructions.
 * @param {IncidentCardProps} props - The component props.
 * @returns {JSX.Element} The rendered IncidentCard component.
 */
export const IncidentCard = ({ report, onShare }: IncidentCardProps) => {
  const severityColor = getSeverityColor(report.severityLevel);

  useEffect(() => {
    if (report.firstAidInstructions && report.firstAidInstructions.length > 0) {
      trackEvent('first_aid_viewed', { incidentType: report.incidentType });
    }
  }, [report]);

  /**
   * Handles the click event for sharing the brief and tracks it.
   */
  const handleShareClick = () => {
    trackEvent('share_brief_clicked', { severity: report.severityLevel });
    onShare();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 contain-strict" aria-live="polite">
      
      {/* Situation Card */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl" aria-labelledby="situation-heading">
        <div className={`p-4 border-b flex justify-between items-center ${severityColor}`}>
          <h2 id="situation-heading" className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle size={24} aria-hidden="true" />
            {report.incidentType.toUpperCase()}
          </h2>
          <span role="alert" className="font-mono font-bold text-lg px-3 py-1 bg-black/30 rounded-full">
            Level {report.severityLevel}
          </span>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <p className="text-zinc-100 text-lg leading-relaxed">
            {report.criticalContext}
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col gap-1">
              <span className="text-zinc-500 flex items-center gap-1"><MapPin size={14}/> Location</span>
              <span className="font-medium text-zinc-200">{report.extractedLocation || 'Unknown'}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col gap-1">
              <span className="text-zinc-500 flex items-center gap-1"><HeartPulse size={14}/> Casualties</span>
              <span className="font-medium text-zinc-200">{report.estimatedCasualties}</span>
            </div>
          </div>

          {(report.weaponsInvolved || report.hazardsPresent) && (
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-xl flex items-start gap-3 text-red-400">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>DANGER:</strong> 
                {report.weaponsInvolved && ' Weapons reported. '}
                {report.hazardsPresent && ' Environmental hazards present. '}
                Keep distance.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* First Aid Card */}
      {report.firstAidInstructions && report.firstAidInstructions.length > 0 && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl" aria-labelledby="first-aid-heading">
          <h2 id="first-aid-heading" className="text-xl font-bold text-blue-400 flex items-center gap-2 mb-4">
            <HeartPulse size={24} />
            Immediate First Aid
          </h2>
          <ul className="flex flex-col gap-3">
            {report.firstAidInstructions.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start text-zinc-200 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Share Button */}
      <button
        onClick={handleShareClick}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl py-5 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
        aria-label="Share Emergency Brief"
      >
        <Share2 size={28} />
        SHARE BRIEF
      </button>

    </div>
  );
}
