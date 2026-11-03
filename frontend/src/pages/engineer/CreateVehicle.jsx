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

import {
  createVehicle
} from "../../services/vehicleService";


export default function CreateVehicle() {
  const navigate =
    useNavigate();

  const [
    clients,
    setClients
  ] = useState([]);

  const [
    form,
    setForm
  ] = useState({
    client_id: "",
    plate: "",
    description: "",
    brand: "",
    model: ""
  });

  const [
    createdVehicle,
    setCreatedVehicle
  ] = useState(null);

  const [
    loadingClients,
    setLoadingClients
  ] = useState(true);

  const [
    creating,
    setCreating
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {
    loadClients();
  }, []);


  async function loadClients() {
    setLoadingClients(true);
    setError("");

    try {
      const data =
        await getClients(false);

      setClients(data);

      if (data.length > 0) {
        setForm(
          (current) => ({
            ...current,
            client_id:
              String(data[0].id)
          })
        );
      }

    } catch (error) {
      setError(
        error.message ||
        "No fue posible cargar los clientes."
      );

    } finally {
      setLoadingClients(false);
    }
  }


  function handleChange(
    event
  ) {
    const {
      name,
      value
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value
      })
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setCreatedVehicle(null);

    try {
      const data =
        await createVehicle({
          client_id:
            Number(form.client_id),
          plate:
            form.plate || null,
          description:
            form.description || null,
          brand:
            form.brand || null,
          model:
            form.model || null
        });

      setCreatedVehicle(data);

    } catch (error) {
      setError(
        error.message ||
        "No fue posible crear el vehículo."
      );

    } finally {
      setCreating(false);
    }
  }


  async function copyActivationSecret() {
    if (
      !createdVehicle?.activation_secret
    ) {
      return;
    }

    await navigator.clipboard.writeText(
      createdVehicle.activation_secret
    );
  }


  return (
    <AppLayout>
      <section
        style={{
          maxWidth: "900px"
        }}
      >
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
            Nuevo vehículo
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Registra un vehículo y asígnalo
            a uno de los clientes de TeleTrack.
          </p>
        </div>


        {!createdVehicle && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px"
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px"
              }}
            >
              <div>
                <label
                  htmlFor="client_id"
                  style={labelStyle}
                >
                  Cliente
                </label>

                <select
                  id="client_id"
                  name="client_id"
                  value={
                    form.client_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    loadingClients
                  }
                  style={inputStyle}
                >
                  {
                    clients.map(
                      (client) => (
                        <option
                          key={
                            client.id
                          }
                          value={
                            client.id
                          }
                        >
                          {
                            client.client_code
                          }
                          {" - "}
                          {
                            client.name
                          }
                        </option>
                      )
                    )
                  }
                </select>
              </div>


              <InputField
                label="Placa"
                name="plate"
                value={
                  form.plate
                }
                onChange={
                  handleChange
                }
                placeholder="ABC123"
              />

              <InputField
                label="Descripción"
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Vehículo principal"
              />

              <InputField
                label="Marca"
                name="brand"
                value={
                  form.brand
                }
                onChange={
                  handleChange
                }
                placeholder="Renault"
              />

              <InputField
                label="Modelo"
                name="model"
                value={
                  form.model
                }
                onChange={
                  handleChange
                }
                placeholder="Logan"
              />
            </div>


            {error && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#fee2e2",
                  color: "#991b1b"
                }}
              >
                {error}
              </div>
            )}


            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px"
              }}
            >
              <button
                type="button"
                onClick={
                  () =>
                    navigate(
                      "/engineer/vehicles"
                    )
                }
                style={secondaryButtonStyle}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  creating ||
                  loadingClients ||
                  clients.length === 0
                }
                style={primaryButtonStyle}
              >
                {
                  creating
                    ? "Creando..."
                    : "Crear vehículo"
                }
              </button>
            </div>
          </form>
        )}


        {createdVehicle && (
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px"
            }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "#dcfce7",
                color: "#166534",
                marginBottom: "22px",
                fontWeight: 700
              }}
            >
              Vehículo creado correctamente.
            </div>


            <div
              style={{
                display: "grid",
                gap: "14px"
              }}
            >
              <InfoRow
                label="Código del vehículo"
                value={
                  createdVehicle.vehicle_code
                }
              />

              <InfoRow
                label="Placa"
                value={
                  createdVehicle.plate ||
                  "—"
                }
              />

              <InfoRow
                label="Cliente ID"
                value={
                  createdVehicle.client_id
                }
              />


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
                    fontWeight: 700,
                    marginBottom: "8px"
                  }}
                >
                  Clave de activación
                </div>

                <div
                  style={{
                    wordBreak:
                      "break-all",
                    fontFamily:
                      "monospace",
                    marginBottom:
                      "12px"
                  }}
                >
                  {
                    createdVehicle.activation_secret
                  }
                </div>

                <button
                  type="button"
                  onClick={
                    copyActivationSecret
                  }
                  style={secondaryButtonStyle}
                >
                  Copiar clave
                </button>
              </div>
            </div>


            <p
              style={{
                marginTop: "18px",
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              Esta clave será utilizada para
              activar el teléfono o dispositivo
              GPS asociado al vehículo.
            </p>


            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/engineer/vehicles"
                  )
              }
              style={{
                ...primaryButtonStyle,
                marginTop: "10px"
              }}
            >
              Volver a vehículos
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  );
}


function InputField({
  label,
  name,
  value,
  onChange,
  placeholder = ""
}) {
  return (
    <div>
      <label
        htmlFor={name}
        style={labelStyle}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={
          placeholder
        }
        style={inputStyle}
      />
    </div>
  );
}


function InfoRow({
  label,
  value
}) {
  return (
    <div>
      <strong>
        {label}:
      </strong>{" "}
      {value}
    </div>
  );
}


const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: 600
};


const inputStyle = {
  width: "100%",
  padding: "11px",
  boxSizing: "border-box",
  borderRadius: "9px",
  border:
    "1px solid #cbd5e1",
  background: "#ffffff"
};


const primaryButtonStyle = {
  padding: "11px 16px",
  borderRadius: "9px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer"
};


const secondaryButtonStyle = {
  padding: "11px 16px",
  borderRadius: "9px",
  border:
    "1px solid #cbd5e1",
  cursor: "pointer",
  background: "#ffffff"
};