import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


export default function AppLayout({
  children
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc"
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            padding: "28px",
            boxSizing: "border-box"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
