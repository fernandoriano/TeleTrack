import {
  NavLink
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext";


export default function Sidebar() {
  const {
    user,
    logout
  } = useAuth();


  async function handleLogout() {
    await logout();

    window.location.href = "/login";
  }


  const engineerLinks = [
    {
      label: "Dashboard",
      path: "/engineer/dashboard"
    },
    {
      label: "Clientes",
      path: "/engineer/clients"
    },
    {
      label: "Vehículos",
      path: "/engineer/vehicles"
    },
    {
      label: "Ubicaciones",
      path: "/engineer/locations"
    },
    {
      label: "Estadísticas",
      path: "/engineer/stats"
    }
  ];


  const clientLinks = [
    {
      label: "Dashboard",
      path: "/client/dashboard"
    },
    {
      label: "Mis vehículos",
      path: "/client/vehicles"
    },
    {
      label: "Mapa",
      path: "/client/map"
    },
    {
      label: "Historial",
      path: "/client/history"
    },
    {
      label: "Estadísticas",
      path: "/client/stats"
    }
  ];


  const links =
    user?.role === "engineer"
      ? engineerLinks
      : clientLinks;


  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          marginBottom: "32px"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "26px"
          }}
        >
          TeleTrack
        </h2>

        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
            color: "#94a3b8",
            fontSize: "14px"
          }}
        >
          {
            user?.role === "engineer"
              ? "Panel de ingeniería"
              : "Panel del cliente"
          }
        </p>
      </div>


      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1
        }}
      >
        {
          links.map(
            (link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={
                  ({ isActive }) => ({
                    textDecoration: "none",
                    color: "#ffffff",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background:
                      isActive
                        ? "#1e293b"
                        : "transparent"
                  })
                }
              >
                {link.label}
              </NavLink>
            )
          )
        }
      </nav>


      <div
        style={{
          borderTop:
            "1px solid #334155",
          paddingTop: "18px"
        }}
      >
        <p
          style={{
            marginTop: 0,
            color: "#cbd5e1",
            fontSize: "14px"
          }}
        >
          {user?.username}
        </p>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
