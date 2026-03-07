import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const goDashboard = (role) => {
    if (role === "OWNER") navigate("/owner");
    else navigate("/player");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // backend expects { email, password }
      const data = await apiFetch("/authapp/login/", {
        method: "POST",
        body: { email, password },
      });

      // store tokens + user in AuthContext (updates navbar immediately)
      const u = login({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });

      goDashboard(u.role);
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