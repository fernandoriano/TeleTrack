import {
  useEffect
} from "react";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap
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


function FitMapToRoute({
  positions,
  fallbackPosition
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length >= 2) {
      const bounds =
        L.latLngBounds(positions);

      map.fitBounds(
        bounds,
        {
          padding: [35, 35],
          maxZoom: 17
        }
      );

      return;
    }

    if (fallbackPosition) {
      map.setView(
        fallbackPosition,
        15
      );
    }
  }, [
    map,
    positions,
    fallbackPosition
  ]);

  return null;
}


export default function VehicleMap({
  latitude,
  longitude,
  vehicleCode,
  plate,
  speed,
  altitude,
  routePoints = []
}) {
  const position = [
    Number(latitude),
    Number(longitude)
  ];


  const validRoutePoints =
    routePoints
      .map((point) => ({
        ...point,
        latitude:
          Number(point.latitude),
        longitude:
          Number(point.longitude)
      }))
      .filter(
        (point) =>
          Number.isFinite(
            point.latitude
          ) &&
          Number.isFinite(
            point.longitude
          )
      );


  const routePositions =
    validRoutePoints.map(
      (point) => [
        point.latitude,
        point.longitude
      ]
    );


  const firstPoint =
    validRoutePoints.length > 0
      ? validRoutePoints[0]
      : null;


  return (
    <div
      style={{
        width: "100%",
        height: "420px",
        borderRadius: "14px",
        overflow: "hidden",
        border:
          "1px solid #e2e8f0"
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


        <FitMapToRoute
          positions={routePositions}
          fallbackPosition={position}
        />


        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: "#2563eb",
              weight: 5,
              opacity: 0.85
            }}
          />
        )}


        {firstPoint && (
          <CircleMarker
            center={[
              firstPoint.latitude,
              firstPoint.longitude
            ]}
            radius={9}
            pathOptions={{
              color: "#166534",
              fillColor: "#22c55e",
              fillOpacity: 1,
              weight: 3
            }}
          >
            <Popup>
              <div>
                <strong>
                  Inicio de la ruta de hoy
                </strong>

                {firstPoint.timestamp && (
                  <>
                    <br />

                    {new Date(
                      firstPoint.timestamp
                    ).toLocaleString()}
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )}


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
                plate ||
                "Sin placa"
              }

              <br />

              Velocidad: {
                speed ?? "—"
              }

              <br />

              Altitud: {
                altitude ?? "—"
              }

              <br />

              <strong>
                Posición actual
              </strong>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}