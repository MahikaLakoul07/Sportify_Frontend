import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./MyBookings.css";

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

        const data = await apiFetch("/bookings/my/");
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

  function getStatusClass(status) {
    if (status === "PENDING") return "status-pill pending";
    if (status === "BOOKED") return "status-pill confirmed";
    if (status === "COMPLETED") return "status-pill completed";
    if (status === "CANCELLED") return "status-pill cancelled";
    return "status-pill";
  }

  return (
    <div className="page-bg">
      <div className="container">
        <div className="mybookings-header">
          <div>
            <div className="badge">Bookings</div>
            <h1 className="h1" style={{ marginTop: 10 }}>My Bookings</h1>
            <p className="p">Track your booked grounds and payment status.</p>
          </div>
        </div>

        {loading && (
          <div className="card mybookings-empty">
            <div className="empty-title">Loading...</div>
            <div className="empty-sub">Please wait while we fetch your bookings.</div>
          </div>
        )}

        {err && (
          <div className="card mybookings-empty">
            <div className="empty-title">Something went wrong</div>
            <div className="empty-sub">{err}</div>
          </div>
        )}

        {!loading && !err && bookings.length === 0 && (
          <div className="card mybookings-empty">
            <div className="empty-title">No bookings found</div>
            <div className="empty-sub">
              You have not made any bookings yet.
            </div>
            <div className="empty-actions">
              <Link to="/grounds" className="btn primary">
                Browse Grounds
              </Link>
            </div>
          </div>
        )}

        {!loading && !err && bookings.length > 0 && (
          <div className="mybookings-grid">
            {bookings.map((b) => (
              <div key={b.id} className="card booking-card2">
                <div className="booking-topRow">
                  <div className="booking-title">{b.ground_name}</div>
                  <div className={getStatusClass(b.status)}>{b.status}</div>
                </div>

                <div className="booking-metaRow">
                  <span>{b.location}</span>
                  <span>{b.date}</span>
                </div>

                <div className="booking-badges">
                  <div className="pill">
                    {b.start_time} - {b.end_time}
                  </div>
                  {b.booking_type ? (
                    <div className="pill">{b.booking_type}</div>
                  ) : null}
                  {b.paid_amount ? (
                    <div className="pill">Rs. {b.paid_amount}</div>
                  ) : null}
                </div>

                <div className="booking-actions2">
                  <Link to={`/mybookings/${b.id}`} className="btn primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}