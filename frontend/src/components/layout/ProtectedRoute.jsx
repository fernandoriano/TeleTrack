import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext";


export default function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const {
    user,
    loading,
    isAuthenticated
  } = useAuth();


  if (loading) {
    return (
      <div>
        Cargando...
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(
      user.role
    )
  ) {
    if (
      user.role === "engineer"
    ) {
      return (
        <Navigate
          to="/engineer/dashboard"
          replace
        />
      );
    }

    if (
      user.role === "client"
    ) {
      return (
        <Navigate
          to="/client/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return children;
}
