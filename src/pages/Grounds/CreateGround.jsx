import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./CreateGround.css";

export default function CreateGround() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_hour: "",
    description: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      // payload to backend
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        price_per_hour: Number(form.price_per_hour),
        description: form.description.trim(),
        phone: form.phone.trim(),
      };

      // remove empty optional fields
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
      });

      await apiFetch("/grounds/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("Ground submitted! Status: PENDING (Admin will approve).");

      // reset
      setForm({
        name: "",
        location: "",
        price_per_hour: "",
        description: "",
        phone: "",
      });

      // redirect after short moment (instant is fine too)
      setTimeout(() => navigate("/grounds"), 800);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg">
      <div className="container">
        <div className="createGround-header">
          <div>
            <div className="badge">Owner Panel</div>
            <h1 className="h1" style={{ marginTop: 10 }}>
              Create <span>Ground</span>
            </h1>
            <p className="p">
              Add your futsal ground details. It will be visible after admin approval.
            </p>
          </div>
        </div>

        <div className="card createGround-card">
          <form onSubmit={onSubmit} className="createGround-form">
            <div className="createGround-grid">
              <div>
                <label className="createGround-label">Ground Name</label>
                <input
                  className="input"
                  name="name"
                  placeholder="e.g., KhelKunj Arena"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className="createGround-label">Location</label>
                <input
                  className="input"
                  name="location"
                  placeholder="e.g., Thapathali"
                  value={form.location}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className="createGround-label">Price per Hour (Rs)</label>
                <input
                  className="input"
                  name="price_per_hour"
                  type="number"
                  placeholder="e.g., 1500"
                  value={form.price_per_hour}
                  onChange={onChange}
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="createGround-label">Contact Phone (optional)</label>
                <input
                  className="input"
                  name="phone"
                  placeholder="e.g., 98XXXXXXXX"
                  value={form.phone}
                  onChange={onChange}
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="createGround-label">Description (optional)</label>
              <textarea
                className="input createGround-textarea"
                name="description"
                placeholder="Facilities, parking, rules, etc."
                value={form.description}
                onChange={onChange}
                rows={4}
              />
            </div>

            {err ? <div className="createGround-error">{err}</div> : null}
            {success ? <div className="createGround-success">{success}</div> : null}

            <div className="createGround-actions">
              <button className="btn outline" type="button" onClick={() => navigate(-1)}>
                Back
              </button>

              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Ground"}
              </button>
            </div>
          </form>
        </div>

        <div className="card-soft createGround-note">
          <div className="p" style={{ marginTop: 0 }}>
            After you submit, the ground will be <b>PENDING</b>.  
            Admin will approve it, then it appears in the Grounds list.
          </div>
        </div>
      </div>
    </div>
  );
}
