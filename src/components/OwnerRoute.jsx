import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OwnerRoute({ children }) {
  const { user, isLoggedIn, booting } = useAuth();

  // Wait until localStorage restore finishes
  if (booting) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not owner
  if (user?.role !== "OWNER") {
    return <Navigate to="/" replace />;
  }

  return children;
}