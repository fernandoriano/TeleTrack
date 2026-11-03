import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext";


export default function Login() {
  const navigate = useNavigate();

  const {
    login
  } = useAuth();


  const [
    username,
    setUsername
  ] = useState("");

  const [
    password,
    setPassword
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(
        username,
        password
      );

      if (
        user.role === "engineer"
      ) {
        navigate(
          "/engineer/dashboard"
        );

        return;
      }

      if (
        user.role === "client"
      ) {
        navigate(
          "/client/dashboard"
        );

        return;
      }

      setError(
        "El usuario no tiene un rol válido."
      );

    } catch (error) {
      setError(
        error.message ||
        "No fue posible iniciar sesión."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        padding: "24px"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "32px",
          boxShadow:
            "0 18px 50px rgba(0, 0, 0, 0.10)"
        }}
      >
        <div
          style={{
            marginBottom: "28px"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px"
            }}
          >
            TeleTrack
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#64748b"
            }}
          >
            Plataforma de telemetría
            y geolocalización vehicular.
          </p>
        </div>


        <form
          onSubmit={handleSubmit}
        >
          <div
            style={{
              marginBottom: "18px"
            }}
          >
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600
              }}
            >
              Usuario
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={
                (event) =>
                  setUsername(
                    event.target.value
                  )
              }
              required
              autoComplete="username"
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1"
              }}
            />
          </div>


          <div
            style={{
              marginBottom: "18px"
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600
              }}
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={
                (event) =>
                  setPassword(
                    event.target.value
                  )
              }
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1"
              }}
            />
          </div>


          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px",
                borderRadius: "9px",
                background: "#fee2e2",
                color: "#991b1b"
              }}
            >
              {error}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "9px",
              fontWeight: 700,
              cursor: loading
                ? "not-allowed"
                : "pointer"
            }}
          >
            {
              loading
                ? "Ingresando..."
                : "Iniciar sesión"
            }
          </button>
        </form>
      </section>
    </main>
  );
}
