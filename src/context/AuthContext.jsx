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
      setUser(null);
    } finally {
      setBooting(false);
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem("access") && !!user;

  const login = ({ user, access, refresh }) => {
    const normalizedUser = { ...user, role: normalizeRole(user) };

    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoggedIn, login, logout, booting }),
    [user, isLoggedIn, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}