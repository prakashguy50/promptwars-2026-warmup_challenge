/**
 * Utility to track Google Analytics events safely.
 * @param {string} eventName - The name of the event to track.
 * @param {Record<string, any>} [eventParams] - Additional parameters for the event.
 * @returns {void}
 * @throws {Error} Never throws (errors are caught internally).
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventParams);
    }
  } catch (error) {
    // Silently fail for analytics to prevent app crashes
  }
};
