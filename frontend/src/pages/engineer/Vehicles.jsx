import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import AppLayout
  from "../../components/layout/AppLayout";

import {
  getVehicles
} from "../../services/vehicleService";


export default function Vehicles() {
  const navigate =
    useNavigate();

  const [
    vehicles,
    setVehicles
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
    loadVehicles();
  }, []);


  async function loadVehicles() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getVehicles();

      setVehicles(data);

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar los vehículos."
      );

    } finally {
      setLoading(false);
    }
  }


  function handleNewVehicle() {
    navigate(
      "/engineer/vehicles/new"
    );
  }


  return (
    <AppLayout>
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            gap: "16px"
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "28px"
              }}
            >
              Vehículos
            </h2>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#64748b"
              }}
            >
              Consulta y administra los vehículos
              registrados en TeleTrack.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleNewVehicle
            }
            style={{
              border: "none",
              borderRadius: "9px",
              padding: "12px 16px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Nuevo vehículo
          </button>
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


        {!loading &&
          !error &&
          vehicles.length === 0 && (
            <div
              style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}
            >
              No hay vehículos registrados.
            </div>
          )}


        {!loading &&
          !error &&
          vehicles.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px"
              }}
            >
              {
                vehicles.map(
                  (vehicle) => (
                    <article
                      key={vehicle.id}
                      style={{
                        background: "#ffffff",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "20px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "12px",
                          marginBottom: "16px"
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "22px",
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
                            padding: "6px 10px",
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


                      <div
                        style={{
                          display: "grid",
                          gap: "10px",
                          fontSize: "14px"
                        }}
                      >
                        <div>
                          <strong>
                            Cliente ID:
                          </strong>{" "}
                          {vehicle.client_id}
                        </div>

                        <div>
                          <strong>
                            Descripción:
                          </strong>{" "}
                          {
                            vehicle.description ||
                            "—"
                          }
                        </div>

                        <div>
                          <strong>
                            Marca:
                          </strong>{" "}
                          {
                            vehicle.brand ||
                            "—"
                          }
                        </div>

                        <div>
                          <strong>
                            Modelo:
                          </strong>{" "}
                          {
                            vehicle.model ||
                            "—"
                          }
                        </div>
                      </div>
                    </article>
                  )
                )
              }
            </div>
          )}
      </section>
    </AppLayout>
  );
}