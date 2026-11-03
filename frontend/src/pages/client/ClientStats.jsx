import {
  useEffect,
  useState
} from "react";

import AppLayout
  from "../../components/layout/AppLayout";

import {
  getAllStats
} from "../../services/telemetryService";


export default function ClientStats() {
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
    loadStats();
  }, []);


  async function loadStats() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getAllStats();

      setStats(data);

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar las estadísticas."
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
            Estadísticas
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta los indicadores de tus
            vehículos autorizados.
          </p>
        </div>


        {loading && (
          <div>
            Cargando estadísticas...
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
          stats.length === 0 && (
            <div
              style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0"
              }}
            >
              Aún no hay estadísticas disponibles.
            </div>
          )}


        {!loading &&
          !error &&
          stats.map(
            (item) => (
              <article
                key={item.vehicle_id}
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
                    marginBottom: "18px"
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700
                    }}
                  >
                    {item.vehicle_code}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      marginTop: "4px"
                    }}
                  >
                    Indicadores del vehículo
                  </div>
                </div>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "14px"
                  }}
                >
                  <StatCard
                    label="Posiciones"
                    value={
                      item.total_positions
                    }
                  />

                  <StatCard
                    label="Velocidad promedio"
                    value={
                      formatNumber(
                        item.average_speed
                      )
                    }
                    unit="km/h"
                  />

                  <StatCard
                    label="Velocidad máxima"
                    value={
                      formatNumber(
                        item.max_speed
                      )
                    }
                    unit="km/h"
                  />

                  <StatCard
                    label="Altitud mínima"
                    value={
                      formatNumber(
                        item.min_altitude
                      )
                    }
                    unit="m"
                  />

                  <StatCard
                    label="Altitud máxima"
                    value={
                      formatNumber(
                        item.max_altitude
                      )
                    }
                    unit="m"
                  />

                  <StatCard
                    label="Distancia recorrida"
                    value={
                      formatNumber(
                        item.distance_travelled,
                        2
                      )
                    }
                    unit="km"
                  />
                </div>


                <div
                  style={{
                    marginTop: "18px",
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Última posición:{" "}
                  {
                    item.last_update
                      ? new Date(
                          item.last_update
                        ).toLocaleString()
                      : "—"
                  }
                </div>
              </article>
            )
          )}
      </section>
    </AppLayout>
  );
}


function StatCard({
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
          fontSize: "22px",
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


function formatNumber(
  value,
  decimals = 1
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return Number(
    value
  ).toFixed(decimals);
}