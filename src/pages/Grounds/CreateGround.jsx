import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateGround.css";

// --- apiFetch helper for JSON and FormData ---
async function apiFetch(url, options = {}) {
  const headers = {};

  // If body is NOT FormData, set JSON headers
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    if (options.body) options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
    credentials: "include", // send cookies if using session auth
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export default function CreateGround() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_hour: "",
    description: "",
    phone: "",
    ground_size: "FIVE", // "FIVE" or "SEVEN"
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handle image selection
  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("location", form.location.trim());
      formData.append("price_per_hour", form.price_per_hour);
      formData.append("description", form.description.trim());
      formData.append("phone", form.phone.trim());
      formData.append("ground_size", form.ground_size);

      if (image) formData.append("image", image);

      // ✅ Full backend URL
      await apiFetch("http://localhost:8000/api/grounds/", {
        method: "POST",
        body: formData,
      });

      setSuccess(
        "Ground submitted! Status: PENDING (Admin will approve)."
      );

      // Reset form
      setForm({
        name: "",
        location: "",
        price_per_hour: "",
        description: "",
        phone: "",
        ground_size: "FIVE",
      });
      setImage(null);
      setPreview(null);

      // Redirect after short delay
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
                  min="0"
                  value={form.price_per_hour}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label className="createGround-label">Contact Phone</label>
                <input
                  className="input"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className="createGround-label">Ground Size</label>
                <select
                  className="input"
                  name="ground_size"
                  value={form.ground_size}
                  onChange={onChange}
                >
                  <option value="FIVE">5-a-side</option>
                  <option value="SEVEN">7-a-side</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="createGround-label">Description</label>
              <textarea
                className="input createGround-textarea"
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <label className="createGround-label">Ground Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="input"
              />
            </div>

            {preview && (
              <div className="createGround-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}

            {err && <div className="createGround-error">{err}</div>}
            {success && <div className="createGround-success">{success}</div>}

            <div className="createGround-actions">
              <button
                className="btn outline"
                type="button"
                onClick={() => navigate(-1)}
              >
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
            Admin will approve it before public visibility.
          </div>
        </div>
      </div>
    </div>
  );
}
