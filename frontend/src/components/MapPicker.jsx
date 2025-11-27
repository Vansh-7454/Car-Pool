import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function MapPicker({ label, value, onChange, height = 220 }) {
  const [center] = useState({ lat: value?.lat || 28.6139, lng: value?.lng || 77.209 });

  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-slate-700">{label}</p>}
      <div className="rounded-lg overflow-hidden border border-slate-200">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={12}
          style={{ height, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={onChange} />
          {value && value.lat && value.lng && (
            <Marker position={[value.lat, value.lng]} />
          )}
        </MapContainer>
      </div>
      {value && value.lat && value.lng && (
        <p className="text-[11px] text-slate-500">
          Selected: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}