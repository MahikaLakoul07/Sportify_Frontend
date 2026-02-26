// PaymentSuccess.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
export default function PaymentSuccess() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 16 }}>
      <h2>Payment Successful</h2>
      <button onClick={() => nav("/")}>Go Home</button>
    </div>
  );
}