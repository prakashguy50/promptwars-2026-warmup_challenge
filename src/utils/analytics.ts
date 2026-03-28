/**
 * Utility to track Google Analytics events safely.
 * @param eventName The name of the event to track.
 * @param eventParams Additional parameters for the event.
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
};
