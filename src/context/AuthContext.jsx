import React, { createContext, useContext, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

// 1) Create an AuthContext (global storage for authentication data)
// Initially null until we wrap the app with <AuthProvider>
const AuthContext = createContext(null);

// 2) AuthProvider wraps the entire application so every component/page
// can access authentication info (user, login, logout, etc.)
export function AuthProvider({ children }) {
  // 3) user state: stores the currently logged-in user's info (id, name, role, etc.)
  // We initialize it from localStorage so refresh doesn't log the user out.
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user"); // stored as JSON string
    return raw ? JSON.parse(raw) : null;      // convert to object or null
  });

  // 4) isLoggedIn tells if a user has an access token saved.
  // !! converts truthy/falsy into true/false
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // 5) login(): logs in user by calling backend API
  // Expects backend response: { access, refresh, user: { id, role, name... } }
  const login = async ({ emailOrPhone, password }) => {
    // Send login request to backend
    const data = await apiFetch("/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        email_or_phone: emailOrPhone,
        password,
      }),
    });

    // Save tokens and user info in localStorage for persistence
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Update React state so UI updates immediately (Navbar, dashboards, etc.)
    setUser(data.user);

    // Return user object so calling page can redirect based on role
    return data.user;
  };

  // 6) register(): creates a new user account by calling backend API
  // Some backends return tokens immediately on register, some don't.
  // This function supports both cases.
  const register = async ({ name, email, phone, password, role }) => {
    const data = await apiFetch("/auth/register/", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password, role }),
    });

    // If backend returns tokens immediately, store them
    if (data?.access) localStorage.setItem("accessToken", data.access);
    if (data?.refresh) localStorage.setItem("refreshToken", data.refresh);

    // If backend returns user info, store it and update state
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user; // return user so UI can redirect
    }

    // If no user data is returned, caller may redirect to login page
    return null;
  };

  // 7) logout(): clears all auth data and resets user state
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // 8) Prepare the object that will be available globally through AuthContext.
  // useMemo avoids recreating this object unnecessarily.
  const value = useMemo(
    () => ({ user, isLoggedIn, login, register, logout }),
    [user, isLoggedIn]
  );

  // 9) Provide auth data to all child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 10) Custom hook to access authentication data easily from any component
// Example usage: const { user, login, logout, isLoggedIn } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
