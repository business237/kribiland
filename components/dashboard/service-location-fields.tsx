'use client';

import { useState } from 'react';
import { LocationPicker } from '@/components/shared/location-picker';

interface ServiceLocationFieldsProps {
  initialLat?: number | null;
  initialLng?: number | null;
}

export function ServiceLocationFields({ initialLat = null, initialLng = null }: ServiceLocationFieldsProps) {
  const [latitude, setLatitude] = useState<number | null>(initialLat);
  const [longitude, setLongitude] = useState<number | null>(initialLng);

  return (
    <div className="space-y-3">
      <LocationPicker
        initialLat={latitude}
        initialLng={longitude}
        onChange={({ lat, lng }) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
      />
      <input type="hidden" name="latitude" value={latitude ?? ''} />
      <input type="hidden" name="longitude" value={longitude ?? ''} />
    </div>
  );
}