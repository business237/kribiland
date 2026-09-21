'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Property } from '@/types';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  className?: string;
}

// Fonction de dispersion déterministe pour les logements sans coordonnées explicites
function getCoordinates(property: Property): [number, number] {
  if (property.latitude && property.longitude) {
    return [property.latitude, property.longitude];
  }
  // Coordonnées de base pour Kribi
  const baseLat = 2.9333;
  const baseLng = 9.9167;
  let hash = 0;
  for (let i = 0; i < property.id.length; i++) {
    hash = property.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const offsetLat = (((Math.abs(hash) % 100) - 50) / 100) * 0.04;
  const offsetLng = (((Math.abs(hash * 3) % 100) - 50) / 100) * 0.04;
  return [baseLat + offsetLat, baseLng + offsetLng];
}

function InnerMap({ properties, height = '500px', className = '' }: PropertyMapProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  if (!L) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-3xl bg-navy/5 flex items-center justify-center text-navy/40 text-sm font-medium ${className}`}
      >
        Chargement de la carte de Kribi…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');

  const createPriceIcon = (price: number) => {
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `
        <div class="bg-navy text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-sun hover:bg-sun transition-colors whitespace-nowrap cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
          ${price ? price.toLocaleString('fr-FR') : '—'} FCFA
        </div>
      `,
      iconSize: [90, 30],
      iconAnchor: [45, 15],
    });
  };

  const center: [number, number] = [2.9333, 9.9167];

  return (
    <div style={{ height }} className={`w-full rounded-3xl overflow-hidden shadow-md border border-navy/10 relative z-0 ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => {
          const coords = getCoordinates(property);
          return (
            <Marker
              key={property.id}
              position={coords}
              icon={createPriceIcon(property.pricePerNight)}
            >
              <Popup className="property-popup">
                <div className="w-56 p-1 space-y-2">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="h-28 w-full object-cover rounded-xl"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sun">
                      {property.type}
                    </span>
                    <h4 className="font-bold text-navy text-sm line-clamp-1">
                      {property.name}
                    </h4>
                    <p className="text-xs text-navy/60">{property.location}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-navy/10">
                    <span className="font-bold text-navy text-xs">
                      {property.pricePerNight != null ? `${property.pricePerNight.toLocaleString('fr-FR')} FCFA` : null}{property.pricePerNight != null && <span className="font-normal text-navy/50"> / nuit</span>}
                    </span>
                    <a
                      href={`/logements/${property.id}`}
                      className="text-xs font-bold text-sun hover:underline"
                    >
                      Voir →
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Wrapper Dynamic SSR = false
export const PropertyMap = dynamic(() => Promise.resolve(InnerMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-3xl bg-navy/5 flex items-center justify-center text-navy/40 text-sm font-medium">
      Chargement de la carte de Kribi…
    </div>
  ),
});
