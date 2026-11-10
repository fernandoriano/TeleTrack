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


function getLocalDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getLocalTime() {
  const now = new Date();

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  return `${hours}:${minutes}`;
}


function buildIsoDateTime(
  date,
  time
) {
  return new Date(
    `${date}T${time}:00`
  ).toISOString();
}


export default function ClientMap() {
  const [
    vehicles,
    setVehicles
  ] = useState([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId
  ] = useState("");

  const [
    location,
    setLocation
  ] = useState(null);

  const [
    routePoints,
    setRoutePoints
  ] = useState([]);

  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    getLocalDate()
  );

  const [
    startTime,
    setStartTime
  ] = useState("00:00");

  const [
    endTime,
    setEndTime
  ] = useState(
    getLocalTime()
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    searchLoading,
    setSearchLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");


  const selectedVehicle =
    vehicles.find(
      (vehicle) =>
        vehicle.id ===
        Number(selectedVehicleId)
    ) || null;


  useEffect(() => {
    loadVehicles();
  }, []);


  useEffect(() => {
    if (selectedVehicleId) {
      loadVehicleData(
        selectedVehicleId
      );
    }
  }, [selectedVehicleId]);


  async function loadVehicles() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getVehicles();

      setVehicles(data);

      if (data.length > 0) {
        setSelectedVehicleId(
          String(data[0].id)
        );
      }

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar tus vehículos."
      );

    } finally {
      setLoading(false);
    }
  }


  async function loadVehicleData(
    vehicleId
  ) {
    setSearchLoading(true);
    setError("");

    let latestLocation = null;
    let historyLocations = [];


    try {
      try {
        latestLocation =
          await getLatestLocation(
            vehicleId
          );

      } catch {
        latestLocation = null;
      }


      const start =
        buildIsoDateTime(
          selectedDate,
          startTime
        );

      const end =
        buildIsoDateTime(
          selectedDate,
          endTime
        );


      if (
        new Date(start) >=
        new Date(end)
      ) {
        throw new Error(
          "La hora inicial debe ser menor que la hora final."
        );
      }


      try {
        const history =
          await getVehicleHistory(
            vehicleId,
            start,
            end
          );

        historyLocations =
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

      } catch {
        historyLocations = [];
      }


      setRoutePoints(
        historyLocations
      );


      if (
        !latestLocation &&
        historyLocations.length > 0
      ) {
        latestLocation =
          historyLocations[
            historyLocations.length - 1
          ];
      }


      setLocation(
        latestLocation
      );


      if (
        !latestLocation &&
        historyLocations.length === 0
      ) {
        setError(
          "No se encontraron posiciones para este vehículo en el rango seleccionado."
        );
      }

    } catch (error) {
      setLocation(null);
      setRoutePoints([]);

      setError(
        error.message ||
        "No fue posible consultar el recorrido."
      );

    } finally {
      setSearchLoading(false);
    }
  }


  function handleVehicleChange(
    event
  ) {
    setSelectedVehicleId(
      event.target.value
    );
  }


  function handleSearch(
    event
  ) {
    event.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    loadVehicleData(
      selectedVehicleId
    );
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
            Seguimiento y recorrido
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta la ubicación y el recorrido
            de tus vehículos por fecha y rango
            horario.
          </p>
        </div>


        {loading && (
          <div>
            Cargando vehículos...
          </div>
        )}


        {!loading &&
          vehicles.length > 0 && (
            <form
              onSubmit={handleSearch}
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "22px"
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px"
                }}
              >
                <div>
                  <label
                    htmlFor="vehicle"
                    style={labelStyle}
                  >
                    Vehículo
                  </label>

                  <select
                    id="vehicle"
                    value={
                      selectedVehicleId
                    }
                    onChange={
                      handleVehicleChange
                    }
                    style={inputStyle}
                  >
                    {
                      vehicles.map(
                        (vehicle) => (
                          <option
                            key={
                              vehicle.id
                            }
                            value={
                              vehicle.id
                            }
                          >
                            {
                              vehicle.vehicle_code
                            }
                            {" - "}
                            {
                              vehicle.plate ||
                              "Sin placa"
                            }
                          </option>
                        )
                      )
                    }
                  </select>
                </div>


                <div>
                  <label
                    htmlFor="date"
                    style={labelStyle}
                  >
                    Fecha
                  </label>

                  <input
                    id="date"
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={
                      (event) =>
                        setSelectedDate(
                          event.target.value
                        )
                    }
                    style={inputStyle}
                  />
                </div>


                <div>
                  <label
                    htmlFor="startTime"
                    style={labelStyle}
                  >
                    Hora inicial
                  </label>

                  <input
                    id="startTime"
                    type="time"
                    value={
                      startTime
                    }
                    onChange={
                      (event) =>
                        setStartTime(
                          event.target.value
                        )
                    }
                    style={inputStyle}
                  />
                </div>


                <div>
                  <label
                    htmlFor="endTime"
                    style={labelStyle}
                  >
                    Hora final
                  </label>

                  <input
                    id="endTime"
                    type="time"
                    value={
                      endTime
                    }
                    onChange={
                      (event) =>
                        setEndTime(
                          event.target.value
                        )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>


              <button
                type="submit"
                disabled={
                  searchLoading
                }
                style={{
                  marginTop: "18px",
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "9px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor:
                    searchLoading
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {
                  searchLoading
                    ? "Consultando..."
                    : "Consultar recorrido"
                }
              </button>
            </form>
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
          vehicles.length === 0 && (
            <div
              style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0"
              }}
            >
              No tienes vehículos autorizados.
            </div>
          )}


        {selectedVehicle &&
          location && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "14px",
                  marginBottom: "20px"
                }}
              >
                <InfoCard
                  label="Vehículo"
                  value={
                    selectedVehicle.vehicle_code
                  }
                />

                <InfoCard
                  label="Posiciones"
                  value={
                    routePoints.length
                  }
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
                  label="Altitud"
                  value={
                    location.altitude ??
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


              <div
                style={{
                  padding:
                    "12px 14px",
                  marginBottom: "12px",
                  borderRadius: "10px",
                  background:
                    routePoints.length >= 2
                      ? "#eff6ff"
                      : "#f8fafc",
                  color:
                    routePoints.length >= 2
                      ? "#1d4ed8"
                      : "#64748b",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                {
                  routePoints.length >= 2
                    ? `Se encontraron ${routePoints.length} posiciones. La línea azul representa el recorrido del vehículo durante el periodo seleccionado.`
                    : routePoints.length === 1
                      ? "Solo existe una posición en este periodo. Se necesitan al menos dos posiciones para dibujar una ruta."
                      : "No existen posiciones dentro del periodo seleccionado. Se muestra únicamente la última ubicación conocida."
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
                  selectedVehicle.vehicle_code
                }
                plate={
                  selectedVehicle.plate
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
                Última posición conocida:{" "}
                {
                  new Date(
                    location.timestamp
                  ).toLocaleString()
                }
              </div>


              {routePoints.length > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Inicio del recorrido consultado:{" "}
                  {
                    new Date(
                      routePoints[0]
                        .timestamp
                    ).toLocaleString()
                  }

                  {" — "}

                  Fin del recorrido consultado:{" "}

                  {
                    new Date(
                      routePoints[
                        routePoints.length - 1
                      ].timestamp
                    ).toLocaleString()
                  }
                </div>
              )}
            </>
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
        background: "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px"
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          marginBottom: "7px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "20px",
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


const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: 600,
  color: "#475569"
};


const inputStyle = {
  width: "100%",
  padding: "11px",
  boxSizing: "border-box",
  borderRadius: "9px",
  border:
    "1px solid #cbd5e1",
  background: "#ffffff"
};