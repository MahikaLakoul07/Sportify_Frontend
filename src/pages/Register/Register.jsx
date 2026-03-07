import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Register.css";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    user_type: "player",
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showKeep, setShowKeep] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

  const goDashboard = (role) => {
    if (role === "OWNER") navigate("/owner");
    else navigate("/player");
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    const lowerFields = ["email", "user_type", "gender"];
    const finalValue = lowerFields.includes(name)
      ? value.toLowerCase()
      : value;

    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (form.password !== form.confirm_password) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/authapp/register/", {
        method: "POST",
        body: form,
      });

      if (!data?.user || !data?.access) {
        throw new Error("Invalid server response.");
      }

      setPendingAuth(data);
      setShowKeep(true);
    } catch (error) {
      setErr(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const keepYes = () => {
    if (!pendingAuth) return;

    const u = login({
      user: pendingAuth.user,
      access: pendingAuth.access,
      refresh: pendingAuth.refresh,
    });

    setShowKeep(false);
    setPendingAuth(null);
    goDashboard(u.role);
  };

  const keepNo = () => {
    setShowKeep(false);
    setPendingAuth(null);
    navigate("/login");
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

            <input
              className="input"
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={onChange}
              required
            />

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

      {showKeep && (
        <div className="keepModalBack">
          <div className="keepModal">
            <h3>Keep logged in?</h3>
            <p>Do you want to stay logged in on this device?</p>

            <div className="keepActions">
              <button className="btn primary" onClick={keepYes}>
                Yes
              </button>
              <button className="btn outline" onClick={keepNo}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}