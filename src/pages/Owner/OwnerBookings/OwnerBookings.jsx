import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../lib/api";
import "./OwnerBookings.css";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch("/bookings/owner-bookings/");
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load owner bookings:", error);
        setErr(error.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  function getStatusClass(status) {
    if (status === "PENDING") return "status-pill pending";
    if (status === "BOOKED") return "status-pill confirmed";
    if (status === "COMPLETED") return "status-pill completed";
    if (status === "CANCELLED") return "status-pill cancelled";
    return "status-pill";
  }

  return (
    <div className="owner-bookings-page">
      <div className="owner-bookings-header">
        <div>
          <div className="badge">Bookings</div>
          <h1 className="owner-bookings-title">Bookings & Payments</h1>
          <p className="owner-bookings-subtitle">
            View all bookings made across your grounds.
          </p>
        </div>
      </div>

      {loading && (
        <div className="owner-bookings-empty-card">
          <div className="owner-bookings-empty-title">Loading...</div>
          <div className="owner-bookings-empty-sub">
            Please wait while we fetch your bookings.
          </div>
        </div>
      )}

      {err && (
        <div className="owner-bookings-empty-card">
          <div className="owner-bookings-empty-title">Something went wrong</div>
          <div className="owner-bookings-empty-sub">{err}</div>
        </div>
      )}

      {!loading && !err && bookings.length === 0 && (
        <div className="owner-bookings-empty-card">
          <div className="owner-bookings-empty-title">No bookings found</div>
          <div className="owner-bookings-empty-sub">
            No one has booked your grounds yet.
          </div>
        </div>
      )}

      {!loading && !err && bookings.length > 0 && (
        <div className="owner-bookings-grid">
          {bookings.map((b) => (
            <div key={b.id} className="owner-booking-card">
              <div className="owner-booking-top">
                <div>
                  <div className="owner-booking-ground">{b.ground_name}</div>
                  <div className="owner-booking-location">{b.location}</div>
                </div>
                <div className={getStatusClass(b.status)}>{b.status}</div>
              </div>

              <div className="owner-booking-date">{b.date}</div>

              <div className="owner-booking-badges">
                <div className="owner-pill">
                  {b.start_time} - {b.end_time}
                </div>
                {b.booking_type ? <div className="owner-pill">{b.booking_type}</div> : null}
                <div className="owner-pill">
                  Rs. {b.paid_amount ? b.paid_amount : "0.00"}
                </div>
              </div>

              <div className="owner-booking-extra">
                <p>
                  Players: <span>{b.current_players} / {b.required_players}</span>
                </p>
                <p>
                  Total Amount: <span>{b.total_amount ? `Rs. ${b.total_amount}` : "N/A"}</span>
                </p>
                <p>
                  Remaining Amount: <span>{b.remaining_amount ? `Rs. ${b.remaining_amount}` : "N/A"}</span>
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

      <div className="owner-bookings-back">
        <Link to="/owner" className="owner-bookings-back-link">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}