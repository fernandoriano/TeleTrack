import {
  useEffect,
  useState
} from "react";

import AppLayout
  from "../../components/layout/AppLayout";

import {
  useAuth
} from "../../context/AuthContext";

import {
  getVehicles
} from "../../services/vehicleService";

import {
  getAllStats
} from "../../services/telemetryService";


export default function ClientDashboard() {
  const {
    user
  } = useAuth();

  const [
    vehicles,
    setVehicles
  ] = useState([]);

  const [
    stats,
    setStats
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
    loadDashboard();
  }, []);


  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        vehiclesData,
        statsData
      ] = await Promise.all([
        getVehicles(),
        getAllStats()
      ]);

      setVehicles(
        vehiclesData
      );

      setStats(
        statsData
      );

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar el panel."
      );

    } finally {
      setLoading(false);
    }
  }


  const totalPositions =
    stats.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.total_positions ||
          0
        ),
      0
    );


  const averageSpeed =
    stats.length > 0
      ? stats.reduce(
          (
            total,
            item
          ) =>
            total +
            (
              item.average_speed ||
              0
            ),
          0
        ) / stats.length
      : 0;


  const totalDistance =
    stats.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.distance_travelled ||
          0
        ),
      0
    );


  return (
    <AppLayout>
      <section>
        <div
          style={{
            marginBottom: "28px"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "28px"
            }}
          >
            Bienvenido, {user?.username}
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Resumen de tus vehículos
            y telemetría registrada.
          </p>
        </div>


        {loading && (
          <div>
            Cargando panel...
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
          !error && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px"
              }}
            >
              <DashboardCard
                label="Mis vehículos"
                value={
                  vehicles.length
                }
              />

              <DashboardCard
                label="Posiciones registradas"
                value={
                  totalPositions
                }
              />

              <DashboardCard
                label="Velocidad promedio"
                value={
                  averageSpeed.toFixed(
                    1
                  )
                }
                unit="km/h"
              />

              <DashboardCard
                label="Distancia recorrida"
                value={
                  totalDistance.toFixed(
                    2
                  )
                }
                unit="km"
              />
            </div>
          )}
      </section>
    </AppLayout>
  );
}


function DashboardCard({
  label,
  value,
  unit = ""
}) {
  return (
    <article
      style={{
        background: "#ffffff",
        padding: "22px",
        borderRadius: "14px",
        border:
          "1px solid #e2e8f0"
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "14px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "30px",
          fontWeight: 700
        }}
      >
        {value}
        {
          unit
            ? ` ${unit}`
            : ""
        }
      </div>
    </article>
  );
}