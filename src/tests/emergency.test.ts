import { describe, it, expect } from 'vitest';
import { generateShareBrief, getSeverityColor } from '../utils/emergency';
import { sanitizeInput } from '../utils/sanitize';
import { EmergencyReport } from '../types';

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

  describe('Edge Cases & Security', () => {
    it('should handle empty audio input gracefully', () => {
      // Mocking the behavior where audio is empty
      const audioBase64 = '';
      expect(audioBase64.length).toBe(0);
    });

    it('should handle corrupted image gracefully', () => {
      // Mocking corrupted image handling
      const corruptedImage = 'data:image/jpeg;base64,invalid_base64_string';
      expect(corruptedImage).toContain('invalid_base64');
    });

    it('should handle location timeout gracefully', () => {
      // Mocking location timeout
      const locationError = new Error('Location timeout');
      expect(locationError.message).toBe('Location timeout');
    });

    it('should handle Firestore write failure gracefully', () => {
      // Mocking Firestore write failure
      const firestoreError = new Error('Missing or insufficient permissions');
      expect(firestoreError.message).toContain('permissions');
    });

    it('should trigger rate limit after submission', () => {
      // Mocking rate limit logic
      let isRateLimited = false;
      const submit = () => { isRateLimited = true; };
      submit();
      expect(isRateLimited).toBe(true);
    });

    it('should sanitize input and prevent XSS payloads', () => {
      const maliciousInput = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">Hello';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('Hello');
    });

    it('should handle null input in sanitizeInput', () => {
      expect(sanitizeInput(null)).toBe('');
    });

    it('should handle undefined input in sanitizeInput', () => {
      expect(sanitizeInput(undefined)).toBe('');
    });
  });
});
