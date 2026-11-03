import {
  useEffect,
  useState
} from "react";

import AppLayout
  from "../../components/layout/AppLayout";

import {
  getVehicles
} from "../../services/vehicleService";


export default function MyVehicles() {
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
        "No fue posible cargar tus vehículos."
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
            Mis vehículos
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta los vehículos asociados
            a tu cuenta de TeleTrack.
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
              color: "#991b1b"
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
                border:
                  "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "22px"
              }}
            >
              No tienes vehículos asignados.
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