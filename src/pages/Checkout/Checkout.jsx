import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";
import { apiFetch } from "../../lib/api";

function postToEsewa(actionUrl, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;

  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
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

  const price = state?.price || 0;
  const payNow = Math.round(price * 0.2);

  const onPayEsewa = async () => {
    setPaying(true);
    setErr("");
    try {
      const data = await apiFetch("/api/payments/esewa/initiate/", {
        method: "POST",
        body: JSON.stringify({
          ground: state.groundId,
          date: state.dateYMD,          // "YYYY-MM-DD"
          start_time: state.start_time, // "06:00"
          end_time: state.end_time,     // "07:00"
          total_amount: payNow,         // pay 20%
        }),
      });

      postToEsewa(data.action_url, data.fields);
    } catch (e) {
      setErr(e?.message || "Payment init failed");
    } finally {
      setPaying(false);
    }
  };

  if (!state) return <div>Missing checkout data</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Checkout</h2>
      {err && <div style={{ color: "red" }}>{err}</div>}
<div>Ground: {state.groundName}</div>
      <div>Date: {state.dateLabel}</div>
      <div>Time: {state.timeLabel}</div>
      <div>Total: NPR {price}</div>
      <div>Pay Now (20%): NPR {payNow}</div>

      <button disabled={paying} onClick={onPayEsewa}>
        {paying ? "Redirecting..." : "Pay with eSewa"}
      </button>

      <button onClick={() => nav(-1)} style={{ marginLeft: 8 }}>
        Back
      </button>
    </div>
  );
}

