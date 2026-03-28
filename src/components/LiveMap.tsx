import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { GeoLocation } from '../types';

/**
 * Interface for the LiveMap component props.
 */
interface LiveMapProps {
  location: GeoLocation | null;
}

/**
 * Component to display the nearest hospitals on a Google Map.
 * @param {LiveMapProps} props - The component props.
 * @returns {JSX.Element} The rendered LiveMap component.
 */
export const LiveMap = ({ location }: LiveMapProps) => {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!location) {
    return (
      <section className="w-full max-w-md mx-auto p-4" aria-labelledby="map-heading">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-xl">
          <MapPin size={32} className="mx-auto text-zinc-600 mb-3" />
          <h2 id="map-heading" className="text-xl font-bold text-zinc-400 mb-2">Location Unavailable</h2>
          <p className="text-zinc-500 text-sm">Please enable location services to find nearest hospitals.</p>
        </div>
      </section>
    );
  }

  const { latitude, longitude } = location;
  const searchUrl = `https://www.google.com/maps/search/hospitals+near+${latitude},${longitude}`;

  return (
    <section className="w-full max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 contain-strict" aria-labelledby="hospitals-heading">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h2 id="hospitals-heading" className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Navigation size={24} className="text-red-500" />
            Nearest Hospitals
          </h2>
        </div>
        
        {apiKey ? (
          <div className="flex flex-col">
            <iframe
              title="Nearest Hospitals Map"
              aria-label="Interactive map showing nearest hospitals"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=hospitals+near+me&center=${latitude},${longitude}&zoom=14`}
            ></iframe>
            <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-center">
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center justify-center gap-2"
              >
                <Navigation size={16} />
                Open in Google Maps App
              </a>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-zinc-900 flex flex-col items-center justify-center min-h-[200px]">
            <MapPin size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 mb-4">Map embed requires API key.</p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors border border-zinc-700"
              aria-label="Open Google Maps to find hospitals"
            >
              Open in Google Maps
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
