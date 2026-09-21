'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

function InnerLocationPicker({ initialLat, initialLng, onChange }: LocationPickerProps) {
  const defaultLat = initialLat || 2.9333;
  const defaultLng = initialLng || 9.9167;

  const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange({ lat, lng });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      // Recherche Nominatim OpenStreetMap
      const query = searchQuery.toLowerCase().includes('kribi')
        ? searchQuery
        : `${searchQuery}, Kribi, Cameroun`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handlePositionChange(lat, lng);
      } else {
        setSearchError('Lieu non trouvé. Vous pouvez cliquer directement sur la carte.');
      }
    } catch {
      setSearchError('Erreur lors de la recherche. Utilisez la carte interactive.');
    } finally {
      setSearching(false);
    }
  };

  if (!L) {
    return (
      <div className="h-72 w-full rounded-2xl bg-navy/5 flex items-center justify-center text-navy/40 text-sm">
        Chargement de la carte de localisation…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet');

  // Composant pour écouter le clic sur la carte
  function MapEvents() {
    useMapEvents({
      click(e: any) {
        handlePositionChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const markerIcon = L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="w-8 h-8 rounded-full bg-sun border-2 border-white shadow-xl flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="space-y-3">
      {/* Barre de recherche d'adresse / quartier */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-navy/40 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une adresse ou un quartier à Kribi..."
            className="w-full rounded-xl border border-navy/10 pl-9 pr-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="bg-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-navy/90 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Localiser'}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
          ⚠️ {searchError}
        </p>
      )}

      {/* Carte cliquable */}
      <div className="h-72 w-full rounded-2xl overflow-hidden shadow-sm border border-navy/10 relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          <Marker position={position} icon={markerIcon} />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-navy/60 bg-navy/5 p-3 rounded-xl">
        <span className="flex items-center gap-1 font-semibold text-navy">
          <MapPin className="w-4 h-4 text-sun" />
          Point sélectionné :
        </span>
        <span className="font-mono text-navy/80">
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </span>
      </div>
    </div>
  );
}

export const LocationPicker = dynamic(() => Promise.resolve(InnerLocationPicker), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-2xl bg-navy/5 flex items-center justify-center text-navy/40 text-sm">
      Chargement du module de carte…
    </div>
  ),
});
