// PaymentFailure.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
export default function PaymentFailure() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 16 }}>
      <h2>Payment Failed / Cancelled</h2>
      <button onClick={() => nav(-1)}>Go Back</button>
    </div>
  );
}