import React from 'react';
import MapPinIcon from 'remixicon-react/MapPinLineIcon';

interface LocationMarkerProps {
  lat?: number;
  lng?: number;
  isShop?: boolean;
  className?: string;
}

export default function LocationMarker({ isShop, className }: LocationMarkerProps) {
  return (
    <div className={className}>
      <MapPinIcon size={24} color={isShop ? 'var(--dark)' : 'var(--primary)'} />
    </div>
  );
}