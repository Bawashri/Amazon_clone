import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      if (token) await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const { data } = await api.get("/users/profile");
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  };

  useEffect(() => {
    if (token && !user) {
      refreshProfile().catch(() => clearSession());
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: Boolean(token), login, signup, logout, refreshProfile, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
