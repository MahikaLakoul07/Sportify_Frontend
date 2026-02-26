import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

const DEPOSIT_RATE = 0.2;

export default function Checkout() {
  const nav = useNavigate();
  const { state } = useLocation();

  // Expected from GroundDetails:
  // nav("/checkout", { state: { groundName, location, courtLabel, courtName, dateLabel, timeLabel, price } })
  const data = state || {};

  const price = Number(data.price || 0);

  // ✅ Deposit is ALWAYS compulsory
  const depositAmt = useMemo(() => {
    // keep 2 decimals
    return Math.round(price * DEPOSIT_RATE * 100) / 100;
  }, [price]);

  const remainingAmt = useMemo(() => {
    return Math.max(0, Math.round((price - depositAmt) * 100) / 100);
  }, [price, depositAmt]);

  // ✅ Modes now mean:
  // PAY_NOW   => pay 100% now
  // PAY_VENUE => pay only 20% now, rest at venue
  const [paymentMode, setPaymentMode] = useState("PAY_VENUE"); // PAY_NOW / PAY_VENUE
  const [promo, setPromo] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    note: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onApplyPromo = () => {
    alert("Promo logic later 🙂");
  };

  // ✅ Derived amounts based on mode
  const payNowTotal = paymentMode === "PAY_NOW" ? price : depositAmt;
  const payAtVenueTotal = paymentMode === "PAY_NOW" ? 0 : remainingAmt;

  const onPlaceBooking = () => {
    // Later connect backend:
    // POST /bookings/
    // {
    //   ground_id, date, time,
    //   deposit_required: true,
    //   payment_mode: paymentMode,
    //   charge_now: payNowTotal,
    //   pay_at_venue: payAtVenueTotal,
    //   customer: form...
    // }
    alert(
      `Booking placed (mock)\n\nMode: ${paymentMode}\nPay Now: NPR ${payNowTotal.toFixed(
        2
      )}\nPay at Venue: NPR ${payAtVenueTotal.toFixed(2)}`
    );
    nav("/");
  };

  const missingSelection = !data?.groundName || !data?.timeLabel;

  return (
    <div className="co-page">
      <div className="co-wrap">
        <div className="co-top">
          <button className="co-back" onClick={() => nav(-1)}>
            ← Back
          </button>
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
                  {data.courtLabel || "—"}{" "}
                  <span className="pill">{data.courtName || "—"}</span>
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

              {/* ✅ Compulsory Deposit Banner */}
              <div className="depositNotice">
                <div className="depositLeft">
                  <span className="depositBadge">Compulsory</span>
                  <div className="depositText">
                    20% deposit is required to confirm booking.
                  </div>
                </div>
                <div className="depositAmt">NPR {depositAmt.toFixed(2)}</div>
              </div>

              <div className="payChoices">
                {/* ✅ Pay full now */}
                <button
                  type="button"
                  className={`payChoice ${
                    paymentMode === "PAY_NOW" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMode("PAY_NOW")}
                >
                  <div className="payChoiceTop">
                    <strong>Pay Now (100%)</strong>
                    <span>NPR {price.toFixed(2)}</span>
                  </div>
                  <div className="muted">Pay full amount online now</div>
                  <div className="helpText">
                    Deposit included. Pay at venue: NPR 0.00
                  </div>
                </button>

                {/* ✅ Pay deposit now, rest at venue */}
                <button
                  type="button"
                  className={`payChoice ${
                    paymentMode === "PAY_VENUE" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMode("PAY_VENUE")}
                >
                  <div className="payChoiceTop">
                    <strong>Pay at Venue</strong>
                    <span>NPR {depositAmt.toFixed(2)}</span>
                  </div>
                  <div className="muted">
                    Pay 20% now, remaining 80% at venue
                  </div>
                  <div className="helpText">
                    Remaining at venue: NPR {remainingAmt.toFixed(2)}
                  </div>
                </button>
              </div>

              {/* Promo (optional) */}
              <div className="promoRow">
                {/* If you later add an input again, you can use promo + setPromo */}
                <button className="applyBtn" type="button" onClick={onApplyPromo}>
                  Apply
                </button>
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

              {/* ✅ Always show compulsory deposit */}
              <div className="sideLine">
                <span>Compulsory Deposit (20%)</span>
                <strong>NPR {depositAmt.toFixed(2)}</strong>
              </div>

              <div className="sideLine">
                <span>Pay at Venue</span>
                <strong>NPR {payAtVenueTotal.toFixed(2)}</strong>
              </div>

               <div className="sideLine">
                <span>Pay Now</span>
                <strong>NPR {payNowTotal.toFixed(2)}</strong>
              </div>

              <div className="divider" />

              <button
                className="placeBtn"
                disabled={missingSelection || !form.full_name.trim() || !form.phone.trim()}
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