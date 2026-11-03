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
  getClients
} from "../../services/clientService";


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
              Clientes
            </h2>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#64748b"
              }}
            >
              Administra los clientes registrados
              en TeleTrack.
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
              cursor: "pointer"
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
          !error &&
          clients.length > 0 && (
            <div
              style={{
                overflowX: "auto",
                background: "#ffffff",
                borderRadius: "14px",
                border:
                  "1px solid #e2e8f0"
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
                  <tr
                    style={{
                      background: "#f8fafc"
                    }}
                  >
                    <th
                      style={tableHeaderStyle}
                    >
                      Código
                    </th>

                    <th
                      style={tableHeaderStyle}
                    >
                      Nombre
                    </th>

                    <th
                      style={tableHeaderStyle}
                    >
                      Empresa
                    </th>

                    <th
                      style={tableHeaderStyle}
                    >
                      Correo
                    </th>

                    <th
                      style={tableHeaderStyle}
                    >
                      Teléfono
                    </th>

                    <th
                      style={tableHeaderStyle}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {
                    clients.map(
                      (client) => (
                        <tr
                          key={client.id}
                        >
                          <td
                            style={tableCellStyle}
                          >
                            {
                              client.client_code
                            }
                          </td>

                          <td
                            style={tableCellStyle}
                          >
                            {
                              client.name
                            }
                          </td>

                          <td
                            style={tableCellStyle}
                          >
                            {
                              client.company_name ||
                              "—"
                            }
                          </td>

                          <td
                            style={tableCellStyle}
                          >
                            {
                              client.email ||
                              "—"
                            }
                          </td>

                          <td
                            style={tableCellStyle}
                          >
                            {
                              client.phone ||
                              "—"
                            }
                          </td>

                          <td
                            style={tableCellStyle}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "13px",
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
                          </td>
                        </tr>
                      )
                    )
                  }
                </tbody>
              </table>
            </div>
          )}
      </section>
    </AppLayout>
  );
}


const tableHeaderStyle = {
  textAlign: "left",
  padding: "14px",
  fontSize: "14px",
  color: "#475569",
  borderBottom:
    "1px solid #e2e8f0"
};


const tableCellStyle = {
  padding: "14px",
  borderBottom:
    "1px solid #e2e8f0",
  fontSize: "14px"
};
