import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function MyBookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const payment = searchParams.get("payment");
    const bookingId = searchParams.get("booking_id");
    const tx = searchParams.get("tx");

    if (payment === "success") {
      if (bookingId) {
        navigate(
          `/mybookings/${bookingId}?payment=success${tx ? `&tx=${tx}` : ""}`,
          { replace: true }
        );
        return;
      }
    } else if (payment === "failure") {
      alert("Payment failed. Please try again.");
      navigate("/mybookings", { replace: true });
      return;
    } else if (payment === "slot_taken") {
      alert("Sorry, that slot has already been booked.");
      navigate("/mybookings", { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch("/api/bookings/my/");
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setErr(error.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h2>My Bookings</h2>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && !err && bookings.length === 0 && (
        <p>No bookings found.</p>
      )}

      {!loading && !err && bookings.length > 0 && (
        <div style={{ display: "grid", gap: 16 }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ margin: "0 0 8px" }}>{b.ground_name}</h3>
              <p style={{ margin: "4px 0" }}>{b.location}</p>
              <p style={{ margin: "4px 0" }}>Date: {b.date}</p>
              <p style={{ margin: "4px 0" }}>
                Time: {b.start_time} - {b.end_time}
              </p>
              <p style={{ margin: "4px 0" }}>Status: {b.status}</p>

              <div style={{ marginTop: 10 }}>
                <Link to={`/mybookings/${b.id}`}>View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}