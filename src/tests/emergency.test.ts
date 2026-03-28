import { describe, it, expect } from 'vitest';
import { generateShareBrief, getSeverityColor } from '../utils/emergency';
import { EmergencyReport } from '../services/gemini';

describe('Emergency Logic', () => {
  const mockReport: EmergencyReport = {
    incidentType: 'Fire',
    severityLevel: '5',
    extractedLocation: '123 Elm St',
    estimatedCasualties: 2,
    requiredServices: ['Firetruck', 'Ambulance'],
    criticalContext: 'Building is engulfed in flames.',
    weaponsInvolved: false,
    hazardsPresent: true,
    firstAidInstructions: ['Evacuate immediately']
  };

  describe('getSeverityColor', () => {
    it('should return red for critical severity (5)', () => {
      expect(getSeverityColor('5')).toContain('bg-red-900');
    });

    it('should return red for high severity (4)', () => {
      expect(getSeverityColor('4')).toContain('bg-red-900');
    });

    it('should return orange for urgent severity (3)', () => {
      expect(getSeverityColor('3')).toContain('bg-orange-900');
    });

    it('should return green for minor severity (2)', () => {
      expect(getSeverityColor('2')).toContain('bg-green-900');
    });

    it('should return green for minor severity (1)', () => {
      expect(getSeverityColor('1')).toContain('bg-green-900');
    });

    it('should return default gray for invalid severity', () => {
      expect(getSeverityColor('invalid')).toContain('bg-zinc-700');
    });
  });

  describe('generateShareBrief', () => {
    it('should generate correct brief with all fields present', () => {
      const brief = generateShareBrief(mockReport, null);
      expect(brief).toContain('Type: Fire (Level 5)');
      expect(brief).toContain('Location: 123 Elm St');
      expect(brief).toContain('Casualties: 2');
      expect(brief).toContain('Services Needed: Firetruck, Ambulance');
      expect(brief).toContain('Context: Building is engulfed in flames.');
      expect(brief).toContain('⚠️ DANGER: Weapons or hazards present!');
    });

    it('should use device coordinates if extracted location is empty', () => {
      const reportWithoutLoc = { ...mockReport, extractedLocation: '' };
      const brief = generateShareBrief(reportWithoutLoc, { latitude: 40.7128, longitude: -74.0060, accuracy: 10 });
      expect(brief).toContain('Location: 40.7128, -74.006');
    });

    it('should use Unknown if both extracted location and device coordinates are missing', () => {
      const reportWithoutLoc = { ...mockReport, extractedLocation: '' };
      const brief = generateShareBrief(reportWithoutLoc, null);
      expect(brief).toContain('Location: Unknown');
    });

    it('should omit danger warning if no weapons or hazards', () => {
      const safeReport = { ...mockReport, weaponsInvolved: false, hazardsPresent: false };
      const brief = generateShareBrief(safeReport, null);
      expect(brief).not.toContain('⚠️ DANGER');
    });

    it('should return empty string if report is null', () => {
      expect(generateShareBrief(null as any, null)).toBe('');
    });
  });
});
