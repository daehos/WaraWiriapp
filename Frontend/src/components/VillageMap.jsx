import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="#2f5d42"/>
    <circle cx="16" cy="16" r="6" fill="#fbf7ee"/>
  </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
})

export default function VillageMap({ position, name, address, linkHref }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-forest-100">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        className="h-80 w-full sm:h-96"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={pinIcon}>
          <Popup>
            <strong>{name}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
      {linkHref && (
        <a
          href={linkHref}
          target="_blank"
          rel="noreferrer"
          className="block bg-forest-50 px-4 py-3 text-center text-sm font-semibold text-forest-700 hover:bg-forest-100"
        >
          Buka di Google Maps
        </a>
      )}
    </div>
  )
}
