import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./navbar.css";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
//   const user = { role: "OWNER" };
// const isLoggedIn = true;
// const logout = () => {};
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // close dropdown if clicked outside
  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

              {/* DROPDOWN MENU */}
              <div className="dd" ref={menuRef}>
                <button
                  className="btn outline dd-btn"
                  onClick={() => setOpen((p) => !p)}
                  type="button"
                >
                  Menu <span className={`dd-caret ${open ? "up" : ""}`}>▾</span>
                </button>

                {open && (
                  <div className="dd-menu">
                    {/* OWNER MENU */}
                    {user?.role === "OWNER" && (
                      <>
                        <Link to="/createground" className="dd-item strong">
                          + Create Ground
                        </Link>
                        <Link to="/owner/grounds" className="dd-item">
                          Manage Grounds
                        </Link>
                        <Link to="/owner/bookings" className="dd-item">
                          Bookings
                        </Link>
                        <Link to="/owner/reports" className="dd-item">
                          Reports
                        </Link>
                      </>
                    )}

                    {/* PLAYER MENU */}
                    {user?.role === "PLAYER" && (
                      <>
                        <Link to="/mybookings" className="dd-item">
                          My Bookings
                        </Link>
                      </>
                    )}

                    <div className="dd-divider" />

                    <button className="dd-item danger" onClick={handleLogout} type="button">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
