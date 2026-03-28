import { GoogleGenAI, Type } from '@google/genai';
import { EmergencyReport } from '../types';

/**
 * Initialize the Gemini API client
 */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Analyzes multimodal emergency input and returns a structured report.
 * @param {string} text - User provided text description.
 * @param {string} [audioBase64] - Base64 encoded audio recording.
 * @param {string} [imageBase64] - Base64 encoded image.
 * @returns {Promise<EmergencyReport>} The structured emergency report.
 * @throws {Error} If analysis fails or no input is provided.
 */
export const analyzeEmergency = async (
  text: string,
  audioBase64?: string,
  imageBase64?: string
): Promise<EmergencyReport> => {
  try {
    const parts: any[] = [];

    if (text) {
      parts.push({ text });
    }

    if (audioBase64) {
      const base64Data = audioBase64.split(',')[1] || audioBase64;
      parts.push({
        inlineData: {
          mimeType: 'audio/webm',
          data: base64Data,
        },
      });
    }

    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
    }

    if (parts.length === 0) {
      throw new Error('No input provided for analysis. Please provide text, audio, or an image.');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-preview',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        systemInstruction: 'You are an expert emergency dispatcher and first responder AI. Analyze the provided text, audio, and/or image to extract critical emergency details. Provide verified, step-by-step first aid instructions suitable for a bystander based on the incident type and severity. Be concise, accurate, and prioritize life-saving actions. Use Google Search to verify the latest first aid protocols.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            incidentType: { type: Type.STRING, description: 'Medical, Fire, Police, Rescue, or Other' },
            severityLevel: { type: Type.STRING, description: '1 (Low) to 5 (Critical)' },
            extractedLocation: { type: Type.STRING, description: 'Location mentioned in the input, if any' },
            estimatedCasualties: { type: Type.NUMBER, description: 'Estimated number of people injured' },
            requiredServices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of required services e.g., Ambulance, Firetruck, Police',
            },
            criticalContext: { type: Type.STRING, description: 'Short, 2-sentence summary of the immediate danger' },
            weaponsInvolved: { type: Type.BOOLEAN, description: 'True if weapons are mentioned or visible' },
            hazardsPresent: { type: Type.BOOLEAN, description: 'True if environmental hazards (fire, chemicals, traffic) are present' },
            firstAidInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step verified first aid instructions for the bystander',
            },
          },
          required: [
            'incidentType',
            'severityLevel',
            'extractedLocation',
            'estimatedCasualties',
            'requiredServices',
            'criticalContext',
            'weaponsInvolved',
            'hazardsPresent',
            'firstAidInstructions',
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error('Failed to generate emergency report from AI.');
    }

    return JSON.parse(response.text) as EmergencyReport;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred during analysis.');
  }
};
