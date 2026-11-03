import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      title: "Geolocalización",
      description:
        "Consulta la ubicación de los vehículos registrados y autorizados.",
      color: "#2563eb",
    },
    {
      title: "Telemetría",
      description:
        "Recibe velocidad, altitud, precisión, rumbo y datos GPS.",
      color: "#0891b2",
    },
    {
      title: "Historial",
      description:
        "Consulta posiciones anteriores y recorridos registrados.",
      color: "#7c3aed",
    },
    {
      title: "Estadísticas",
      description:
        "Analiza distancia recorrida, velocidades y posiciones recibidas.",
      color: "#16a34a",
    },
    {
      title: "Seguridad",
      description:
        "Usuarios, roles y vehículos protegidos mediante autenticación.",
      color: "#dc2626",
    },
    {
      title: "Cloud Native",
      description:
        "Arquitectura contenerizada preparada para automatización y escalamiento.",
      color: "#ea580c",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f5f7fb",
      }}
    >
      <header
        style={{
          background:
            "linear-gradient(120deg, #0f172a 0%, #123c69 55%, #0e7490 100%)",
          color: "white",
        }}
      >
        <nav
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "22px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              TeleTrack
            </div>

            <div
              style={{
                fontSize: "13px",
                opacity: 0.75,
                marginTop: "3px",
              }}
            >
              Telemetría y geolocalización vehicular
            </div>
          </div>

          <Link
            to="/login"
            style={{
              background: "#22c55e",
              color: "#07111f",
              padding: "12px 22px",
              borderRadius: "9px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Iniciar sesión
          </Link>
        </nav>

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "100px 30px 110px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              background: "rgba(34,197,94,0.16)",
              border: "1px solid rgba(34,197,94,0.45)",
              borderRadius: "30px",
              color: "#86efac",
              fontWeight: "bold",
              marginBottom: "22px",
            }}
          >
            Plataforma Cloud Native
          </div>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.05,
              maxWidth: "800px",
              margin: 0,
            }}
          >
            Control y seguimiento vehicular desde cualquier lugar.
          </h1>

          <p
            style={{
              maxWidth: "760px",
              fontSize: "20px",
              lineHeight: 1.6,
              opacity: 0.82,
              marginTop: "25px",
            }}
          >
            TeleTrack centraliza la geolocalización, telemetría,
            administración de vehículos, historial de recorridos y
            estadísticas en una plataforma diseñada para entornos de nube.
          </p>

          <Link
            to="/login"
            style={{
              display: "inline-block",
              marginTop: "25px",
              background: "#2563eb",
              color: "white",
              padding: "15px 28px",
              borderRadius: "9px",
              textDecoration: "none",
              fontWeight: "bold",
              boxShadow: "0 8px 25px rgba(37,99,235,0.3)",
            }}
          >
            Acceder a TeleTrack
          </Link>
        </section>
      </header>

      <main>
        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "70px 30px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "45px",
            }}
          >
            <h2
              style={{
                fontSize: "36px",
                color: "#0f172a",
                marginBottom: "10px",
              }}
            >
              Una plataforma, múltiples capacidades
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
              }}
            >
              Información vehicular centralizada, protegida y disponible
              para los usuarios autorizados.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {features.map((feature) => (
              <article
                key={feature.title}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "26px",
                  borderTop: `5px solid ${feature.color}`,
                  boxShadow: "0 8px 28px rgba(15,23,42,0.08)",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: `${feature.color}18`,
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: feature.color,
                  }}
                >
                  ●
                </div>

                <h3
                  style={{
                    color: "#0f172a",
                    fontSize: "21px",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            background:
              "linear-gradient(120deg, #eff6ff, #ecfdf5)",
            padding: "70px 30px",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "34px",
                color: "#0f172a",
              }}
            >
              Diseñado para evolucionar con la nube
            </h2>

            <p
              style={{
                color: "#475569",
                fontSize: "18px",
                lineHeight: 1.7,
              }}
            >
              React, Nginx, FastAPI, PostgreSQL y servicios de procesamiento
              independientes permiten que TeleTrack pueda desplegarse mediante
              contenedores, Kubernetes, automatización CI/CD y servicios
              cloud.
            </p>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              {[
                "Docker",
                "Kubernetes",
                "FastAPI",
                "React",
                "PostgreSQL",
                "CI/CD",
                "Serverless",
              ].map((technology, index) => {
                const colors = [
                  "#2563eb",
                  "#16a34a",
                  "#0891b2",
                  "#7c3aed",
                  "#dc2626",
                  "#ea580c",
                  "#0284c7",
                ];

                return (
                  <span
                    key={technology}
                    style={{
                      background: colors[index],
                      color: "white",
                      padding: "9px 16px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {technology}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          background: "#0f172a",
          color: "#94a3b8",
          textAlign: "center",
          padding: "27px",
        }}
      >
        TeleTrack · Plataforma de telemetría y geolocalización vehicular
      </footer>
    </div>
  );
}