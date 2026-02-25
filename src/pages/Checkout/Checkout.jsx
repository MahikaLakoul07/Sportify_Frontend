import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const nav = useNavigate();
  const { state } = useLocation();

  // GroundDetails:
  // nav("/checkout", { state: { groundName, location, courtLabel, courtName, dateLabel, timeLabel, price } })

  const data = state || {};

  const price = Number(data.price || 0);
  const payNowAmt = useMemo(() => Math.round(price * 0.2), [price]);
  const payAtVenue = useMemo(() => price - payNowAmt, [price, payNowAmt]);

  const [paymentMode, setPaymentMode] = useState("PAY_NOW"); // PAY_NOW / PAY_LATER
  const [promo, setPromo] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    note: "",
  });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onApplyPromo = () => {
    alert("Promo logic later 🙂");
  };

  const onPlaceBooking = () => {
    // Later you will call backend:
    // POST /bookings/  { ground_id, court, date, time, payment_mode, customer... }
    alert("Booking placed (mock). Next: connect backend API.");
    nav("/");
  };

  const missingSelection = !data?.groundName || !data?.timeLabel;

  return (
    <div className="co-page">
      <div className="co-wrap">
        <div className="co-top">
          <button className="co-back" onClick={() => nav(-1)}>← Back</button>
          <div>
            <h1 className="co-title">Checkout</h1>
            <div className="co-sub">Confirm details and complete booking</div>
          </div>
        </div>

        {missingSelection && (
          <div className="co-warning">
            No selection found. Please select a slot from Ground Details first.
          </div>
        )}

        <div className="co-grid">
          {/* LEFT */}
          <div className="co-left">
            {/* Booking Summary */}
            <div className="co-card">
              <div className="co-cardTitle">Booking Summary</div>

              <div className="sumRow">
                <div className="sumLeft">
                  <div className="sumBig">{data.groundName || "—"}</div>
                  <div className="sumMuted">📍 {data.location || "—"}</div>
                </div>
                <div className="sumTag">
                  {data.courtLabel || "—"} <span className="pill">{data.courtName || "—"}</span>
                </div>
              </div>

              <div className="sumGrid">
                <div className="sumBox">
                  <div className="sumLabel">Date</div>
                  <div className="sumValue">{data.dateLabel || "—"}</div>
                </div>
                <div className="sumBox">
                  <div className="sumLabel">Time</div>
                  <div className="sumValue">{data.timeLabel || "—"}</div>
                </div>
                <div className="sumBox">
                  <div className="sumLabel">Price (1 hour)</div>
                  <div className="sumValue">NPR {price.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="co-card">
              <div className="co-cardTitle">Customer Details</div>

              <div className="co-form">
                <div className="co-field">
                  <label>Full Name</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={onChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="co-fieldRow">
                  <div className="co-field">
                    <label>Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="98XXXXXXXX"
                    />
                  </div>

                  <div className="co-field">
                    <label>Email (optional)</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="co-field">
                  <label>Note (optional)</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={onChange}
                    placeholder="Any special request?"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="co-card">
              <div className="co-cardTitle">Payment</div>

              <div className="payChoices">
                <button
                  className={`payChoice ${paymentMode === "PAY_NOW" ? "active" : ""}`}
                  onClick={() => setPaymentMode("PAY_NOW")}
                >
                  <div className="payChoiceTop">
                    <strong>Pay Now (20%)</strong>
                    <span>NPR {payNowAmt.toFixed(2)}</span>
                  </div>
                  <div className="muted">Confirm booking instantly</div>
                </button>

                <button
                  className={`payChoice ${paymentMode === "PAY_LATER" ? "active" : ""}`}
                  onClick={() => setPaymentMode("PAY_LATER")}
                >
                  <div className="payChoiceTop">
                    <strong>Pay at Venue</strong>
                    <span>NPR {price.toFixed(2)}</span>
                  </div>
                  <div className="muted">Pay full amount on arrival</div>
                </button>
              </div>

              <div className="promoRow">
                <input
                  className="promoInput"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Enter promo code"
                />
                <button className="applyBtn" onClick={onApplyPromo}>Apply</button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="co-right">
            <div className="co-side">
              <div className="sideTitle">ORDER SUMMARY</div>

              <div className="sideLine">
                <span>Base Price</span>
                <strong>NPR {price.toFixed(2)}</strong>
              </div>

              <div className="sideLine">
                <span>Pay Now</span>
                <strong>NPR {(paymentMode === "PAY_NOW" ? payNowAmt : 0).toFixed(2)}</strong>
              </div>

              <div className="sideLine">
                <span>Pay at Venue</span>
                <strong>
                  NPR {(paymentMode === "PAY_NOW" ? payAtVenue : price).toFixed(2)}
                </strong>
              </div>

              <div className="divider" />

              <button
                className="placeBtn"
                disabled={missingSelection || !form.full_name || !form.phone}
                onClick={onPlaceBooking}
              >
                Place Booking
              </button>

              <div className="finePrint">
                By placing booking, you agree to our terms & refund policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}