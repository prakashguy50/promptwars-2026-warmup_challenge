import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { EmergencyReport, GeoLocation } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/**
 * Saves an emergency report to Firestore.
 * @param {string} userId - The ID of the reporting user.
 * @param {GeoLocation | null} location - The user's location.
 * @param {EmergencyReport} analysis - The structured emergency report.
 * @returns {Promise<void>}
 * @throws {Error} If database connection is missing or write fails.
 */
export const saveEmergencyReport = async (
  userId: string,
  location: GeoLocation | null,
  analysis: EmergencyReport
): Promise<void> => {
  if (!db) {
    throw new Error('Database connection is missing. Cannot save report.');
  }

  await addDoc(collection(db, 'incidents'), {
    reporterId: userId,
    timestamp: serverTimestamp(),
    coordinates: location ? { lat: location.latitude, lng: location.longitude } : null,
    structuredData: analysis,
    status: 'pending'
  });
};
