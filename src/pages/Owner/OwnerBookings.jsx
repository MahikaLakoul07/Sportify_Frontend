import React from "react";
import { Link } from "react-router-dom";

export default function OwnerBookings() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Bookings & Payments</h2>
      <p>Next step: show booking list + actions (accept/reject/close match).</p>
      <Link to="/owner">← Back to Dashboard</Link>
    </div>
  );
}