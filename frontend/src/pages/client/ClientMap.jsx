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


export default function ClientMap() {
  const [
    vehicles,
    setVehicles
  ] = useState([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId
  ] = useState(null);

  const [
    selectedVehicle,
    setSelectedVehicle
  ] = useState(null);

  const [
    location,
    setLocation
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    locationLoading,
    setLocationLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {
    loadVehicles();
  }, []);


  useEffect(() => {
    if (selectedVehicleId) {
      loadVehicleLocation(
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
          data[0].id
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


  async function loadVehicleLocation(
    vehicleId
  ) {
    setLocationLoading(true);
    setError("");

    try {
      const vehicle =
        vehicles.find(
          (item) =>
            item.id === Number(
              vehicleId
            )
        );

      setSelectedVehicle(
        vehicle || null
      );

      const data =
        await getLatestLocation(
          vehicleId
        );

      setLocation(data);

    } catch (error) {
      setLocation(null);

      setError(
        error.message ||
        "No fue posible cargar la ubicación."
      );

    } finally {
      setLocationLoading(false);
    }
  }


  function handleVehicleChange(
    event
  ) {
    setSelectedVehicleId(
      Number(
        event.target.value
      )
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
            Mapa
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta la última ubicación
            de tus vehículos autorizados.
          </p>
        </div>


        {loading && (
          <div>
            Cargando vehículos...
          </div>
        )}


        {!loading &&
          vehicles.length > 0 && (
            <div
              style={{
                marginBottom: "20px",
                maxWidth: "360px"
              }}
            >
              <label
                htmlFor="vehicle"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600
                }}
              >
                Vehículo
              </label>

              <select
                id="vehicle"
                value={
                  selectedVehicleId ||
                  ""
                }
                onChange={
                  handleVehicleChange
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "9px",
                  border:
                    "1px solid #cbd5e1",
                  background: "#ffffff"
                }}
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


        {locationLoading && (
          <div>
            Cargando ubicación...
          </div>
        )}


        {!locationLoading &&
          selectedVehicle &&
          location && (
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
                    selectedVehicle.vehicle_code
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
              />


              <div
                style={{
                  marginTop: "14px",
                  color: "#64748b",
                  fontSize: "13px"
                }}
              >
                Última posición:{" "}
                {
                  new Date(
                    location.timestamp
                  ).toLocaleString()
                }
              </div>
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