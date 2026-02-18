import React from "react";
import "./Footer.css";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="footer-container">
      {/* Floating Logo */}
      <div className="footer-logo">
        <img src={logo} alt="Sportify Logo" />
      </div>

      {/* Footer Navigation */}
      <nav className="footer-nav" aria-label="Footer Navigation">
        <a href="#">Demo</a>
        <a href="#">Support</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms & Conditions</a>
      </nav>

      {/* Copyright */}
      <p className="footer-text">
        © 2026 Sportify | Final Year Project
      </p>
    </footer>
  );
}
