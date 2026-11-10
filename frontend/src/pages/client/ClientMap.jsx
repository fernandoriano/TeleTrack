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


function getCurrentTime() {
  const now = new Date();

  const hour =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  return `${hour}:${minute}`;
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
    latestLocation,
    setLatestLocation
  ] = useState(null);

  const [
    routePoints,
    setRoutePoints
  ] = useState([]);

  const [
    date,
    setDate
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
    getCurrentTime()
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    routeLoading,
    setRouteLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    message,
    setMessage
  ] = useState("");

  const [
    lastRefresh,
    setLastRefresh
  ] = useState(null);


  useEffect(() => {
    loadVehicles();
  }, []);


  async function loadVehicles() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getVehicles();

      setVehicles(data);

      if (data.length > 0) {
        const firstVehicleId =
          String(data[0].id);

        setSelectedVehicleId(
          firstVehicleId
        );

        await loadLatestLocation(
          firstVehicleId
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


  async function loadLatestLocation(
    vehicleId
  ) {
    if (!vehicleId) {
      return;
    }

    setRefreshing(true);
    setError("");
    setMessage("");

    try {
      const location =
        await getLatestLocation(
          vehicleId
        );

      setLatestLocation(
        location
      );

      /*
       * Al actualizar la ubicación actual,
       * limpiamos una ruta histórica anterior.
       */
      setRoutePoints([]);

      setLastRefresh(
        new Date()
      );

      setMessage(
        "Ubicación actualizada correctamente."
      );

    } catch (error) {
      setLatestLocation(null);

      setError(
        error.message ||
        "No fue posible consultar la ubicación actual."
      );

    } finally {
      setRefreshing(false);
    }
  }


  async function handleVehicleChange(
    event
  ) {
    const vehicleId =
      event.target.value;

    setSelectedVehicleId(
      vehicleId
    );

    setLatestLocation(null);
    setRoutePoints([]);
    setMessage("");
    setError("");

    await loadLatestLocation(
      vehicleId
    );
  }


  async function handleRefresh() {
    await loadLatestLocation(
      selectedVehicleId
    );
  }


  async function handleRouteSearch(
    event
  ) {
    event.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    setRouteLoading(true);
    setError("");
    setMessage("");

    try {
      const start =
        buildIsoDateTime(
          date,
          startTime
        );

      const end =
        buildIsoDateTime(
          date,
          endTime
        );

      if (
        new Date(start) >=
        new Date(end)
      ) {
        throw new Error(
          "La hora inicial debe ser anterior a la hora final."
        );
      }

      const history =
        await getVehicleHistory(
          selectedVehicleId,
          start,
          end
        );

      const locations =
        Array.isArray(
          history.locations
        )
          ? history.locations
          : [];

      const sortedLocations =
        [...locations].sort(
          (a, b) =>
            new Date(
              a.timestamp
            ) -
            new Date(
              b.timestamp
            )
        );

      setRoutePoints(
        sortedLocations
      );

      if (
        sortedLocations.length > 0
      ) {
        setMessage(
          `Recorrido encontrado: ${sortedLocations.length} posiciones registradas.`
        );
      } else {
        setMessage(
          "No se encontraron posiciones en el rango seleccionado."
        );
      }

    } catch (error) {
      setRoutePoints([]);

      setError(
        error.message ||
        "No fue posible consultar el recorrido."
      );

    } finally {
      setRouteLoading(false);
    }
  }


  const selectedVehicle =
    vehicles.find(
      (vehicle) =>
        String(vehicle.id) ===
        String(
          selectedVehicleId
        )
    );


  /*
   * Si estamos viendo un recorrido histórico,
   * utilizamos como marcador principal el último
   * punto de ese recorrido.
   *
   * Si no hay recorrido, mostramos la última
   * ubicación actual conocida.
   */
  const displayLocation =
    routePoints.length > 0
      ? routePoints[
          routePoints.length - 1
        ]
      : latestLocation;


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
            Mapa
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta la ubicación actual
            y los recorridos registrados
            de tus vehículos autorizados.
          </p>
        </div>


        {loading && (
          <div>
            Cargando vehículos...
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


        {message && (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "#eff6ff",
              color: "#1d4ed8",
              marginBottom: "18px"
            }}
          >
            {message}
          </div>
        )}


        {!loading &&
          vehicles.length === 0 && (
            <div
              style={{
                padding: "20px",
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "14px"
              }}
            >
              No tienes vehículos
              asignados.
            </div>
          )}


        {!loading &&
          vehicles.length > 0 && (
            <>

              <div
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "20px"
                }}
              >

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(220px, 1fr) auto",
                    gap: "14px",
                    alignItems: "end"
                  }}
                >

                  <div>
                    <label
                      htmlFor="vehicle"
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: 600
                      }}
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
                      style={
                        inputStyle
                      }
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


                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    style={{
                      border: "none",
                      borderRadius: "9px",
                      padding:
                        "12px 18px",
                      minHeight: "44px",
                      cursor:
                        refreshing
                          ? "not-allowed"
                          : "pointer",
                      background:
                        "#2563eb",
                      color:
                        "#ffffff",
                      fontWeight: 700
                    }}
                  >
                    {
                      refreshing
                        ? "Actualizando..."
                        : "↻ Actualizar ubicación"
                    }
                  </button>

                </div>


                {lastRefresh && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#64748b",
                      fontSize: "13px"
                    }}
                  >
                    Última consulta:{" "}
                    {
                      lastRefresh
                        .toLocaleString()
                    }
                  </div>
                )}

              </div>


              <form
                onSubmit={
                  handleRouteSearch
                }
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "20px"
                }}
              >

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "18px"
                  }}
                >
                  Consultar recorrido
                </h3>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "14px"
                  }}
                >

                  <div>
                    <label
                      htmlFor="date"
                      style={
                        labelStyle
                      }
                    >
                      Fecha
                    </label>

                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={
                        (event) =>
                          setDate(
                            event.target.value
                          )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </div>


                  <div>
                    <label
                      htmlFor="startTime"
                      style={
                        labelStyle
                      }
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
                      style={
                        inputStyle
                      }
                    />
                  </div>


                  <div>
                    <label
                      htmlFor="endTime"
                      style={
                        labelStyle
                      }
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
                      style={
                        inputStyle
                      }
                    />
                  </div>

                </div>


                <button
                  type="submit"
                  disabled={
                    routeLoading
                  }
                  style={{
                    marginTop: "18px",
                    border: "none",
                    borderRadius: "9px",
                    padding:
                      "12px 18px",
                    cursor:
                      routeLoading
                        ? "not-allowed"
                        : "pointer",
                    background:
                      "#2563eb",
                    color:
                      "#ffffff",
                    fontWeight: 700
                  }}
                >
                  {
                    routeLoading
                      ? "Consultando..."
                      : "Consultar recorrido"
                  }
                </button>

              </form>


              {displayLocation && (
                <>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "14px",
                      marginBottom: "20px"
                    }}
                  >

                    <InfoCard
                      label="Vehículo"
                      value={
                        selectedVehicle
                          ?.vehicle_code ||
                        "—"
                      }
                    />

                    <InfoCard
                      label="Posiciones"
                      value={
                        routePoints.length > 0
                          ? routePoints.length
                          : 1
                      }
                    />

                    <InfoCard
                      label="Velocidad"
                      value={
                        displayLocation
                          .speed ??
                        "—"
                      }
                      unit="km/h"
                    />

                    <InfoCard
                      label="Altitud"
                      value={
                        displayLocation
                          .altitude ??
                        "—"
                      }
                      unit="m"
                    />

                    <InfoCard
                      label="Rumbo"
                      value={
                        displayLocation
                          .heading ??
                        "—"
                      }
                      unit="°"
                    />

                  </div>


                  <VehicleMap
                    latitude={
                      displayLocation
                        .latitude
                    }
                    longitude={
                      displayLocation
                        .longitude
                    }
                    vehicleCode={
                      selectedVehicle
                        ?.vehicle_code
                    }
                    plate={
                      selectedVehicle
                        ?.plate
                    }
                    speed={
                      displayLocation
                        .speed
                    }
                    altitude={
                      displayLocation
                        .altitude
                    }
                    routePoints={
                      routePoints
                    }
                  />


                  <div
                    style={{
                      marginTop: "14px",
                      color: "#64748b",
                      fontSize: "13px",
                      textAlign: "center"
                    }}
                  >
                    {
                      routePoints.length > 0
                        ? (
                          `Último punto del recorrido: ${
                            new Date(
                              displayLocation
                                .timestamp
                            ).toLocaleString()
                          }`
                        )
                        : (
                          `Última posición conocida: ${
                            new Date(
                              displayLocation
                                .timestamp
                            ).toLocaleString()
                          }`
                        )
                    }
                  </div>

                </>
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
          fontSize: "19px",
          fontWeight: 700,
          overflowWrap:
            "anywhere"
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
  fontWeight: 600
};


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border:
    "1px solid #cbd5e1",
  borderRadius: "9px",
  padding: "11px 12px",
  background: "#ffffff",
  fontSize: "14px"
};