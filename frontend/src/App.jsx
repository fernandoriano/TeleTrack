import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";

import EngineerDashboard from "./pages/engineer/EngineerDashboard";
import Clients from "./pages/engineer/Clients";
import CreateClient from "./pages/engineer/CreateClient";
import Vehicles from "./pages/engineer/Vehicles";
import CreateVehicle from "./pages/engineer/CreateVehicle";
import Locations from "./pages/engineer/Locations";
import Stats from "./pages/engineer/Stats";

import ClientDashboard from "./pages/client/ClientDashboard";
import MyVehicles from "./pages/client/MyVehicles";
import ClientMap from "./pages/client/ClientMap";
import History from "./pages/client/History";
import ClientStats from "./pages/client/ClientStats";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas del ingeniero */}
          <Route
            path="/engineer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <EngineerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer/clients"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer/clients/new"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <CreateClient />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer/vehicles"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <Vehicles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer/vehicles/new"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <CreateVehicle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer/locations"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <Locations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer/stats"
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <Stats />
              </ProtectedRoute>
            }
          />

          {/* Rutas del cliente */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/vehicles"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MyVehicles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/map"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientMap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/history"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/stats"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientStats />
              </ProtectedRoute>
            }
          />

          {/* Cualquier URL desconocida */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}