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

        <button
          className="primaryBtn"
          onClick={() => navigate("/createground")}
        >
          + Create Ground
        </button>
      </div>

      <div className="statsRow">
        <div className="statCard">
          <span>Total Revenue</span>
          <h2>Rs 0</h2>
          <small>This month</small>
        </div>

        <div className="statCard">
          <span>Total Bookings</span>
          <h2>0</h2>
          <small>All time</small>
        </div>

        <div className="statCard">
          <span>Active Grounds</span>
          <h2>0</h2>
          <small>Currently listed</small>
        </div>

        <div className="statCard">
          <span>Pending Payments</span>
          <h2>0</h2>
          <small>Awaiting confirmation</small>
        </div>
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
      </div>

    </div>
  );
}