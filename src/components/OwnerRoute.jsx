import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OwnerRoute({ children }) {
  const { user, isLoggedIn } = useAuth();

  // Not logged in → go login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Logged in but not owner → go home
  if (user?.role !== "OWNER") return <Navigate to="/" replace />;

  return children;
}
