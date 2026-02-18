import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./Register.css";

export default function Register() {
  // 1️. Get the register function from AuthContext
  // This allows us to call backend register API
  const { register } = useAuth();

  // 2️. useNavigate allows redirecting user after successful registration
  const navigate = useNavigate();

  // 3️. form state: stores all input field values
  // Controlled component approach (React best practice)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PLAYER", // default role
  });

  // 4️. loading state: used to disable button and show loading text
  const [loading, setLoading] = useState(false);

  // 5️. err state: used to display backend validation errors
  const [err, setErr] = useState("");

  // 6. onChange handler:
  // Updates form state dynamically based on input name
  // Example: if name="email", it updates form.email
  const onChange = (e) =>
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  // 7️. onSubmit handler:
  // Called when user submits the form
  const onSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    setErr("");         // clear previous errors
    setLoading(true);   // show loading state

    try {
      // Call register function from AuthContext
      // Sends form data to backend
      const user = await register(form);

      // 8️. Redirect user based on their role
      // This makes your app dynamic & role-based
      if (user?.role === "OWNER") {
        navigate("/owner");
      } else if (user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/player");
      }

    } catch (ex) {
      // If backend throws error (like email already exists),
      // display error message to user
      setErr(ex.message);
    } finally {
      // Stop loading state whether success or failure
      setLoading(false);
    }
  };

  return (
    <div className="page-bg">
      <div className="container register-wrap">

        <div className="card register-card">

          {/* Logo */}
          <img
            src={logo}
            alt="Sportify Logo"
            className="register-logo"
          />

          {/* Title & Subtitle */}
          <h2 className="register-title">Create your account</h2>
          <p className="register-sub">
            Book futsal, join matches, and manage everything digitally.
          </p>

          {/* Error Message (only shown if error exists) */}
          {err ? <div className="register-error">{err}</div> : null}

          {/* Registration Form */}
          <form onSubmit={onSubmit} className="register-form">

            {/* Full Name Input */}
            <input
              className="input"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={onChange}
              required
            />

            {/* Email Input */}
            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />

            {/* Phone Input */}
            <input
              className="input"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={onChange}
              required
            />

            {/* Password Input */}
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />

            {/* Role Selection Dropdown */}
            <div className="role-row">
              <label className="role-label">Role</label>

              <select
                className="input"
                name="role"
                value={form.role}
                onChange={onChange}
              >
                <option value="PLAYER">Player</option>
                <option value="OWNER">Ground Owner</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              className="btn primary"
              disabled={loading}
            >
              {/* Button text changes while loading */}
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>

          {/* Link to Login page */}
          <div className="register-links">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
