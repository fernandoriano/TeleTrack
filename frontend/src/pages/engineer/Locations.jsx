import {
  useEffect,
  useState
} from "react";

import AppLayout
  from "../../components/layout/AppLayout";

import VehicleMap
  from "../../components/vehicles/VehicleMap";

import {
  getVehicles
} from "../../services/vehicleService";

import {
  getLatestLocation,
  getVehicleHistory
} from "../../services/telemetryService";


function getTodayRange() {
  const now =
    new Date();

  const start =
    new Date(now);

  start.setHours(
    0,
    0,
    0,
    0
  );

  return {
    start:
      start.toISOString(),

    end:
      now.toISOString()
  };
}


export default function Locations() {
  const [
    locations,
    setLocations
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {
    loadLocations();
  }, []);


  async function loadLocations() {
    setLoading(true);
    setError("");

    try {
      const vehicles =
        await getVehicles();

      const {
        start,
        end
      } = getTodayRange();


      const results =
        await Promise.all(
          vehicles.map(
            async (vehicle) => {
              let location = null;
              let history = null;


              try {
                location =
                  await getLatestLocation(
                    vehicle.id
                  );

              } catch {
                location = null;
              }


              try {
                history =
                  await getVehicleHistory(
                    vehicle.id,
                    start,
                    end
                  );

              } catch {
                history = null;
              }


              const routePoints =
                Array.isArray(
                  history?.locations
                )
                  ? [
                      ...history.locations
                    ].sort(
                      (a, b) =>
                        new Date(
                          a.timestamp
                        ) -
                        new Date(
                          b.timestamp
                        )
                    )
                  : [];


              return {
                vehicle,
                location,
                routePoints
              };
            }
          )
        );


      setLocations(results);

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar las ubicaciones."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <AppLayout>
      <section>
        <div
          style={{
            marginBottom: "24px"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "28px"
            }}
          >
            Ubicaciones
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta la ubicación actual y la
            ruta recorrida durante el día por
            cada vehículo autorizado.
          </p>


          <button
            type="button"
            onClick={loadLocations}
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "9px 14px",
              border: "none",
              borderRadius: "9px",
              fontWeight: 700,
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              background: "#2563eb",
              color: "#ffffff"
            }}
          >
            {
              loading
                ? "Actualizando..."
                : "Actualizar rutas"
            }
          </button>
        </div>


        {loading && (
          <div>
            Cargando ubicaciones...
          </div>
        )}


        {error && (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              marginBottom: "18px"
            }}
          >
            {error}
          </div>
        )}


        {!loading &&
          !error &&
          locations.length === 0 && (
            <div
              style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0"
              }}
            >
              No hay vehículos disponibles.
            </div>
          )}


        {!loading &&
          !error &&
          locations.map(
            ({
              vehicle,
              location,
              routePoints
            }) => (
              <article
                key={vehicle.id}
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "22px",
                  marginBottom: "24px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "16px",
                    marginBottom: "20px",
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700
                      }}
                    >
                      {
                        vehicle.vehicle_code
                      }
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        marginTop: "4px"
                      }}
                    >
                      {
                        vehicle.plate ||
                        "Sin placa"
                      }
                    </div>
                  </div>


                  <span
                    style={{
                      padding:
                        "7px 12px",
                      borderRadius:
                        "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      background:
                        vehicle.active
                          ? "#dcfce7"
                          : "#fee2e2",
                      color:
                        vehicle.active
                          ? "#166534"
                          : "#991b1b"
                    }}
                  >
                    {
                      vehicle.active
                        ? "Activo"
                        : "Inactivo"
                    }
                  </span>
                </div>


                {!location && (
                  <div
                    style={{
                      padding: "20px",
                      borderRadius:
                        "12px",
                      background:
                        "#f8fafc",
                      color: "#64748b"
                    }}
                  >
                    Este vehículo todavía no tiene
                    una ubicación registrada.
                  </div>
                )}


                {location && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "14px",
                        marginBottom: "22px"
                      }}
                    >
                      <InfoCard
                        label="Latitud"
                        value={
                          location.latitude
                        }
                      />

                      <InfoCard
                        label="Longitud"
                        value={
                          location.longitude
                        }
                      />

                      <InfoCard
                        label="Altitud"
                        value={
                          location.altitude ??
                          "—"
                        }
                        unit="m"
                      />

                      <InfoCard
                        label="Velocidad"
                        value={
                          location.speed ??
                          "—"
                        }
                        unit="km/h"
                      />

                      <InfoCard
                        label="Precisión"
                        value={
                          location.accuracy ??
                          "—"
                        }
                        unit="m"
                      />

                      <InfoCard
                        label="Rumbo"
                        value={
                          location.heading ??
                          "—"
                        }
                        unit="°"
                      />

                      <InfoCard
                        label="Puntos de ruta hoy"
                        value={
                          routePoints.length
                        }
                      />
                    </div>


                    <div
                      style={{
                        marginBottom: "12px",
                        padding:
                          "12px 14px",
                        borderRadius: "10px",
                        background:
                          routePoints.length >= 2
                            ? "#eff6ff"
                            : "#f8fafc",
                        color:
                          routePoints.length >= 2
                            ? "#1d4ed8"
                            : "#64748b",
                        fontSize: "14px",
                        fontWeight: 600
                      }}
                    >
                      {
                        routePoints.length >= 2
                          ? `Ruta de hoy: ${routePoints.length} posiciones conectadas en orden cronológico.`
                          : routePoints.length === 1
                            ? "Hoy solamente hay una posición registrada. Se necesitan al menos dos puntos para dibujar una ruta."
                            : "Todavía no hay posiciones registradas hoy para dibujar una ruta."
                      }
                    </div>


                    <VehicleMap
                      latitude={
                        location.latitude
                      }
                      longitude={
                        location.longitude
                      }
                      vehicleCode={
                        vehicle.vehicle_code
                      }
                      plate={
                        vehicle.plate
                      }
                      speed={
                        location.speed
                      }
                      altitude={
                        location.altitude
                      }
                      routePoints={
                        routePoints
                      }
                    />


                    <div
                      style={{
                        marginTop: "14px",
                        color: "#64748b",
                        fontSize: "13px"
                      }}
                    >
                      Última posición registrada:{" "}
                      {
                        new Date(
                          location.timestamp
                        ).toLocaleString()
                      }
                    </div>
                  </>
                )}
              </article>
            )
          )}
      </section>
    </AppLayout>
  );
}


function InfoCard({
  label,
  value,
  unit = ""
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border:
          "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "14px"
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          marginBottom: "6px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: 700
        }}
      >
        {value}
        {
          unit &&
          value !== "—"
            ? ` ${unit}`
            : ""
        }
      </div>
    </div>
  );
}