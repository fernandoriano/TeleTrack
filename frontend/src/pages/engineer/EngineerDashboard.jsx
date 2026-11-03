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
  getClients
} from "../../services/clientService";

import {
  getVehicles
} from "../../services/vehicleService";

import {
  getAllStats
} from "../../services/telemetryService";


export default function EngineerDashboard() {
  const {
    user
  } = useAuth();

  const [
    clients,
    setClients
  ] = useState([]);

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
        clientsData,
        vehiclesData,
        statsData
      ] = await Promise.all([
        getClients(true),
        getVehicles(),
        getAllStats()
      ]);

      setClients(
        clientsData
      );

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


  const activeClients =
    clients.filter(
      (client) =>
        client.active
    ).length;


  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.active
    ).length;


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
            Resumen general de clientes,
            vehículos y telemetría de TeleTrack.
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
                label="Clientes registrados"
                value={
                  clients.length
                }
              />

              <DashboardCard
                label="Clientes activos"
                value={
                  activeClients
                }
              />

              <DashboardCard
                label="Vehículos registrados"
                value={
                  vehicles.length
                }
              />

              <DashboardCard
                label="Vehículos activos"
                value={
                  activeVehicles
                }
              />

              <DashboardCard
                label="Posiciones registradas"
                value={
                  totalPositions
                }
              />
            </div>
          )}
      </section>
    </AppLayout>
  );
}


function DashboardCard({
  label,
  value
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
      </div>
    </article>
  );
}