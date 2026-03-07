import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./MyBookingDetails.css";

export default function MyBookingDetails() {
  const nav = useNavigate();
  const { bookingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [paymentPopup, setPaymentPopup] = useState({
    open: false,
    type: "",
    tx: "",
  });

  const booking = useMemo(function () {
    const data = [
      {
        booking_id: 101,
        ground_id: 1,
        ground_name: "Dhuku Futsal Hub",
        date: "2026-02-20",
        slot: "18:00 - 19:00",
        booking_type: "PUBLIC",
        payment_method: "FIELD",
        status: "PENDING",
        notes: "Bring bibs if possible.",
      },
      {
        booking_id: 102,
        ground_id: 3,
        ground_name: "Field Futsal",
        date: "2026-02-10",
        slot: "19:00 - 20:00",
        booking_type: "PRIVATE",
        payment_method: "ONLINE",
        status: "CONFIRMED",
        notes: "",
      },
      {
        booking_id: 88,
        ground_id: 2,
        ground_name: "Khelkunj Arena",
        date: "2026-01-22",
        slot: "17:00 - 18:00",
        booking_type: "PUBLIC",
        payment_method: "FIELD",
        status: "COMPLETED",
        notes: "Good match.",
      },
      {
        booking_id: 77,
        ground_id: 1,
        ground_name: "Dhuku Futsal Hub",
        date: "2026-01-10",
        slot: "16:00 - 17:00",
        booking_type: "PRIVATE",
        payment_method: "FIELD",
        status: "CANCELLED",
        notes: "Cancelled due to rain.",
      },
    ];

    const idNum = Number(bookingId);
    return data.find(function (x) {
      return x.booking_id === idNum;
    });
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

    setSearchParams(newParams, { replace: true });
  };

  const statusClass = useMemo(function () {
    if (!booking) return "status-pill";
    if (booking.status === "PENDING") return "status-pill pending";
    if (booking.status === "CONFIRMED") return "status-pill confirmed";
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
                ? booking.date + " • " + booking.slot
                : "Review details and manage your booking."}
            </p>

            <p className="p">Review details and manage your booking.</p>
          </div>

          <button className="btn outline" onClick={() => nav(-1)}>
            Back
          </button>
        </div>

        {!booking ? (
          <div className="card details-card">
            <div className="details-title">Booking not found</div>

            <div className="details-sub">
              This booking ID does not exist in demo data.
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
                  {booking.ground_name || "Ground #" + booking.ground_id}
                </div>

                <div className="details-muted">
                  Ground ID: {booking.ground_id}
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
                <div className="info-value">{booking.slot}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Booking Type</div>
                <div className="info-value">{booking.booking_type}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Payment</div>
                <div className="info-value">{booking.payment_method}</div>
              </div>
            </div>

            <div className="details-section">
              <div className="details-label">Notes</div>

              <div className="details-text">
                {booking.notes ? booking.notes : "No notes added."}
              </div>
            </div>

            {booking.booking_type === "PUBLIC" ? (
              <div className="details-section">
                <div className="details-label">Public Match</div>

                <div className="details-text">
                  Players can request to join. (Requests UI will be added next.)
                </div>

                <div className="details-actions">
                  <button className="btn outline" disabled>
                    View Join Requests (next)
                  </button>
                </div>
              </div>
            ) : null}

            {err ? <div className="details-error">{err}</div> : null}
            {success ? <div className="details-success">{success}</div> : null}

            <div className="details-actions">
              <Link to={"/grounds/" + booking.ground_id} className="btn outline">
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

      {/* PAYMENT POPUP */}
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
              <button className="btn outline" onClick={closePaymentPopup}>
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