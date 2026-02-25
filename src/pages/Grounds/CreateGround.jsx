import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateGround.css";
import { apiFetch } from "../../api";

const DAYS = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 1 },
  { label: "Wed", value: 2 },
  { label: "Thu", value: 3 },
  { label: "Fri", value: 4 },
  { label: "Sat", value: 5 },
  { label: "Sun", value: 6 },
];

function emptyWindow() {
  return { start_time: "07:00", end_time: "08:00" };
}

export default function CreateGround() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_hour: "",
    description: "",
    phone: "",
    ground_size: "FIVE",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // weekly availability state: { 0:[{start,end}], 6:[...], ... }
  const [availability, setAvailability] = useState(() => {
    const init = {};
    DAYS.forEach((d) => (init[d.value] = []));
    return init;
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Availability helpers
  const addWindow = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], emptyWindow()],
    }));
  };

  const removeWindow = (day, idx) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const updateWindow = (day, idx, key, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((w, i) => (i === idx ? { ...w, [key]: value } : w)),
    }));
  };

  // Convert availability state into API payload
  const availabilityPayload = useMemo(() => {
    const arr = [];
    for (const day of Object.keys(availability)) {
      const dayInt = Number(day);
      const windows = availability[dayInt]
        .filter((w) => w.start_time && w.end_time)
        .map((w) => ({
          start_time: w.start_time,
          end_time: w.end_time,
        }));
      if (windows.length) {
        arr.push({ day_of_week: dayInt, windows });
      }
    }
    return { availability: arr };
  }, [availability]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      // 1) Create Ground
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("location", form.location.trim());
      formData.append("price_per_hour", form.price_per_hour);
      formData.append("description", form.description.trim());
      formData.append("phone", form.phone.trim());
      formData.append("ground_size", form.ground_size);
      if (image) formData.append("image", image);

      const created = await apiFetch("http://localhost:8000/api/grounds/", {
        method: "POST",
        body: formData,
      });

      // 2) Save Availability (only if owner added any)
      if (availabilityPayload.availability.length > 0) {
        await apiFetch(
          `http://localhost:8000/api/grounds/${created.id}/availability/bulk/`,
          {
            method: "POST",
            body: availabilityPayload,
          }
        );
      }

      setSuccess(
        "Ground submitted! Timings saved. Status: PENDING (Admin will approve)."
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

      // reset availability
      const reset = {};
      DAYS.forEach((d) => (reset[d.value] = []));
      setAvailability(reset);

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
              Add your futsal ground details and weekly availability timings.
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
                <label className="createGround-label">
                  Price per Hour (Rs)
                </label>
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

            {/* ✅ Weekly Availability UI */}
            <div style={{ marginTop: 18 }}>
              <label className="createGround-label">Weekly Availability</label>
              <div className="card-soft" style={{ padding: 14 }}>
                <div className="p" style={{ marginTop: 0 }}>
                  Add your available time windows for each day. Players will only
                  be able to book inside these timings.
                </div>

                {DAYS.map((d) => (
                  <div key={d.value} style={{ marginTop: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{d.label}</div>
                      <button
                        type="button"
                        className="btn outline"
                        onClick={() => addWindow(d.value)}
                      >
                        + Add Slot
                      </button>
                    </div>

                    {availability[d.value].length === 0 ? (
                      <div className="p" style={{ marginTop: 8, opacity: 0.8 }}>
                        No slots added
                      </div>
                    ) : (
                      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {availability[d.value].map((w, idx) => (
                          <div
                            key={`${d.value}-${idx}`}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr auto",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <input
                              className="input"
                              type="time"
                              value={w.start_time}
                              onChange={(e) =>
                                updateWindow(
                                  d.value,
                                  idx,
                                  "start_time",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              className="input"
                              type="time"
                              value={w.end_time}
                              onChange={(e) =>
                                updateWindow(
                                  d.value,
                                  idx,
                                  "end_time",
                                  e.target.value
                                )
                              }
                            />
                            <button
                              type="button"
                              className="btn outline"
                              onClick={() => removeWindow(d.value, idx)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
            After you submit, the ground will be <b>PENDING</b>. Admin will
            approve it before public visibility.
          </div>
        </div>
      </div>
    </div>
  );
}