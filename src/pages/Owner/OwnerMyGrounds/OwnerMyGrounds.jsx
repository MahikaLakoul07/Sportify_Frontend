import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../lib/api";

export default function OwnerMyGrounds() {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadMyGrounds() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch("/api/owner/grounds/");
        setGrounds(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("loadMyGrounds error:", error);
        setErr(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadMyGrounds();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h2>My Grounds</h2>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{err}</p>}

      {!loading && !err && grounds.length === 0 && (
        <p>You have not created any grounds yet.</p>
      )}

      {!loading && !err && grounds.length > 0 && (
        <div style={{ display: "grid", gap: 16 }}>
          {grounds.map((g) => (
            <div
              key={g.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              {g.image_url ? (
                <img
                  src={g.image_url}
                  alt={g.name}
                  style={{
                    width: 140,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 140,
                    height: 100,
                    borderRadius: 8,
                    background: "#f2f2f2",
                    display: "grid",
                    placeItems: "center",
                    color: "#777",
                    fontSize: 14,
                  }}
                >
                  No image
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px" }}>{g.name}</h3>
                <p style={{ margin: "4px 0" }}>{g.location}</p>
                <p style={{ margin: "4px 0" }}>Rs. {g.price_per_hour}/hour</p>
                <p style={{ margin: "4px 0" }}>Size: {g.ground_size}</p>
                <p style={{ margin: "4px 0" }}>Status: {g.status}</p>
                <p style={{ margin: "4px 0" }}>Owner ID: {g.owner_id}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to={`/owner/grounds/${g.id}/edit`}>Edit</Link>
                <Link to={`/owner/grounds/${g.id}/availability`}>Availability</Link>
                <Link to={`/owner/grounds/${g.id}/bookings`}>Bookings</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/owner">← Back to Dashboard</Link>
      </div>
    </div>
  );
}