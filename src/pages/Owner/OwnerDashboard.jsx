import React from "react";
import { useNavigate } from "react-router-dom";
import "./OwnerDashboard.css";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="ownerDash">
      <div className="ownerDash__header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Manage your grounds, bookings, and earnings from one place.</p>
        </div>
        <button className="primaryBtn" onClick={() => navigate("/createground")}>
          + Create Ground
        </button>
      </div>

      <div className="ownerDash__grid">
        <div className="card" onClick={() => navigate("/owner/grounds")}>
          <h3>My Grounds</h3>
          <p>View & edit grounds you have added.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card" onClick={() => navigate("/owner/bookings")}>
          <h3>Bookings & Payments</h3>
          <p>See booking requests and payment status.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card" onClick={() => navigate("/owner/reports")}>
          <h3>Reports</h3>
          <p>Daily/weekly revenue and usage insights.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card ghost">
          <h3>Quick Tip</h3>
          <p>
            Add clear photos + accurate price/hour. It increases bookings a lot.
          </p>
        </div>
      </div>
    </div>
  );
}