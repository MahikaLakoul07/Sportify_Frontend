import React from "react";
import { Link } from "react-router-dom";

export default function OwnerMyGrounds() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>My Grounds</h2>
      <p>Next step: fetch your grounds list from backend and show here.</p>
      <Link to="/owner">← Back to Dashboard</Link>
    </div>
  );
}