import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function normalizeRole(user) {
  const userType = (user?.user_type || "").toLowerCase();
  if (userType === "owner") return "OWNER";
  if (userType === "player") return "PLAYER";

  // future-proof if you add admin later
  const role = (user?.role || "").toUpperCase();
  if (role === "ADMIN") return "ADMIN";

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // restore session on refresh
  useEffect(() => {
    const access = localStorage.getItem("access");
    const rawUser = localStorage.getItem("user");

    if (access && rawUser) {
      const parsed = JSON.parse(rawUser);
      setUser({ ...parsed, role: parsed.role || normalizeRole(parsed) });
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem("access") && !!user;

  // to store tokens (login, or "Keep logged in = Yes")
  const login = ({ user, access, refresh }) => {
    const normalizedUser = { ...user, role: normalizeRole(user) };

    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
    return normalizedUser;
  };

  // Use this when user clicks Logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoggedIn, login, logout }), [user, isLoggedIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}