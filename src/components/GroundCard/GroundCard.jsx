// src/components/GroundCard/GroundCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import "./GroundCard.css";

export default function GroundCard({
  id,
  image,
  name,
  location,
  desc,
  price,
  to,
}) {
  const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const getImageUrl = (img) => {
    if (!img) return "/default-futsal.png";

    // Full URL already
    if (img.startsWith("http://") || img.startsWith("https://")) return img;

    // Frontend assets (Vite build)
    if (img.startsWith("/assets/") || img.startsWith("/src/")) return img;

    // Backend media (like /media/grounds/xxx.jpg)
    if (img.startsWith("/media/")) return base + img;

    // Backend relative path (like "grounds/xxx.jpg")
    return base + "/media/" + img;
  };

  return (
    <Link to={to || `/grounds/${id}`} className="gc-link">
      <div className="gc-card">
        {/* IMAGE */}
        <div className="gc-imgWrap">
          <img
            src={getImageUrl(image)}
            alt={name}
            className="gc-img"
            onError={(e) => {
              e.currentTarget.src = "/default-futsal.png";
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="gc-body">
          <h4 className="gc-title">{name}</h4>

          <div className="gc-loc">
            <MapPin size={14} />
            <span>{location}</span>
          </div>

          {desc && <p className="gc-desc">{desc}</p>}

          {price !== undefined && price !== null && price !== "" && (
            <div className="gc-price">Rs {price}</div>
          )}

          <div className="gc-cta">View Details →</div>
        </div>
      </div>
    </Link>
  );
}