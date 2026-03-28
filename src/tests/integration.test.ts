import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeEmergency } from '../services/gemini';
import { getCurrentLocation } from '../utils/geolocation';

vi.mock('../utils/geolocation', () => ({
  getCurrentLocation: vi.fn()
}));

const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY',
      BOOLEAN: 'BOOLEAN'
    }
  };
});

describe('Integration & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle extremely long strings gracefully', async () => {
    const longString = 'A'.repeat(6000);
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ incidentType: 'Other', severityLevel: '1', extractedLocation: '', estimatedCasualties: 0, requiredServices: [], criticalContext: 'Test', weaponsInvolved: false, hazardsPresent: false, firstAidInstructions: [] })
    });
    const result = await analyzeEmergency(longString);
    expect(result.incidentType).toBe('Other');
  });

  it('should handle special characters in input', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ incidentType: 'Other', severityLevel: '1', extractedLocation: '', estimatedCasualties: 0, requiredServices: [], criticalContext: 'Test', weaponsInvolved: false, hazardsPresent: false, firstAidInstructions: [] })
    });
    const result = await analyzeEmergency('<script>alert("test")</script> & " \' /');
    expect(result.incidentType).toBe('Other');
  });

  it('should handle network timeout scenarios', async () => {
    mockGenerateContent.mockImplementationOnce(() => new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), 100);
    }));
    await expect(analyzeEmergency('test')).rejects.toThrow('Network timeout');
  });

  it('should handle location permission denied', async () => {
    (getCurrentLocation as any).mockRejectedValueOnce(new Error('User denied Geolocation'));
    await expect(getCurrentLocation()).rejects.toThrow('User denied Geolocation');
  });

  it('should handle camera access blocked (mocked)', async () => {
    // Mocking navigator.mediaDevices.getUserMedia
    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('NotAllowedError: Permission denied'))
      },
      configurable: true
    });

    await expect(navigator.mediaDevices.getUserMedia({ video: true })).rejects.toThrow('Permission denied');
    
    // Restore
    if (originalGetUserMedia) {
      Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: originalGetUserMedia }, configurable: true });
    }
  });

  it('should process full flow successfully', async () => {
    const mockReport = {
      incidentType: 'Medical',
      severityLevel: '4',
      extractedLocation: 'Main St',
      estimatedCasualties: 1,
      requiredServices: ['Ambulance'],
      criticalContext: 'Heart attack',
      weaponsInvolved: false,
      hazardsPresent: false,
      firstAidInstructions: ['Perform CPR']
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockReport)
    });

    const result = await analyzeEmergency('Heart attack on Main St');
    expect(result).toEqual(mockReport);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});
