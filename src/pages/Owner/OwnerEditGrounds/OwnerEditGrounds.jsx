import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function OwnerEditGround() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_hour: "",
    description: "",
    phone: "",
    ground_size: "FIVE",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    async function loadGround() {
      try {
        setLoading(true);
        setErr("");

        const res = await apiFetch(`/api/grounds/${id}/`);
        if (!res.ok) {
          throw new Error("Failed to load ground details.");
        }

        const data = await res.json();

        setForm({
          name: data.name || "",
          location: data.location || "",
          price_per_hour: data.price_per_hour || "",
          description: data.description || "",
          phone: data.phone || "",
          ground_size: data.ground_size || "FIVE",
        });

        setImagePreview(data.image_url || "");
      } catch (error) {
        setErr(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadGround();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setSuccess("");

      const body = new FormData();
      body.append("name", form.name);
      body.append("location", form.location);
      body.append("price_per_hour", form.price_per_hour);
      body.append("description", form.description);
      body.append("phone", form.phone);
      body.append("ground_size", form.ground_size);

      if (imageFile) {
        body.append("image", imageFile);
      }

      const res = await apiFetch(`/api/grounds/${id}/`, {
        method: "PATCH",
        body,
      });

      if (!res.ok) {
        let msg = "Failed to update ground.";
        try {
          const data = await res.json();
          msg = data.detail || JSON.stringify(data);
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      setSuccess("Ground updated successfully.");

      setTimeout(() => {
        navigate("/owner/grounds");
      }, 1000);
    } catch (error) {
      setErr(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Edit Ground</h2>

      {err && <p style={{ color: "red" }}>{err}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 14, marginTop: 20 }}
      >
        <div>
          <label>Ground Name</label>
          <br />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <label>Location</label>
          <br />
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <label>Price Per Hour</label>
          <br />
          <input
            type="number"
            name="price_per_hour"
            value={form.price_per_hour}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <label>Phone</label>
          <br />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <label>Ground Size</label>
          <br />
          <select
            name="ground_size"
            value={form.ground_size}
            onChange={handleChange}
            style={{ width: "100%", padding: 10 }}
          >
            <option value="FIVE">5A Side</option>
            <option value="SEVEN">7A Side</option>
            <option value="ELEVEN">11A Side</option>
          </select>
        </div>

        <div>
          <label>Description</label>
          <br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <label>Ground Image</label>
          <br />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {imagePreview && (
          <div>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: 220,
                height: 160,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving} style={{ padding: "10px 16px" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <Link to="/owner/grounds" style={{ padding: "10px 16px" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}