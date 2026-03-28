import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

// Mock the @google/genai module
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

import { analyzeEmergency } from '../services/gemini';

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when no input is provided', async () => {
    await expect(analyzeEmergency('', undefined, undefined)).rejects.toThrow('No input provided for analysis.');
  });

  it('should parse structured output correctly when API succeeds', async () => {
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

  it('should throw error when API fails to return text', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: null });
    await expect(analyzeEmergency('test')).rejects.toThrow('Failed to generate emergency report.');
  });

  it('should throw error when API call rejects', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));
    await expect(analyzeEmergency('test')).rejects.toThrow('Network error');
  });

  it('should correctly format multimodal payload with text, audio, and image', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: '{}' });
    await analyzeEmergency('test text', 'data:audio/webm;base64,audio123', 'data:image/jpeg;base64,image123');
    
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents.parts).toHaveLength(3);
    expect(callArgs.contents.parts[0]).toEqual({ text: 'test text' });
    expect(callArgs.contents.parts[1].inlineData.data).toBe('audio123');
    expect(callArgs.contents.parts[2].inlineData.data).toBe('image123');
  });
});
