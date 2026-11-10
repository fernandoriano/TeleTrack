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
  deleteVehicle,
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
    deletingVehicleId,
    setDeletingVehicleId
  ] = useState(null);

  const [
    error,
    setError
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage
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


  async function handleDeleteVehicle(
    vehicle
  ) {
    const confirmed =
      window.confirm(
        `¿Eliminar permanentemente el vehículo ${vehicle.vehicle_code}?\n\n` +
        "También se eliminarán el dispositivo, las ubicaciones y las estadísticas asociadas.\n\n" +
        "Esta acción no se puede deshacer."
      );

    if (!confirmed) {
      return;
    }


    setDeletingVehicleId(
      vehicle.id
    );

    setError("");
    setSuccessMessage("");


    try {
      await deleteVehicle(
        vehicle.id
      );

      setVehicles(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              vehicle.id
          )
      );

      setSuccessMessage(
        `El vehículo ${vehicle.vehicle_code} fue eliminado correctamente.`
      );

    } catch (error) {
      setError(
        error.message ||
        "No fue posible eliminar el vehículo."
      );

    } finally {
      setDeletingVehicleId(
        null
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
              cursor: "pointer",
              background: "#2563eb",
              color: "#ffffff"
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


        {successMessage && (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "#dcfce7",
              color: "#166534",
              marginBottom: "18px"
            }}
          >
            {successMessage}
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
                border:
                  "1px solid #e2e8f0"
              }}
            >
              No hay vehículos registrados.
            </div>
          )}


        {!loading &&
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
                      key={
                        vehicle.id
                      }
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
                            padding:
                              "6px 10px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "13px",
                            fontWeight:
                              700,

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
                          {
                            vehicle.client_id
                          }
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


                      <div
                        style={{
                          marginTop: "18px",
                          paddingTop: "16px",
                          borderTop:
                            "1px solid #e2e8f0"
                        }}
                      >

                        <button
                          type="button"
                          onClick={
                            () =>
                              handleDeleteVehicle(
                                vehicle
                              )
                          }
                          disabled={
                            deletingVehicleId ===
                            vehicle.id
                          }
                          style={{
                            width: "100%",
                            border:
                              "1px solid #dc2626",
                            borderRadius:
                              "9px",
                            padding:
                              "10px 14px",
                            background:
                              "#ffffff",
                            color:
                              "#dc2626",
                            fontWeight:
                              700,

                            cursor:
                              deletingVehicleId ===
                              vehicle.id
                                ? "not-allowed"
                                : "pointer"
                          }}
                        >
                          {
                            deletingVehicleId ===
                            vehicle.id
                              ? "Eliminando..."
                              : "🗑 Eliminar vehículo"
                          }
                        </button>

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