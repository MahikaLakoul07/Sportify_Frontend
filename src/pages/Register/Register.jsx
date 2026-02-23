import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Register.css";

// API call
const register = async (payload) => {
  const response = await fetch("http://127.0.0.1:8000/authapp/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const firstKey = Object.keys(data)[0];
    const message =
      firstKey && Array.isArray(data[firstKey])
        ? data[firstKey][0]
        : data?.detail || "Registration failed.";
    throw new Error(message);
  }

  return data;
};

export default function Register() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    user_type: "player", // must match backend choices
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value.toLowerCase(),
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await register(form);

      // ✅ Store JWT in localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (form.user_type === "owner") {
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
    <div className="page-bg">
      <div className="container register-wrap">
        <div className="card register-card">

          <img src={logo} alt="Sportify Logo" className="register-logo" />

          <h2 className="register-title">Create your account</h2>
          <p className="register-sub">
            Book futsal, join matches, and manage everything digitally.
          </p>

          {err && <div className="register-error">{err}</div>}

          <form onSubmit={onSubmit} className="register-form">

            <input
              className="input"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={onChange}
              required
            />

            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />

            <input
              className="input"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={onChange}
              required
            />

            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />

            {/* User Type */}
            <div className="role-row">
              <label className="role-label">Role</label>
              <select
                className="input"
                name="user_type"
                value={form.user_type}
                onChange={onChange}
              >
                <option value="player">Player</option>
                <option value="owner">Ground Owner</option>
              </select>
            </div>

            {/* Gender */}
            <div className="role-row">
              <label className="role-label">Gender</label>
              <select
                className="input"
                name="gender"
                value={form.gender}
                onChange={onChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <button className="btn primary" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>

          <div className="register-links">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
