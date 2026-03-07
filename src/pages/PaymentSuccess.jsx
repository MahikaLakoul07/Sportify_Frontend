import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tx = params.get("tx");

  return (
    <div style={{ padding: 16 }}>
      <h2>Payment Successful</h2>
      {tx && <p>Transaction ID: {tx}</p>}
      <button onClick={() => nav("/")}>Go Home</button>
    </div>
  );
}