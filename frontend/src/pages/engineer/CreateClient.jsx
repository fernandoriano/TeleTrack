import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import AppLayout
  from "../../components/layout/AppLayout";

import {
  createClient
} from "../../services/clientService";


export default function CreateClient() {
  const navigate =
    useNavigate();

  const [
    form,
    setForm
  ] = useState({
    client_code: "",
    name: "",
    company_name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    full_name: ""
  });

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");


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

    setLoading(true);
    setError("");

    try {
      await createClient(
        form
      );

      navigate(
        "/engineer/clients"
      );

    } catch (error) {
      setError(
        error.message ||
        "No fue posible crear el cliente."
      );

    } finally {
      setLoading(false);
    }
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
            Nuevo cliente
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Registra un nuevo cliente
            y su usuario de acceso.
          </p>
        </div>


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
            <InputField
              label="Código del cliente"
              name="client_code"
              value={
                form.client_code
              }
              onChange={
                handleChange
              }
              placeholder="CL02"
              required
            />

            <InputField
              label="Nombre"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              required
            />

            <InputField
              label="Empresa"
              name="company_name"
              value={
                form.company_name
              }
              onChange={
                handleChange
              }
            />

            <InputField
              label="Correo"
              name="email"
              type="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
            />

            <InputField
              label="Teléfono"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
            />

            <InputField
              label="Nombre completo del usuario"
              name="full_name"
              value={
                form.full_name
              }
              onChange={
                handleChange
              }
              required
            />

            <InputField
              label="Usuario"
              name="username"
              value={
                form.username
              }
              onChange={
                handleChange
              }
              required
            />

            <InputField
              label="Contraseña"
              name="password"
              type="password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              required
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
                    "/engineer/clients"
                  )
              }
              style={{
                padding:
                  "11px 16px",
                borderRadius:
                  "9px",
                border:
                  "1px solid #cbd5e1",
                cursor:
                  "pointer"
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                loading
              }
              style={{
                padding:
                  "11px 16px",
                borderRadius:
                  "9px",
                border:
                  "none",
                fontWeight:
                  700,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              {
                loading
                  ? "Creando..."
                  : "Crear cliente"
              }
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}


function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false
}) {
  return (
    <div>
      <label
        htmlFor={name}
        style={{
          display: "block",
          marginBottom: "7px",
          fontWeight: 600
        }}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={
          placeholder
        }
        required={
          required
        }
        style={{
          width: "100%",
          padding: "11px",
          boxSizing:
            "border-box",
          borderRadius:
            "9px",
          border:
            "1px solid #cbd5e1"
        }}
      />
    </div>
  );
}