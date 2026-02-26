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
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return base + img;       // "/media/..."
    return base + "/media/" + img;                    // "grounds/..."
  };

  return (
    <Link to={to || `/grounds/${id}`} className="feature-link">
      <div className="feature-card">
        {/* IMAGE */}
        <img
          src={getImageUrl(image)}
          alt={name}
          className="futsal-image"
          onError={(e) => {
            e.currentTarget.src = "/default-futsal.png";
          }}
        />

        {/* NAME */}
        <h4>{name}</h4>

        {/* LOCATION */}
        <p className="futsal-location">
          <MapPin size={14} /> {location}
        </p>

        {/* DESCRIPTION */}
        {desc && <p>{desc}</p>}

        {/* PRICE */}
        {price !== undefined && price !== null && price !== "" && (
          <div className="futsal-price">Rs {price}</div>
        )}

        {/* CTA */}
        <div className="futsal-cta">View Details →</div>
      </div>
    </Link>
  );
}