import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { serverFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

function parseJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isAccessToken(token) {
  const payload = parseJwtPayload(token);
  return payload?.token_type === "access";
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const goDashboard = (user) => {
    if (user?.user_type === "owner" || user?.role === "OWNER") {
      navigate("/owner");
    } else {
      navigate("/player");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await serverFetch("/authapp/login/", {
        method: "POST",
        body: { email, password },
      });

      const access = data?.access;
      const refresh = data?.refresh;

      if (!isAccessToken(access)) {
        throw new Error("Invalid access token received from server.");
      }

      const u = login({
        user: data.user,
        access,
        refresh,
      });

      goDashboard(u);
    } catch (error) {
      setErr(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Sportify Logo" className="login-logo" />
        <h2>Login to Sportify</h2>

        {err && <div className="login-error">{err}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-links">
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}