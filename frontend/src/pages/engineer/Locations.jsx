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
  getLatestLocation
} from "../../services/telemetryService";


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

      const results =
        await Promise.all(
          vehicles.map(
            async (vehicle) => {
              try {
                const location =
                  await getLatestLocation(
                    vehicle.id
                  );

                return {
                  vehicle,
                  location
                };

              } catch {
                return {
                  vehicle,
                  location: null
                };
              }
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
            Consulta la última ubicación registrada
            de cada vehículo autorizado.
          </p>
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
                border: "1px solid #e2e8f0"
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
              location
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
                    alignItems: "flex-start",
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
                      padding: "7px 12px",
                      borderRadius: "999px",
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
                      borderRadius: "12px",
                      background: "#f8fafc",
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
