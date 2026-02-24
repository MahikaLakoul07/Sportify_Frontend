import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import "./GroundCard.css";

export default function FutsalCard({
  id,
  image,
  name,
  location,
  desc,
  price,
  to = "/browsearena",
}) {
  return (
    <Link to={to || `/grounds/${id}`} className="feature-link">
      <div className="feature-card">

        {/* IMAGE */}
        <img
          src={image || "/default-futsal.png"}
          alt={name}
          className="futsal-image"
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
        {price && (
          <div className="futsal-price">
            Rs {price}
          </div>
        )}

        {/* CTA */}
        <div className="futsal-cta">
          View Details →
        </div>

      </div>
    </Link>
  );
}