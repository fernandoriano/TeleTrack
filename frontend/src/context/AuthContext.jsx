import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  clearSession,
  getAccessToken,
  login as loginService,
  logout as logoutService
} from "../services/authService";


const AuthContext = createContext(null);


function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = atob(
      normalizedPayload
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}


export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(
    null
  );

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const payload =
      decodeJwtPayload(token);

    if (!payload) {
      clearSession();
      setLoading(false);
      return;
    }

    const expirationTime =
      payload.exp * 1000;

    if (
      Date.now() >= expirationTime
    ) {
      clearSession();
      setLoading(false);
      return;
    }

    setUser({
      username: payload.sub,
      role: payload.role,
      clientId: payload.client_id
    });

    setLoading(false);
  }, []);


  async function login(
    username,
    password
  ) {
    const data =
      await loginService(
        username,
        password
      );

    const payload =
      decodeJwtPayload(
        data.access_token
      );

    if (!payload) {
      clearSession();

      throw new Error(
        "Invalid authentication token."
      );
    }

    const authenticatedUser = {
      username: payload.sub,
      role: payload.role,
      clientId: payload.client_id
    };

    setUser(
      authenticatedUser
    );

    return authenticatedUser;
  }


  async function logout() {
    try {
      await logoutService();
    } finally {
      setUser(null);
    }
  }


  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
