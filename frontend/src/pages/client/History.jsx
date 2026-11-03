import {
  useEffect,
  useState
} from "react";

import AppLayout
  from "../../components/layout/AppLayout";

import {
  getVehicles
} from "../../services/vehicleService";

import {
  getVehicleHistory
} from "../../services/telemetryService";


export default function History() {
  const [
    vehicles,
    setVehicles
  ] = useState([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId
  ] = useState("");

  const [
    startDate,
    setStartDate
  ] = useState(
    "2026-11-02T00:00"
  );

  const [
    endDate,
    setEndDate
  ] = useState(
    "2026-11-03T00:00"
  );

  const [
    history,
    setHistory
  ] = useState(null);

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


  async function handleSearch(
    event
  ) {
    event.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    setSearchLoading(true);
    setError("");

    try {
      const start =
        new Date(
          startDate
        ).toISOString();

      const end =
        new Date(
          endDate
        ).toISOString();

      const data =
        await getVehicleHistory(
          selectedVehicleId,
          start,
          end
        );

      setHistory(data);

    } catch (error) {
      setHistory(null);

      setError(
        error.message ||
        "No fue posible consultar el historial."
      );

    } finally {
      setSearchLoading(false);
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
            Historial
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Consulta las posiciones registradas
            por vehículo y rango de fechas.
          </p>
        </div>


        {loading && (
          <div>
            Cargando vehículos...
          </div>
        )}


        {!loading && (
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
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px"
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
                    (event) =>
                      setSelectedVehicleId(
                        event.target.value
                      )
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
                  htmlFor="startDate"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600
                  }}
                >
                  Fecha inicial
                </label>

                <input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={
                    (event) =>
                      setStartDate(
                        event.target.value
                      )
                  }
                  style={inputStyle}
                />
              </div>


              <div>
                <label
                  htmlFor="endDate"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600
                  }}
                >
                  Fecha final
                </label>

                <input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={
                    (event) =>
                      setEndDate(
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
                padding: "11px 16px",
                border: "none",
                borderRadius: "9px",
                fontWeight: 700,
                cursor: searchLoading
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              {
                searchLoading
                  ? "Consultando..."
                  : "Consultar historial"
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


        {history && (
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "14px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "18px",
                borderBottom:
                  "1px solid #e2e8f0"
              }}
            >
              <strong>
                {history.vehicle_code}
              </strong>

              {" — "}

              {history.total_positions}
              {" posiciones"}
            </div>


            <div
              style={{
                overflowX: "auto"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse"
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      Fecha
                    </th>

                    <th style={tableHeaderStyle}>
                      Latitud
                    </th>

                    <th style={tableHeaderStyle}>
                      Longitud
                    </th>

                    <th style={tableHeaderStyle}>
                      Velocidad
                    </th>

                    <th style={tableHeaderStyle}>
                      Altitud
                    </th>

                    <th style={tableHeaderStyle}>
                      Rumbo
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {
                    history.locations.map(
                      (location) => (
                        <tr
                          key={
                            location.id
                          }
                        >
                          <td
                            style={
                              tableCellStyle
                            }
                          >
                            {
                              new Date(
                                location.timestamp
                              ).toLocaleString()
                            }
                          </td>

                          <td
                            style={
                              tableCellStyle
                            }
                          >
                            {
                              location.latitude
                            }
                          </td>

                          <td
                            style={
                              tableCellStyle
                            }
                          >
                            {
                              location.longitude
                            }
                          </td>

                          <td
                            style={
                              tableCellStyle
                            }
                          >
                            {
                              location.speed ??
                              "—"
                            }
                          </td>

                          <td
                            style={
                              tableCellStyle
                            }
                          >
                            {
                              location.altitude ??
                              "—"
                            }
                          </td>

                          <td
                            style={
                              tableCellStyle
                            }
                          >
                            {
                              location.heading ??
                              "—"
                            }
                          </td>
                        </tr>
                      )
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  );
}


const inputStyle = {
  width: "100%",
  padding: "11px",
  boxSizing: "border-box",
  borderRadius: "9px",
  border:
    "1px solid #cbd5e1",
  background: "#ffffff"
};


const tableHeaderStyle = {
  textAlign: "left",
  padding: "13px",
  borderBottom:
    "1px solid #e2e8f0",
  color: "#475569",
  fontSize: "14px"
};


const tableCellStyle = {
  padding: "13px",
  borderBottom:
    "1px solid #e2e8f0",
  fontSize: "14px"
};