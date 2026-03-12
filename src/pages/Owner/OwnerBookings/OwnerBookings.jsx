import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../../lib/api";
import "./OwnerBookings.css";

export default function OwnerGroundBookings() {
  const { id } = useParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch(`/api/owner/grounds/${id}/bookings/`);
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load ground bookings:", error);
        setErr(error.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [id]);

  return (
    <div className="owner-bookings-page">
      <div className="owner-bookings-header">
        <h2 className="owner-bookings-title">Ground Bookings</h2>
        <p className="owner-bookings-subtitle">
          View all bookings made for this ground.
        </p>
      </div>

      {loading && <p className="owner-bookings-loading">Loading...</p>}
      {err && <p className="owner-bookings-error">{err}</p>}

      {!loading && !err && bookings.length === 0 && (
        <p className="owner-bookings-empty">No bookings found for this ground.</p>
      )}

      {!loading && !err && bookings.length > 0 && (
        <div className="owner-bookings-list">
          {bookings.map((b) => (
            <div key={b.id} className="owner-booking-card">
              <div className="owner-booking-main">
                <p className="owner-booking-line">
                  Ground: <span>{b.ground_name}</span>
                </p>
                <p className="owner-booking-line">
                  Date: <span>{b.date}</span>
                </p>
                <p className="owner-booking-line">
                  Time: <span>{b.start_time} - {b.end_time}</span>
                </p>
                <p className="owner-booking-line">
                  Status: <span>{b.status}</span>
                </p>
                <p className="owner-booking-line">
                  Type: <span>{b.booking_type}</span>
                </p>
              </div>

              <div className="owner-booking-side">
                <p className="owner-booking-line">
                  Players: <span>{b.current_players} / {b.required_players}</span>
                </p>
                <p className="owner-booking-line">
                  Paid Amount: <span>{b.paid_amount ? `Rs. ${b.paid_amount}` : "N/A"}</span>
                </p>
                <p className="owner-booking-line">
                  Total Amount: <span>{b.total_amount ? `Rs. ${b.total_amount}` : "N/A"}</span>
                </p>
                <p className="owner-booking-line">
                  Remaining Amount: <span>{b.remaining_amount ? `Rs. ${b.remaining_amount}` : "N/A"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="owner-bookings-back">
        <Link to="/owner/grounds" className="owner-bookings-back-link">
          ← Back to My Grounds
        </Link>
      </div>
    </div>
  );
}