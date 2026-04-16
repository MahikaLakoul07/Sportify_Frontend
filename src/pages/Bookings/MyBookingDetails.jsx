import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./MyBookingDetails.css";

export default function MyBookingDetails() {
  const nav = useNavigate();
  const { bookingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [paymentPopup, setPaymentPopup] = useState({
    open: false,
    type: "",
    tx: "",
  });

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch(`/bookings/${bookingId}/`);
        setBooking(data);
      } catch (error) {
        console.error("Failed to load booking details:", error);
        setErr(error.message || "Booking not found.");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const tx = searchParams.get("tx") || "";

    if (payment === "success" || payment === "failure") {
      setPaymentPopup({
        open: true,
        type: payment,
        tx: tx,
      });
    }
  }, [searchParams]);

  const closePaymentPopup = function () {
    setPaymentPopup({
      open: false,
      type: "",
      tx: "",
    });

    const newParams = new URLSearchParams(searchParams);
    newParams.delete("payment");
    newParams.delete("tx");
    newParams.delete("booking_id");

    setSearchParams(newParams, { replace: true });
  };

  const statusClass = useMemo(function () {
    if (!booking) return "status-pill";
    if (booking.status === "PENDING") return "status-pill pending";
    if (booking.status === "BOOKED") return "status-pill confirmed";
    if (booking.status === "COMPLETED") return "status-pill completed";
    return "status-pill cancelled";
  }, [booking]);

  const resetMessages = function () {
    setErr("");
    setSuccess("");
  };

  const onCancel = function () {
    resetMessages();

    if (!booking) return;

    if (booking.status !== "PENDING") {
      setErr("Only pending bookings can be cancelled.");
      return;
    }

    setSuccess("Cancel request prepared (connect backend later).");
  };

  const bookingTypeLabel = useMemo(() => {
    if (!booking) return "";
    if (booking.booking_type === "OPEN") return "PUBLIC";
    if (booking.booking_type === "CLOSED") return "PRIVATE";
    return booking.booking_type;
  }, [booking]);

  const paymentMethodLabel = useMemo(() => {
    if (!booking) return "";

    const mode = String(booking.payment_mode || "").toUpperCase();
    const source = String(booking.source || "").toUpperCase();

    if (mode === "PAY_DEPOSIT") return "PAY ON FIELD";
    if (mode === "PAY_FULL_ONLINE") return "ONLINE";

    if (source === "ONLINE") return "ONLINE";
    if (source === "OFFLINE") return "PAY ON FIELD";

    return "N/A";
  }, [booking]);


  const slotLabel = useMemo(() => {
    if (!booking) return "";
    return `${booking.start_time} - ${booking.end_time}`;
  }, [booking]);

  return (
    <div className="page-bg">
      <div className="container">
        <div className="details-header">
          <div>
            <div className="badge">Booking Details</div>

            <h1 className="h1" style={{ marginTop: 10 }}>
              {booking ? booking.ground_name : "Booking Details"}
            </h1>

            <p className="p">
              {booking
                ? booking.date + " • " + slotLabel
                : "Review details and manage your booking."}
            </p>
          </div>

          <button className="btn outline" onClick={() => nav(-1)}>
            Back
          </button>
        </div>

        {loading ? (
          <div className="card details-card">
            <div className="details-title">Loading...</div>
            <div className="details-sub">Fetching booking details.</div>
          </div>
        ) : !booking ? (
          <div className="card details-card">
            <div className="details-title">Booking not found</div>

            <div className="details-sub">
              {err || "This booking could not be found."}
            </div>

            <div className="details-actions">
              <Link to="/mybookings" className="btn primary">
                Go to My Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="card details-card">
            <div className="details-topRow">
              <div className="details-left">
                <div className="details-groundName">
                  {booking.ground_name || "Ground #" + booking.ground}
                </div>

                <div className="details-muted">
                  Ground ID: {booking.ground}
                </div>
              </div>

              <div className={statusClass}>{booking.status}</div>
            </div>

            <div className="details-grid">
              <div className="info-card">
                <div className="info-label">Date</div>
                <div className="info-value">{booking.date}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Time Slot</div>
                <div className="info-value">{slotLabel}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Booking Type</div>
                <div className="info-value">{bookingTypeLabel}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Payment</div>
                <div className="info-value">{paymentMethodLabel}</div>
              </div>

              <div className="info-card">
                <div className="info-label">
                  {booking.payment_mode === "PAY_DEPOSIT" ? "Deposit Paid" : "Paid Amount"}
                </div>
                <div className="info-value">
                  {booking.paid_amount ? `Rs. ${booking.paid_amount}` : "N/A"}
                </div>
              </div>
            </div>

            <div className="details-section">
              <div className="details-label">Notes</div>

              <div className="details-text">
                {booking.open_game_note ? booking.open_game_note : "No notes added."}
              </div>
            </div>

            {booking.booking_type === "OPEN" ? (
              <div className="details-section">
                <div className="details-label">Public Match</div>

                <div className="details-text">
                  Current Players: {booking.current_players} / {booking.required_players}
                </div>

              </div>
            ) : null}

            {err && booking ? <div className="details-error">{err}</div> : null}
            {success ? <div className="details-success">{success}</div> : null}

            <div className="details-actions">
              <Link to={"/grounds/" + booking.ground} className="btn outline">
                View Ground
              </Link>

              {booking.status === "PENDING" ? (
                <button className="btn primary" onClick={onCancel}>
                  Cancel Booking
                </button>
              ) : (
                <button className="btn primary" disabled>
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {paymentPopup.open ? (
        <div className="payment-popup-backdrop">
          <div className="payment-popup-card">
            <div
              className={
                paymentPopup.type === "success"
                  ? "payment-popup-icon success"
                  : "payment-popup-icon failure"
              }
            >
              {paymentPopup.type === "success" ? "✓" : "✕"}
            </div>

            <h2 className="payment-popup-title">
              {paymentPopup.type === "success"
                ? "Payment Successful"
                : "Payment Failed"}
            </h2>

            <p className="payment-popup-text">
              {paymentPopup.type === "success"
                ? "Your payment has been completed successfully."
                : "Your payment was cancelled or could not be completed."}
            </p>

            {paymentPopup.type === "success" && paymentPopup.tx ? (
              <p className="payment-popup-tx">
                Transaction ID: <span>{paymentPopup.tx}</span>
              </p>
            ) : null}

            <div className="payment-popup-actions">
              <button className="btn primary" onClick={closePaymentPopup}>
                Close
              </button>

              <button className="btn primary" onClick={() => nav("/")}>
                Go Home
              </button>

              <button
                className="btn primary"
                onClick={() => nav("/mybookings")}
              >
                My Bookings
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}