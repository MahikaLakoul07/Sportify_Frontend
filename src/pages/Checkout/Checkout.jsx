import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";
import { apiFetch } from "../../lib/api";

function prettifyPosition(value) {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}

function postToEsewa(actionUrl, fields) {
  console.log("POSTING TO ESEWA URL:", actionUrl);
  console.log("POSTING TO ESEWA FIELDS:", fields);

  if (!actionUrl) {
    throw new Error("Missing eSewa action URL.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";

  Object.entries(fields || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function Checkout() {
  const { state } = useLocation();
  const nav = useNavigate();

  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");
  const [paymentMode, setPaymentMode] = useState("PAY_DEPOSIT");

  const price = Number(state?.price || 0);

  const deposit = useMemo(() => {
    return Math.max(1, Math.round(price * 0.2));
  }, [price]);

  const payNow = useMemo(() => {
    return paymentMode === "PAY_FULL_ONLINE" ? price : deposit;
  }, [paymentMode, price, deposit]);

  const payAtVenue = useMemo(() => {
    return paymentMode === "PAY_FULL_ONLINE" ? 0 : Math.max(0, price - deposit);
  }, [paymentMode, price, deposit]);

  const prettyPositions = useMemo(() => {
    return (state?.neededPositions || []).map(prettifyPosition);
  }, [state]);

  const isOpenBooking = state?.bookingType === "OPEN";

  const onPayEsewa = async () => {
    if (paying) return;

    if (!state?.groundId || !state?.dateYMD || !state?.start_time || !state?.end_time) {
      setErr("Missing booking data. Please go back and try again.");
      return;
    }

    setPaying(true);
    setErr("");

    try {
      const payload = {
        ground: state.groundId,
        date: state.dateYMD,
        start_time: state.start_time,
        end_time: state.end_time,
        booking_type: state.bookingType || "CLOSED",
        required_players: isOpenBooking ? Number(state.requiredPlayers || 1) : 1,
        open_game_note: isOpenBooking ? state.openGameNote || "" : "",
        needed_positions: isOpenBooking ? state.neededPositions || [] : [],
        total_amount: Number(payNow),
        payment_mode: paymentMode,
      };

      console.log("ESEWA INIT PAYLOAD:", payload);

      const data = await apiFetch("/payments/esewa/initiate/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("ESEWA INIT RESPONSE:", data);

      if (data?.mode === "mock" && data?.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }

      const actionUrl =
        data?.action_url ||
        data?.form_url ||
        data?.payment_url ||
        data?.url ||
        "";

      if (!actionUrl) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Missing eSewa action URL from backend."
        );
      }

      const fields = data?.fields || data?.form_data || {};

      if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Missing eSewa fields from backend."
        );
      }

      postToEsewa(actionUrl, fields);
    } catch (e) {
      console.error("PAYMENT INIT ERROR:", e);
      setErr(e?.message || "Payment initialization failed.");
      setPaying(false);
    }
  };

  if (!state) {
    return (
      <div className="co-page">
        <div className="co-wrap">
          <div className="co-card">
            <div className="co-cardTitle">Missing checkout data</div>
            <div className="helpText">
              Booking information is missing. Please go back and select your ground, date, and slot again.
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="co-back" onClick={() => nav("/grounds")}>
                Go to Grounds
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div className="co-wrap">
        <div className="co-top">
          <button className="co-back" onClick={() => nav(-1)}>
            ← Back
          </button>

          <div>
            <h2 className="co-title">Checkout</h2>
            <div className="co-sub">
              Choose payment method. Deposit is compulsory for all bookings.
            </div>
          </div>
        </div>

        {err && <div className="co-warning">{err}</div>}

        <div className="co-grid">
          <div>
            <div className="co-card">
              <div className="co-cardTitle">Booking Summary</div>

              <div className="sumRow">
                <div>
                  <div className="sumBig">{state.groundName}</div>
                  <div className="sumMuted">{state.location}</div>
                </div>

                <div className="sumTag">
                  <span className="pill">{state.courtLabel}</span>
                  <span className="pill">{state.courtName}</span>
                </div>
              </div>

              <div className="sumGrid">
                <div className="sumBox">
                  <div className="sumLabel">Date</div>
                  <div className="sumValue">{state.dateLabel}</div>
                </div>
                <div className="sumBox">
                  <div className="sumLabel">Time</div>
                  <div className="sumValue">{state.timeLabel}</div>
                </div>
                <div className="sumBox">
                  <div className="sumLabel">Total</div>
                  <div className="sumValue">NPR {price}</div>
                </div>
              </div>

              <div style={{ height: 14 }} />

              <div className="sumGrid">
                <div className="sumBox">
                  <div className="sumLabel">Booking Type</div>
                  <div className="sumValue">
                    {isOpenBooking ? "Open Booking" : "Private Booking"}
                  </div>
                </div>

                <div className="sumBox">
                  <div className="sumLabel">Required Players</div>
                  <div className="sumValue">
                    {isOpenBooking ? state.requiredPlayers || 1 : 1}
                  </div>
                </div>
              </div>

              {isOpenBooking && (
                <>
                  <div style={{ height: 14 }} />

                  <div className="sumBox">
                    <div className="sumLabel">Required Positions</div>
                    <div className="sumValue">
                      {prettyPositions.length
                        ? prettyPositions.join(", ")
                        : "No positions selected"}
                    </div>
                  </div>

                  <div style={{ height: 12 }} />

                  <div className="sumBox">
                    <div className="sumLabel">Open Game Note</div>
                    <div className="sumValue">
                      {state.openGameNote || "No note added"}
                    </div>
                  </div>

                  <div style={{ height: 12 }} />

                  <div className="helpText">
                    For open bookings, a temporary group chat will be available
                    after successful payment and booking confirmation.
                  </div>
                </>
              )}
            </div>

            <div className="co-card">
              <div className="co-cardTitle">Payment Options</div>

              <div className="payChoices">
                <button
                  type="button"
                  className={`payChoice ${paymentMode === "PAY_FULL_ONLINE" ? "active" : ""}`}
                  onClick={() => setPaymentMode("PAY_FULL_ONLINE")}
                >
                  <div className="payChoiceTop">
                    <strong>Pay Online (Full Amount)</strong>
                    <span className="pill">100% Now</span>
                  </div>
                  <div className="muted">
                    Pay NPR {price} online now. Nothing to pay at venue.
                  </div>
                </button>

                <button
                  type="button"
                  className={`payChoice ${paymentMode === "PAY_DEPOSIT" ? "active" : ""}`}
                  onClick={() => setPaymentMode("PAY_DEPOSIT")}
                >
                  <div className="payChoiceTop">
                    <strong>Pay on Field</strong>
                    <span className="pill">20% Deposit Now</span>
                  </div>
                  <div className="muted">
                    Pay NPR {deposit} now. Pay remaining at venue.
                  </div>
                </button>
              </div>

              <div style={{ height: 12 }} />

              <div className="depositNotice">
                <div className="depositLeft">
                  <span className="depositBadge">Pay Now</span>
                  <span className="depositText">
                    {paymentMode === "PAY_FULL_ONLINE"
                      ? "Full payment online"
                      : "Compulsory 20% deposit"}
                  </span>
                </div>
                <div className="depositAmt">NPR {payNow}</div>
              </div>

              <div className="divider" />

              <div className="sideLine">
                <span className="muted">Total amount</span>
                <strong>NPR {price}</strong>
              </div>

              <div className="sideLine">
                <span className="muted">Pay now</span>
                <strong>NPR {payNow}</strong>
              </div>

              <div className="sideLine" style={{ borderBottom: "none" }}>
                <span className="muted">Pay at venue</span>
                <strong>NPR {payAtVenue}</strong>
              </div>

              <div className="helpText">
                Deposit is compulsory for booking confirmation. Choose full online
                payment if you do not want to pay anything at the venue.
              </div>
            </div>
          </div>

          <div className="co-right">
            <div className="co-side">
              <div className="sideTitle">PAY & CONFIRM</div>

              <div className="sideLine">
                <span className="muted">Selected mode</span>
                <strong>
                  {paymentMode === "PAY_FULL_ONLINE"
                    ? "Pay Online (Full)"
                    : "Pay on Field (Deposit)"}
                </strong>
              </div>

              <div className="sideLine">
                <span className="muted">Booking type</span>
                <strong>
                  {isOpenBooking ? "Open Booking" : "Private Booking"}
                </strong>
              </div>

              <div className="sideLine">
                <span className="muted">Pay now</span>
                <strong>NPR {payNow}</strong>
              </div>

              <button className="placeBtn" disabled={paying} onClick={onPayEsewa}>
                {paying ? "Redirecting..." : `Pay NPR ${payNow} with eSewa`}
              </button>

              <div className="finePrint">
                {paymentMode === "PAY_FULL_ONLINE"
                  ? "You are paying the full amount online now."
                  : "You are paying 20% deposit now. Remaining will be paid at the venue."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}