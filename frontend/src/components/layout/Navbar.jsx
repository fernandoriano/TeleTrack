import {
  useLocation
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext";


export default function Navbar() {
  const {
    user
  } = useAuth();

  const location = useLocation();


  function getSectionTitle() {
    const path = location.pathname;

    if (path.includes("/clients")) {
      return "Clientes";
    }

    if (path.includes("/vehicles")) {
      return "Vehículos";
    }

    if (path.includes("/locations")) {
      return "Ubicaciones";
    }

    if (path.includes("/map")) {
      return "Mapa";
    }

    if (path.includes("/history")) {
      return "Historial";
    }

    if (path.includes("/stats")) {
      return "Estadísticas";
    }

    return "Dashboard";
  }


  return (
    <header
      style={{
        height: "72px",
        background: "#ffffff",
        borderBottom:
          "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        padding:
          "0 28px",
        boxSizing:
          "border-box"
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "22px"
          }}
        >
          {getSectionTitle()}
        </h1>
      </div>


      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px"
        }}
      >
        <div
          style={{
            textAlign: "right"
          }}
        >
          <div
            style={{
              fontWeight: 600
            }}
          >
            {user?.username}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#64748b"
            }}
          >
            {
              user?.role ===
              "engineer"
                ? "Ingeniero"
                : "Cliente"
            }
          </div>
        </div>

        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius:
              "50%",
            background:
              "#e2e8f0",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            fontWeight: 700
          }}
        >
          {
            user?.username
              ?.charAt(0)
              ?.toUpperCase()
          }
        </div>
      </div>
    </header>
  );
}
