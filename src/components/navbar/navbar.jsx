import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./navbar.css";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Sportify Logo" />
        </Link>

        <div className="navbar-links">
          {!isLoggedIn && (
            <>
              <Link to="/login" className="btn outline">
                Login
              </Link>
              <Link to="/register" className="btn primary">
                Register
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              {user?.user_type === "player" && (
                <>
                  <Link to="/player" className="btn outline">
                    My Dashboard
                  </Link>

                  <Link to="/players" className="btn outline">
                    Find Players
                  </Link>

                  <Link to="/notifications" className="btn outline">
                    Notifications
                  </Link>

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="btn danger"
                  >
                    Logout
                  </button>
                </>
              )}

              {user?.user_type === "owner" && (
                <>
                  <Link to="/owner" className="btn outline">
                    Owner Dashboard
                  </Link>

                  <div className="dd" ref={menuRef}>
                    <button
                      className="btn outline dd-btn"
                      onClick={() => setOpen((prev) => !prev)}
                      type="button"
                    >
                      Menu{" "}
                      <span className={`dd-caret ${open ? "up" : ""}`}>▾</span>
                    </button>

                    {open && (
                      <div className="dd-menu">
                        <Link to="/createground" className="dd-item strong">
                          + Create Ground
                        </Link>

                        <Link to="/owner/grounds" className="dd-item">
                          Manage Grounds
                        </Link>

                        <Link to="/owner/bookings" className="dd-item">
                          Bookings
                        </Link>

                        <div className="dd-divider" />

                        <button
                          className="dd-item danger"
                          onClick={handleLogout}
                          type="button"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {user?.user_type === "admin" && (
                <>
                  <Link to="/admin" className="btn outline">
                    Admin Panel
                  </Link>

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="btn danger"
                  >
                    Logout
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}