import { createContext, useContext, useState, useCallback } from "react";
import { setToken as setApiToken, clearToken as clearApiToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Token + user live in React state only — never localStorage,
  // so a page refresh logs the user out (acceptable for a portfolio demo).
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);

  const login = useCallback((accessToken, userData) => {
    setApiToken(accessToken);
    setTokenState(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearApiToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
