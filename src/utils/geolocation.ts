/**
 * Interface for geolocation coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Gets the user's current geolocation.
 * @returns {Promise<Coordinates>} The user's coordinates.
 * @throws {Error} If geolocation is not supported or permission is denied.
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
