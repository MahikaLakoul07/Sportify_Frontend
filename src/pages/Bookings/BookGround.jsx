// src/pages/Bookings/BookGround.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./BookGround.css";

export default function BookGround() {
  // URL param: /grounds/:id/book
  const { id } = useParams();
  const nav = useNavigate();

  // ----------------------------
  // Form state
  // ----------------------------
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");

  // Booking Type: PUBLIC / PRIVATE
  const [bookingType, setBookingType] = useState("PUBLIC");

  // Payment Method: FIELD / ONLINE
  const [paymentMethod, setPaymentMethod] = useState("FIELD");

  // Public match extras
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [teamName, setTeamName] = useState("");

  // Private match extras
  const [privateCode, setPrivateCode] = useState("");

  // UI messages
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Slots (UI-only for now)
  const slots = useMemo(function () {
    return [
      "06:00 - 07:00",
      "07:00 - 08:00",
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
    ];
  }, []);

  // Minimum date = today
  const minDate = useMemo(function () {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return String(yyyy) + "-" + mm + "-" + dd;
  }, []);

  const resetMessages = function () {
    setErr("");
    setSuccess("");
  };

  const handleSlotClick = function (slot) {
    setSelectedSlot(slot);
    resetMessages();
  };

  const handleConfirm = function () {
    resetMessages();

    // Basic validation
    if (!date) {
      setErr("Please select a date.");
      return;
    }
    if (!selectedSlot) {
      setErr("Please select a time slot.");
      return;
    }

    // Public-only validation
    if (bookingType === "PUBLIC") {
      if (!maxPlayers || Number(maxPlayers) < 2) {
        setErr("Max players must be at least 2.");
        return;
      }
    }

    // Payload (ready for backend later)
    const payload = {
      ground_id: id,
      date: date,
      slot: selectedSlot,
      booking_type: bookingType, // PUBLIC / PRIVATE
      payment_method: paymentMethod, // FIELD / ONLINE
      notes: notes,
      team_name: bookingType === "PUBLIC" ? teamName : null,
      max_players: bookingType === "PUBLIC" ? Number(maxPlayers) : null,
      private_code: bookingType === "PRIVATE" ? privateCode : null,
    };

    // UI-only success
    setSuccess(
      "Booking prepared (" +
        bookingType +
        "). Payment: " +
        paymentMethod +
        ". Ready to connect backend."
    );

    // console.log(payload);
  };

  return (
    <div className="page-bg">
      <div className="container">
        {/* Header */}
        <div className="booking-header">
          <div>
            <div className="badge">Booking</div>

            <h1 className="h1" style={{ marginTop: 10 }}>
              Book <span>Ground</span>
            </h1>

            <p className="p">
              Choose booking type (Public/Private), payment, date, and slot.
            </p>
          </div>

          <button className="btn outline" onClick={() => nav(-1)}>
            Back
          </button>
        </div>

        {/* Main Card */}
        <div className="card booking-card">
          {/* Ground ID info */}
          <div className="booking-groundInfo">
            <div className="booking-label">Ground</div>
            <div className="booking-value">#{id}</div>
          </div>

          {/* Booking Type (Aesthetic Cards) */}
          <div className="booking-section">
            <div className="booking-label">Booking Type</div>

            <div className="choice-grid">
              <button
                type="button"
                className={
                  bookingType === "PUBLIC"
                    ? "choice-card active"
                    : "choice-card"
                }
                onClick={() => {
                  setBookingType("PUBLIC");
                  resetMessages();
                }}
              >
                <div className="choice-top">
                  <span className="choice-badge">Public</span>
                </div>
                <div className="choice-title">Public Match</div>
                <div className="choice-desc">
                  Allow other players to request to join your match.
                </div>
              </button>

              <button
                type="button"
                className={
                  bookingType === "PRIVATE"
                    ? "choice-card active"
                    : "choice-card"
                }
                onClick={() => {
                  setBookingType("PRIVATE");
                  resetMessages();
                }}
              >
                <div className="choice-top">
                  <span className="choice-badge private">Private</span>
                </div>
                <div className="choice-title">Private Match</div>
                <div className="choice-desc">
                  Only your group. No public join requests.
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method (Aesthetic Cards) */}
          <div className="booking-section">
            <div className="booking-label">Payment Method</div>

            <div className="choice-grid">
              <button
                type="button"
                className={
                  paymentMethod === "FIELD"
                    ? "choice-card active"
                    : "choice-card"
                }
                onClick={() => {
                  setPaymentMethod("FIELD");
                  resetMessages();
                }}
              >
                <div className="choice-top">
                  <span className="choice-badge">Field</span>
                </div>
                <div className="choice-title">Pay on Field</div>
                <div className="choice-desc">
                  Pay after you arrive. Owner confirms payment.
                </div>
              </button>

              <button
                type="button"
                className={
                  paymentMethod === "ONLINE"
                    ? "choice-card active"
                    : "choice-card"
                }
                onClick={() => {
                  setPaymentMethod("ONLINE");
                  resetMessages();
                }}
              >
                <div className="choice-top">
                  <span className="choice-badge online">Online</span>
                </div>
                <div className="choice-title">Online Payment</div>
                <div className="choice-desc">
                  Secure gateway (integration later).
                </div>
              </button>
            </div>
          </div>

          {/* Date selection */}
          <div className="booking-section">
            <div className="booking-label">Select Date</div>
            <input
              className="input"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => {
                setDate(e.target.value);
                resetMessages();
              }}
            />
          </div>

          {/* Time slots */}
          <div className="booking-section">
            <div className="booking-label">Select Time Slot</div>

            <div className="booking-slots">
              {slots.map(function (slot) {
                const active = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={active ? "slot-btn slot-active" : "slot-btn"}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {/* Premium Summary */}
            <div className="summary-card">
              <div className="summary-title">Booking Summary</div>

              <div className="summary-row">
                <span className="summary-muted">Ground</span>
                <span className="summary-strong">#{id}</span>
              </div>

              <div className="summary-row">
                <span className="summary-muted">Date</span>
                <span className="summary-strong">{date ? date : "—"}</span>
              </div>

              <div className="summary-row">
                <span className="summary-muted">Slot</span>
                <span className="summary-strong">
                  {selectedSlot ? selectedSlot : "—"}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-muted">Type</span>
                <span className="pill">{bookingType}</span>
              </div>

              <div className="summary-row">
                <span className="summary-muted">Payment</span>
                <span className="pill">
                  {paymentMethod === "FIELD" ? "PAY ON FIELD" : "ONLINE"}
                </span>
              </div>

              <div className="summary-hint">
                Tip: Choose a slot, then confirm booking.
              </div>
            </div>
          </div>

          {/* Conditional fields */}
          {bookingType === "PUBLIC" ? (
            <div className="booking-section">
              <div className="booking-label">Public Match Settings</div>

              <div className="booking-twoCol">
                <div>
                  <div className="booking-subLabel">Team Name (optional)</div>
                  <input
                    className="input"
                    placeholder="e.g., Thapathali Warriors"
                    value={teamName}
                    onChange={(e) => {
                      setTeamName(e.target.value);
                      resetMessages();
                    }}
                  />
                </div>

                <div>
                  <div className="booking-subLabel">Max Players</div>
                  <input
                    className="input"
                    type="number"
                    min={2}
                    max={20}
                    value={maxPlayers}
                    onChange={(e) => {
                      setMaxPlayers(e.target.value);
                      resetMessages();
                    }}
                  />
                </div>
              </div>

              <div className="booking-hint">
                This controls join requests + roster capacity (later).
              </div>
            </div>
          ) : (
            <div className="booking-section">
              <div className="booking-label">Private Match Settings</div>

              <div className="booking-subLabel">Private Code (optional)</div>
              <input
                className="input"
                placeholder="Set a code to share with friends (optional)"
                value={privateCode}
                onChange={(e) => {
                  setPrivateCode(e.target.value);
                  resetMessages();
                }}
              />

              <div className="booking-hint">
                Private bookings won’t accept public join requests.
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="booking-section">
            <div className="booking-label">Notes (optional)</div>
            <textarea
              className="input booking-notes"
              rows={4}
              placeholder="Any special request? (e.g., need ball, bibs, etc.)"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                resetMessages();
              }}
            />
          </div>

          {/* Error / Success */}
          {err ? <div className="booking-error">{err}</div> : null}
          {success ? <div className="booking-success">{success}</div> : null}

          {/* Actions */}
          <div className="booking-actions">
            <button className="btn outline" onClick={() => nav("/grounds/" + id)}>
              View Ground
            </button>

            <button className="btn primary" onClick={handleConfirm}>
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
