import React from "react";
import { Link } from "react-router-dom";

export default function OwnerReports() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Reports</h2>
      <p>Next step: revenue totals + charts.</p>
      <Link to="/owner">← Back to Dashboard</Link>
    </div>
  );
}