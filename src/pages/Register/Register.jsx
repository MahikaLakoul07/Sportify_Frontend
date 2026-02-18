import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext"; // (Optional) If you want to use AuthContext later
import logo from "../../assets/logo.png";
import "./Register.css";

// register function: sends registration data to backend
const register = async (payload) => {
  const response = await fetch(
    "http://127.0.0.1:8000/authapp/register/", // ✅ CORRECT DJANGO URL (NO /api)
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  // If backend returns error (like email already exists)
  if (!response.ok) {
    const firstKey =
      data && typeof data === "object" ? Object.keys(data)[0] : null;

    const message =
      firstKey && Array.isArray(data[firstKey])
        ? data[firstKey][0]
        : "Registration failed.";

    throw new Error(message);
  }

  return data; // return user data
};

export default function Register() {
  // 1️. Get the register function from AuthContext
  // This allows us to call backend register API
  //
  // NOTE:
  // Since you asked to combine register API in this same file,
  // we are using the local register() function above.
  //
  // const { register } = useAuth();

  // 2️. useNavigate allows redirecting user after successful registration
  const navigate = useNavigate();

  // 3️. form state: stores all input field values
  // Controlled component approach (React best practice)
  //
  // UPDATED: Backend expects these exact keys:
  // username, email, phone, password, confirm_password, role_name
  const [form, setForm] = useState({
    username: "", // was name
    email: "",
    phone: "",
    password: "",
    confirm_password: "", // added
    role_name: "player", // was role: "PLAYER"
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

    setErr(""); // clear previous errors
    setLoading(true); // show loading state

    try {
      // Frontend validation (simple)
      // If passwords don't match, no need to hit backend
      if (form.password !== form.confirm_password) {
        throw new Error("Password and Confirm Password do not match.");
      }

      // Call register function
      // Sends form data to backend
      const user = await register(form);

      // 8️. Redirect user based on their role
      // This makes your app dynamic & role-based
      //
      // UPDATED:
      // backend may return role_name or role, so we safely handle both
      const role =
        (user?.role_name || user?.role || form.role_name || "").toLowerCase();

      if (role === "owner") {
        navigate("/owner");
      } else if (role === "admin") {
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
          <img src={logo} alt="Sportify Logo" className="register-logo" />

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
            {/* UPDATED: backend needs "username", so we changed name="username" */}
            <input
              className="input"
              name="username"
              placeholder="Username"
              value={form.username}
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

            {/* Confirm Password Input (Added to match backend) */}
            <input
              className="input"
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={onChange}
              required
            />

            {/* Role Selection Dropdown */}
            <div className="role-row">
              <label className="role-label">Role</label>

              {/* UPDATED: backend expects role_name and lowercase values */}
              <select
                className="input"
                name="role_name"
                value={form.role_name}
                onChange={onChange}
              >
                <option value="player">Player</option>
                <option value="owner">Ground Owner</option>
              </select>
            </div>

            {/* Submit Button */}
            <button className="btn primary" disabled={loading}>
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
