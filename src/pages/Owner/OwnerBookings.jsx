import React from "react";
import { Link, useParams } from "react-router-dom";

export default function OwnerGroundBookings() {
  const { id } = useParams();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Ground Bookings</h2>
      <p>Ground ID: {id}</p>
      <p>Next step: fetch bookings of this ground from backend and show them here.</p>
      <Link to="/owner/grounds">← Back to My Grounds</Link>
    </div>
  );
}