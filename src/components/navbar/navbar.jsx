import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./navbar.css";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // go back to home after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LEFT SIDE - Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Sportify Logo" />
        </Link>

        {/* RIGHT SIDE - Navigation Links */}
        <div className="navbar-links">

          <Link to="/grounds">Grounds</Link>

          {!isLoggedIn && (
            <>
              <Link to="/login" className="btn outline">Login</Link>
              <Link to="/register" className="btn primary">Register</Link>
            </>
          )}

          {isLoggedIn && (
            <>
              {/* Role-based dashboard link */}
              {user?.role === "PLAYER" && (
                <Link to="/player" className="btn outline">
                  My Dashboard
                </Link>
              )}

              {user?.role === "OWNER" && (
                <Link to="/owner" className="btn outline">
                  Owner Dashboard
                </Link>
              )}

              {user?.role === "ADMIN" && (
                <Link to="/admin" className="btn outline">
                  Admin Panel
                </Link>
              )}

              {/* Logout Button */}
              <button className="btn primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
