import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import AppLayout
  from "../../components/layout/AppLayout";

import VehicleMap
  from "../../components/vehicles/VehicleMap";

import {
  getClients,
  getClientVehicles
} from "../../services/clientService";

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


function getDefaultFilter() {
  return {
    date: getLocalDate(),
    startTime: "00:00",
    endTime: getLocalTime()
  };
}


function buildIsoDateTime(
  date,
  time
) {
  return new Date(
    `${date}T${time}:00`
  ).toISOString();
}


export default function Clients() {
  const navigate =
    useNavigate();

  const [
    clients,
    setClients
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    expandedClients,
    setExpandedClients
  ] = useState({});

  const [
    vehiclesByClient,
    setVehiclesByClient
  ] = useState({});

  const [
    clientVehiclesLoading,
    setClientVehiclesLoading
  ] = useState({});

  const [
    expandedVehicles,
    setExpandedVehicles
  ] = useState({});

  const [
    filtersByVehicle,
    setFiltersByVehicle
  ] = useState({});

  const [
    vehicleData,
    setVehicleData
  ] = useState({});

  const [
    vehicleLoading,
    setVehicleLoading
  ] = useState({});

  const [
    vehicleErrors,
    setVehicleErrors
  ] = useState({});


  useEffect(() => {
    loadClients();
  }, []);


  async function loadClients() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getClients(true);

      setClients(data);

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar los clientes."
      );

    } finally {
      setLoading(false);
    }
  }


  function handleNewClient() {
    navigate(
      "/engineer/clients/new"
    );
  }


  async function toggleClient(
    clientId
  ) {
    const isOpen =
      Boolean(
        expandedClients[
          clientId
        ]
      );

    setExpandedClients(
      (previous) => ({
        ...previous,
        [clientId]:
          !isOpen
      })
    );


    if (
      !isOpen &&
      !vehiclesByClient[
        clientId
      ]
    ) {
      setClientVehiclesLoading(
        (previous) => ({
          ...previous,
          [clientId]: true
        })
      );

      try {
        const vehicles =
          await getClientVehicles(
            clientId
          );

        setVehiclesByClient(
          (previous) => ({
            ...previous,
            [clientId]:
              vehicles
          })
        );

      } catch (error) {
        setError(
          error.message ||
          "No fue posible cargar los vehículos del cliente."
        );

      } finally {
        setClientVehiclesLoading(
          (previous) => ({
            ...previous,
            [clientId]: false
          })
        );
      }
    }
  }


  async function toggleVehicle(
    vehicle
  ) {
    const vehicleId =
      vehicle.id;

    const isOpen =
      Boolean(
        expandedVehicles[
          vehicleId
        ]
      );


    setExpandedVehicles(
      (previous) => ({
        ...previous,
        [vehicleId]:
          !isOpen
      })
    );


    if (isOpen) {
      return;
    }


    if (
      !filtersByVehicle[
        vehicleId
      ]
    ) {
      setFiltersByVehicle(
        (previous) => ({
          ...previous,
          [vehicleId]:
            getDefaultFilter()
        })
      );
    }


    if (
      !vehicleData[
        vehicleId
      ]
    ) {
      await loadLatestVehicleData(
        vehicleId
      );
    }
  }


  async function loadLatestVehicleData(
    vehicleId
  ) {
    setVehicleLoading(
      (previous) => ({
        ...previous,
        [vehicleId]: true
      })
    );

    setVehicleErrors(
      (previous) => ({
        ...previous,
        [vehicleId]: ""
      })
    );


    try {
      const latest =
        await getLatestLocation(
          vehicleId
        );

      setVehicleData(
        (previous) => ({
          ...previous,
          [vehicleId]: {
            location:
              latest,
            routePoints: []
          }
        })
      );

    } catch (error) {
      setVehicleData(
        (previous) => ({
          ...previous,
          [vehicleId]: {
            location: null,
            routePoints: []
          }
        })
      );

      setVehicleErrors(
        (previous) => ({
          ...previous,
          [vehicleId]:
            error.message ||
            "Este vehículo todavía no tiene una ubicación registrada."
        })
      );

    } finally {
      setVehicleLoading(
        (previous) => ({
          ...previous,
          [vehicleId]: false
        })
      );
    }
  }


  function handleFilterChange(
    vehicleId,
    field,
    value
  ) {
    setFiltersByVehicle(
      (previous) => ({
        ...previous,

        [vehicleId]: {
          ...(
            previous[
              vehicleId
            ] ||
            getDefaultFilter()
          ),

          [field]:
            value
        }
      })
    );
  }


  async function handleSearch(
    event,
    vehicle
  ) {
    event.preventDefault();

    const vehicleId =
      vehicle.id;

    const filter =
      filtersByVehicle[
        vehicleId
      ] ||
      getDefaultFilter();


    setVehicleLoading(
      (previous) => ({
        ...previous,
        [vehicleId]: true
      })
    );

    setVehicleErrors(
      (previous) => ({
        ...previous,
        [vehicleId]: ""
      })
    );


    try {
      const start =
        buildIsoDateTime(
          filter.date,
          filter.startTime
        );

      const end =
        buildIsoDateTime(
          filter.date,
          filter.endTime
        );


      if (
        new Date(start) >=
        new Date(end)
      ) {
        throw new Error(
          "La hora inicial debe ser menor que la hora final."
        );
      }


      let latestLocation =
        null;

      let routePoints = [];


      try {
        latestLocation =
          await getLatestLocation(
            vehicleId
          );

      } catch {
        latestLocation =
          null;
      }


      try {
        const history =
          await getVehicleHistory(
            vehicleId,
            start,
            end
          );

        routePoints =
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
        routePoints = [];
      }


      if (
        !latestLocation &&
        routePoints.length > 0
      ) {
        latestLocation =
          routePoints[
            routePoints.length - 1
          ];
      }


      setVehicleData(
        (previous) => ({
          ...previous,

          [vehicleId]: {
            location:
              latestLocation,

            routePoints
          }
        })
      );


      if (
        !latestLocation &&
        routePoints.length === 0
      ) {
        setVehicleErrors(
          (previous) => ({
            ...previous,

            [vehicleId]:
              "No se encontraron posiciones para este vehículo en el periodo seleccionado."
          })
        );
      }

    } catch (error) {
      setVehicleErrors(
        (previous) => ({
          ...previous,

          [vehicleId]:
            error.message ||
            "No fue posible consultar el recorrido."
        })
      );

    } finally {
      setVehicleLoading(
        (previous) => ({
          ...previous,
          [vehicleId]: false
        })
      );
    }
  }


  return (
    <AppLayout>
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            marginBottom: "24px",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "28px"
              }}
            >
              Clientes
            </h2>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#64748b"
              }}
            >
              Consulta cada cliente,
              sus vehículos y los
              recorridos registrados.
            </p>
          </div>


          <button
            type="button"
            onClick={
              handleNewClient
            }
            style={{
              border: "none",
              borderRadius: "9px",
              padding: "12px 16px",
              fontWeight: 700,
              cursor: "pointer",
              background: "#2563eb",
              color: "#ffffff"
            }}
          >
            Nuevo cliente
          </button>
        </div>


        {loading && (
          <div>
            Cargando clientes...
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
          clients.length === 0 && (
            <div
              style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0"
              }}
            >
              No hay clientes registrados.
            </div>
          )}


        {!loading &&
          clients.map(
            (client) => {
              const clientOpen =
                Boolean(
                  expandedClients[
                    client.id
                  ]
                );

              const vehicles =
                vehiclesByClient[
                  client.id
                ] || [];


              return (
                <article
                  key={
                    client.id
                  }
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "16px",
                    marginBottom:
                      "18px",
                    overflow:
                      "hidden"
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "16px",
                      padding:
                        "20px",
                      flexWrap:
                        "wrap"
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "10px",
                          alignItems:
                            "center",
                          flexWrap:
                            "wrap"
                        }}
                      >
                        <strong
                          style={{
                            fontSize:
                              "20px"
                          }}
                        >
                          {
                            client.name
                          }
                        </strong>

                        <span
                          style={{
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                            fontWeight:
                              700,
                            background:
                              client.active
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              client.active
                                ? "#166534"
                                : "#991b1b"
                          }}
                        >
                          {
                            client.active
                              ? "Activo"
                              : "Inactivo"
                          }
                        </span>
                      </div>


                      <div
                        style={{
                          marginTop:
                            "6px",
                          color:
                            "#64748b",
                          fontSize:
                            "14px"
                        }}
                      >
                        Código:{" "}
                        {
                          client.client_code
                        }

                        {" · "}

                        Empresa:{" "}

                        {
                          client.company_name ||
                          "Sin empresa"
                        }
                      </div>


                      <div
                        style={{
                          marginTop:
                            "4px",
                          color:
                            "#64748b",
                          fontSize:
                            "13px"
                        }}
                      >
                        {
                          client.email ||
                          "Sin correo"
                        }

                        {
                          client.phone
                            ? ` · ${client.phone}`
                            : ""
                        }
                      </div>
                    </div>


                    <button
                      type="button"
                      onClick={
                        () =>
                          toggleClient(
                            client.id
                          )
                      }
                      style={{
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "9px",
                        padding:
                          "10px 14px",
                        background:
                          "#ffffff",
                        fontWeight:
                          700,
                        cursor:
                          "pointer"
                      }}
                    >
                      {
                        clientOpen
                          ? "Ocultar vehículos ▲"
                          : "Ver vehículos ▼"
                      }
                    </button>
                  </div>


                  {clientOpen && (
                    <div
                      style={{
                        borderTop:
                          "1px solid #e2e8f0",
                        background:
                          "#f8fafc",
                        padding:
                          "18px"
                      }}
                    >
                      {
                        clientVehiclesLoading[
                          client.id
                        ] && (
                          <div>
                            Cargando vehículos...
                          </div>
                        )
                      }


                      {!clientVehiclesLoading[
                        client.id
                      ] &&
                        vehicles.length === 0 && (
                          <div
                            style={{
                              padding:
                                "16px",
                              background:
                                "#ffffff",
                              borderRadius:
                                "10px",
                              color:
                                "#64748b"
                            }}
                          >
                            Este cliente no tiene
                            vehículos registrados.
                          </div>
                        )}


                      {!clientVehiclesLoading[
                        client.id
                      ] &&
                        vehicles.map(
                          (vehicle) => {
                            const vehicleOpen =
                              Boolean(
                                expandedVehicles[
                                  vehicle.id
                                ]
                              );

                            const filter =
                              filtersByVehicle[
                                vehicle.id
                              ] ||
                              getDefaultFilter();

                            const data =
                              vehicleData[
                                vehicle.id
                              ] || {
                                location:
                                  null,
                                routePoints:
                                  []
                              };

                            const currentError =
                              vehicleErrors[
                                vehicle.id
                              ];

                            const isLoading =
                              vehicleLoading[
                                vehicle.id
                              ];


                            return (
                              <div
                                key={
                                  vehicle.id
                                }
                                style={{
                                  background:
                                    "#ffffff",
                                  border:
                                    "1px solid #e2e8f0",
                                  borderRadius:
                                    "12px",
                                  marginBottom:
                                    "12px",
                                  overflow:
                                    "hidden"
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    justifyContent:
                                      "space-between",
                                    alignItems:
                                      "center",
                                    gap:
                                      "12px",
                                    padding:
                                      "16px",
                                    flexWrap:
                                      "wrap"
                                  }}
                                >
                                  <div>
                                    <strong>
                                      {
                                        vehicle.vehicle_code
                                      }
                                    </strong>

                                    {" — "}

                                    {
                                      vehicle.plate ||
                                      "Sin placa"
                                    }

                                    <div
                                      style={{
                                        color:
                                          "#64748b",
                                        fontSize:
                                          "13px",
                                        marginTop:
                                          "4px"
                                      }}
                                    >
                                      {
                                        vehicle.brand ||
                                        "Sin marca"
                                      }

                                      {
                                        vehicle.model
                                          ? ` ${vehicle.model}`
                                          : ""
                                      }
                                    </div>
                                  </div>


                                  <button
                                    type="button"
                                    onClick={
                                      () =>
                                        toggleVehicle(
                                          vehicle
                                        )
                                    }
                                    style={{
                                      border:
                                        "1px solid #cbd5e1",
                                      borderRadius:
                                        "8px",
                                      padding:
                                        "8px 12px",
                                      background:
                                        "#ffffff",
                                      cursor:
                                        "pointer",
                                      fontWeight:
                                        700
                                    }}
                                  >
                                    {
                                      vehicleOpen
                                        ? "Cerrar seguimiento ▲"
                                        : "Ver seguimiento ▼"
                                    }
                                  </button>
                                </div>


                                {vehicleOpen && (
                                  <div
                                    style={{
                                      borderTop:
                                        "1px solid #e2e8f0",
                                      padding:
                                        "18px"
                                    }}
                                  >
                                    <form
                                      onSubmit={
                                        (event) =>
                                          handleSearch(
                                            event,
                                            vehicle
                                          )
                                      }
                                    >
                                      <div
                                        style={{
                                          display:
                                            "grid",
                                          gridTemplateColumns:
                                            "repeat(auto-fit, minmax(160px, 1fr))",
                                          gap:
                                            "14px"
                                        }}
                                      >
                                        <div>
                                          <label
                                            style={
                                              labelStyle
                                            }
                                          >
                                            Fecha
                                          </label>

                                          <input
                                            type="date"
                                            value={
                                              filter.date
                                            }
                                            onChange={
                                              (event) =>
                                                handleFilterChange(
                                                  vehicle.id,
                                                  "date",
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
                                            style={
                                              labelStyle
                                            }
                                          >
                                            Hora inicial
                                          </label>

                                          <input
                                            type="time"
                                            value={
                                              filter.startTime
                                            }
                                            onChange={
                                              (event) =>
                                                handleFilterChange(
                                                  vehicle.id,
                                                  "startTime",
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
                                            style={
                                              labelStyle
                                            }
                                          >
                                            Hora final
                                          </label>

                                          <input
                                            type="time"
                                            value={
                                              filter.endTime
                                            }
                                            onChange={
                                              (event) =>
                                                handleFilterChange(
                                                  vehicle.id,
                                                  "endTime",
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
                                          isLoading
                                        }
                                        style={{
                                          marginTop:
                                            "14px",
                                          padding:
                                            "10px 15px",
                                          border:
                                            "none",
                                          borderRadius:
                                            "8px",
                                          background:
                                            "#2563eb",
                                          color:
                                            "#ffffff",
                                          fontWeight:
                                            700,
                                          cursor:
                                            isLoading
                                              ? "not-allowed"
                                              : "pointer"
                                        }}
                                      >
                                        {
                                          isLoading
                                            ? "Consultando..."
                                            : "Consultar recorrido"
                                        }
                                      </button>
                                    </form>


                                    {currentError && (
                                      <div
                                        style={{
                                          marginTop:
                                            "14px",
                                          padding:
                                            "12px",
                                          borderRadius:
                                            "9px",
                                          background:
                                            "#fee2e2",
                                          color:
                                            "#991b1b"
                                        }}
                                      >
                                        {
                                          currentError
                                        }
                                      </div>
                                    )}


                                    {data.location && (
                                      <>
                                        <div
                                          style={{
                                            display:
                                              "grid",
                                            gridTemplateColumns:
                                              "repeat(auto-fit, minmax(140px, 1fr))",
                                            gap:
                                              "12px",
                                            marginTop:
                                              "18px",
                                            marginBottom:
                                              "16px"
                                          }}
                                        >
                                          <InfoCard
                                            label="Posiciones"
                                            value={
                                              data.routePoints.length
                                            }
                                          />

                                          <InfoCard
                                            label="Velocidad"
                                            value={
                                              data.location.speed ??
                                              "—"
                                            }
                                            unit="km/h"
                                          />

                                          <InfoCard
                                            label="Altitud"
                                            value={
                                              data.location.altitude ??
                                              "—"
                                            }
                                            unit="m"
                                          />

                                          <InfoCard
                                            label="Rumbo"
                                            value={
                                              data.location.heading ??
                                              "—"
                                            }
                                            unit="°"
                                          />
                                        </div>


                                        <VehicleMap
                                          latitude={
                                            data.location.latitude
                                          }
                                          longitude={
                                            data.location.longitude
                                          }
                                          vehicleCode={
                                            vehicle.vehicle_code
                                          }
                                          plate={
                                            vehicle.plate
                                          }
                                          speed={
                                            data.location.speed
                                          }
                                          altitude={
                                            data.location.altitude
                                          }
                                          routePoints={
                                            data.routePoints
                                          }
                                        />


                                        <div
                                          style={{
                                            marginTop:
                                              "12px",
                                            color:
                                              "#64748b",
                                            fontSize:
                                              "13px"
                                          }}
                                        >
                                          Última posición conocida:{" "}

                                          {
                                            new Date(
                                              data.location.timestamp
                                            ).toLocaleString()
                                          }
                                        </div>


                                        {data.routePoints.length >= 2 && (
                                          <div
                                            style={{
                                              marginTop:
                                                "6px",
                                              color:
                                                "#1d4ed8",
                                              fontSize:
                                                "13px",
                                              fontWeight:
                                                600
                                            }}
                                          >
                                            Ruta encontrada con{" "}
                                            {
                                              data.routePoints.length
                                            }{" "}
                                            posiciones registradas.
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )
                      }
                    </div>
                  )}
                </article>
              );
            }
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
        background:
          "#f8fafc",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "10px",
        padding:
          "12px"
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize:
            "12px",
          marginBottom:
            "5px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight:
            700,
          fontSize:
            "17px"
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
  display:
    "block",
  marginBottom:
    "6px",
  fontSize:
    "13px",
  fontWeight:
    600,
  color:
    "#475569"
};


const inputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  padding:
    "10px",
  borderRadius:
    "8px",
  border:
    "1px solid #cbd5e1",
  background:
    "#ffffff"
};
