import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom"; // If using React Router
import "./Login.css";

export default function Login() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // For now, just alert the inputs, later will connect to Django backend
    alert(`Email: ${email}\nPassword: ${password}`);
    // Navigate to dashboard after login (dummy)
    // navigate("/dashboard"); 
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Sportify Logo" className="login-logo" />
        <h2>Login to Sportify</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            // onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            // onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn primary">Login</button>
        </form>

        <div className="login-links">
          <a href="#">Forgot Password?</a>
          <a href="#">Don't have an account? Register</a>
        </div>
      </div>
    </div>
  );
}
