import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../lib/api";
import "./OwnerMyGrounds.css";

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
    <div className="owner-grounds-page">
      <h2 className="owner-grounds-title">My Grounds</h2>

      {loading && <p className="owner-grounds-loading">Loading...</p>}
      {err && <p className="owner-grounds-error">{err}</p>}

      {!loading && !err && grounds.length === 0 && (
        <p className="owner-grounds-empty">
          You have not created any grounds yet.
        </p>
      )}

      {!loading && !err && grounds.length > 0 && (
        <div className="owner-grounds-grid">
          {grounds.map((g) => (
            <div key={g.id} className="owner-ground-card">
              {g.image_url ? (
                <img
                  src={g.image_url}
                  alt={g.name}
                  className="owner-ground-image"
                />
              ) : (
                <div className="owner-ground-no-image">No image</div>
              )}

              <div className="owner-ground-info">
                <h3 className="owner-ground-name">{g.name}</h3>
                <p className="owner-ground-text">{g.location}</p>
                <p className="owner-ground-text">Rs. {g.price_per_hour}/hour</p>
                <p className="owner-ground-text">Size: {g.ground_size}</p>
                <p className="owner-ground-text">Status: {g.status}</p>
                <p className="owner-ground-text">Owner ID: {g.owner_id}</p>
              </div>

              <div className="ground-actions">
                <Link
                  className="btn btn-edit"
                  to={`/owner/grounds/${g.id}/edit`}
                >
                  Edit
                </Link>

                <Link
                  className="btn btn-availability"
                  to={`/owner/grounds/${g.id}/availability`}
                >
                  Availability
                </Link>

                <Link
                  className="btn btn-bookings"
                  to={`/owner/grounds/${g.id}/bookings`}
                >
                  Bookings
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="owner-grounds-back">
        <Link to="/owner" className="owner-grounds-back-link">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}