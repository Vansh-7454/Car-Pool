import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export function TrackingMap({ position, height = 260 }) {
  if (!position) return <p className="text-xs text-slate-500">Waiting for location updates...</p>;

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position.lat, position.lng]} />
      </MapContainer>
    </div>
  );
}