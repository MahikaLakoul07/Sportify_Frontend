import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setErr("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/authapp/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Invalid email or password");
      }

      // Save tokens in localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on user type
      const userType = (data.user.user_type || "").toUpperCase();

      if (userType === "OWNER") {
        navigate("/owner");
      } else {
        navigate("/player");
      }

    } catch (error) {
      setErr(error.message);
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
