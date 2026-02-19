import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./GroundDetails.css";

export default function GroundDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchOne = async () => {
    setLoading(true);
    setErr("");

    try {
      // IMPORTANT: use the same apiFetch base used in Grounds page
      // Also keep trailing slash because DRF usually requires it
      const data = await apiFetch("/grounds/" + id + "/", { method: "GET" });
      setGround(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    fetchOne();
  }, [id]);

  return (
    <div className="page-bg">
      <div className="container">
        <div className="card details-card">
          {loading ? <div>Loading...</div> : null}
          {err ? <div className="details-error">{err}</div> : null}

          {!loading && !err && ground ? (
            <>
              <div className="details-head">
                <div>
                  <h2 className="h2">{ground.name}</h2>
                  <div className="p">📍 {ground.location}</div>
                </div>

                <div className="details-right">
                  <div className="details-price">
                    Rs {(ground.price_per_hour ?? ground.price ?? "—")} / hour
                  </div>
                  <button className="btn outline" onClick={() => nav(-1)}>
                    Back
                  </button>
                </div>
              </div>

              <div className="details-section">
                <div className="details-label">Description</div>
                <div className="details-text">
                  {ground.description || "No description added."}
                </div>
              </div>

              <div className="details-actions">
                <button
                  className="btn primary"
                  onClick={() => nav("/grounds/" + id + "/book")}
                >
                  Book Now
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
