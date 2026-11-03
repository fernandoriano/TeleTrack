import {
  MapContainer,
  Marker,
  Popup,
  TileLayer
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon2x
  from "leaflet/dist/images/marker-icon-2x.png";

import markerIcon
  from "leaflet/dist/images/marker-icon.png";

import markerShadow
  from "leaflet/dist/images/marker-shadow.png";


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});


export default function VehicleMap({
  latitude,
  longitude,
  vehicleCode,
  plate,
  speed,
  altitude
}) {
  const position = [
    latitude,
    longitude
  ];


  return (
    <div
      style={{
        width: "100%",
        height: "420px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid #e2e8f0"
      }}
    >
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
        >
          <Popup>
            <div>
              <strong>
                {vehicleCode}
              </strong>

              <br />

              Placa: {
                plate || "Sin placa"
              }

              <br />

              Velocidad: {
                speed ?? "—"
              }

              <br />

              Altitud: {
                altitude ?? "—"
              }
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}