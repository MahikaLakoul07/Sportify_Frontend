import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../../lib/api";
import "./OwnerEditGrounds.css";

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
    phone: "",
    ground_size: "FIVE",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    async function loadGround() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch(`/owner/grounds/${id}/edit/`);

        setForm({
          name: data.name || "",
          location: data.location || "",
          price_per_hour: data.price_per_hour || "",
          phone: data.phone || "",
          ground_size: data.ground_size || "FIVE",
          description: data.description || "",
        });

        setImageUrl(data.image_url || "");
      } catch (error) {
        console.error("loadGround error:", error);
        setErr(error.message || "Failed to load ground details.");
      } finally {
        setLoading(false);
      }
    }

    loadGround();
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onFileChange(e) {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    } else {
      setPreviewUrl("");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setSuccess("");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("price_per_hour", form.price_per_hour);
      formData.append("phone", form.phone);
      formData.append("ground_size", form.ground_size);
      formData.append("description", form.description);

      if (image) {
        formData.append("image", image);
      }

      const updated = await apiFetch(`/owner/grounds/${id}/edit/`, {
        method: "PATCH",
        body: formData,
      });

      setSuccess("Ground updated successfully.");

      if (updated?.image_url) {
        setImageUrl(updated.image_url);
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setImage(null);

      setTimeout(() => {
        navigate("/owner/grounds");
      }, 1000);
    } catch (error) {
      console.error("updateGround error:", error);
      setErr(error.message || "Failed to update ground.");
    } finally {
      setSaving(false);
    }
  }

  const shownImage = previewUrl || imageUrl;

  return (
    <div className="owner-edit-page">
      <div className="owner-edit-wrap">
        <h1 className="owner-edit-title">Edit Ground</h1>

        {loading && <p>Loading ground details...</p>}
        {err && <p className="owner-edit-error">{err}</p>}
        {success && <p className="owner-edit-success">{success}</p>}

        {!loading && (
          <form className="owner-edit-form" onSubmit={onSubmit}>
            <label>Ground Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
            />

            <label>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={onChange}
            />

            <label>Price Per Hour</label>
            <input
              type="number"
              name="price_per_hour"
              value={form.price_per_hour}
              onChange={onChange}
            />

            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={onChange}
            />

            <label>Ground Size</label>
            <select
              name="ground_size"
              value={form.ground_size}
              onChange={onChange}
            >
              <option value="FIVE">5A Side</option>
              <option value="SEVEN">7A Side</option>
              <option value="ELEVEN">11A Side</option>
            </select>

            <label>Description</label>
            <textarea
              name="description"
              rows="6"
              value={form.description}
              onChange={onChange}
            />

            <label>Ground Image</label>
            <input type="file" accept="image/*" onChange={onFileChange} />

            {shownImage ? (
              <div className="owner-edit-preview">
                <img src={shownImage} alt="Ground preview" />
              </div>
            ) : null}

            <div className="owner-edit-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Update Ground"}
              </button>

              <Link to="/owner/grounds">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}