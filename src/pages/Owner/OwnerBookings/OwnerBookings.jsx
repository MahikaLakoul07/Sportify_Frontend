import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../../lib/api";
import "./OwnerBookings.css";

export default function OwnerGroundBookings() {
  const { id } = useParams();

  const [ground, setGround] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch(`/api/owner/grounds/${id}/bookings/`);
        setGround(data?.ground || null);
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
      } catch (error) {
        console.error("loadBookings error:", error);
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
        {ground && (
          <p className="owner-bookings-subtitle">
            {ground.name} · {ground.location}
          </p>
        )}
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
                  <span>Date:</span> {b.date}
                </p>
                <p className="owner-booking-line">
                  <span>Time:</span> {b.start_time} - {b.end_time}
                </p>
                <p className="owner-booking-line">
                  <span>Status:</span> {b.status}
                </p>
                <p className="owner-booking-line">
                  <span>Type:</span> {b.booking_type}
                </p>
              </div>

              <div className="owner-booking-side">
                <p className="owner-booking-line">
                  <span>Players:</span> {b.current_players}/{b.required_players}
                </p>
                <p className="owner-booking-line">
                  <span>Paid:</span> Rs. {b.paid_amount ?? 0}
                </p>
                <p className="owner-booking-line">
                  <span>Source:</span> {b.source}
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