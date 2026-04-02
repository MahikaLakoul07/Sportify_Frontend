import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function normalizeRole(user) {
  const userType = (user?.user_type || "").toLowerCase();

  if (userType === "owner") return "OWNER";
  if (userType === "player") return "PLAYER";

  const role = (user?.role || "").toUpperCase();
  if (role === "OWNER") return "OWNER";
  if (role === "PLAYER") return "PLAYER";
  if (role === "ADMIN") return "ADMIN";

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    try {
      const access = localStorage.getItem("access");
      const rawUser = localStorage.getItem("user");

      if (access && rawUser) {
        const parsed = JSON.parse(rawUser);
        const normalizedUser = {
          ...parsed,
          role: parsed.role || normalizeRole(parsed),
        };
        setUser(normalizedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to restore auth from storage:", error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      setUser(null);
    } finally {
      setBooting(false);
    }
  }, []);

  const isLoggedIn = Boolean(localStorage.getItem("access")) && Boolean(user);

  const login = ({ user, access, refresh }) => {
    const normalizedUser = { ...user, role: normalizeRole(user) };

    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("user_id", String(user?.user_id || user?.id || ""));

    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    setUser(null);
  };

  const updateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value = useMemo(
    () => ({ user, isLoggedIn, login, logout, updateUser, booting }),
    [user, isLoggedIn, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}