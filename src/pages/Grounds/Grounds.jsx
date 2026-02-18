import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./Grounds.css";

export default function Grounds() {

  // 1️. loading state:
  // Used to show loading message while API request is in progress
  const [loading, setLoading] = useState(true);

  // 2️. err state:
  // Stores error message if API request fails
  const [err, setErr] = useState("");

  // 3️. grounds state:
  // Stores the list of grounds returned from backend
  const [grounds, setGrounds] = useState([]);

  // 4️. filters state:
  // Stores filter inputs for searching grounds
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    max_price: "",
  });

  // 5️. load function:
  // Fetches grounds from backend API based on current filters
  const load = async () => {
    setErr("");         // Clear previous errors
    setLoading(true);   // Start loading

    try {
      // Create query string dynamically
      const qs = new URLSearchParams();

      // Add filter parameters only if user filled them
      if (filters.location) qs.append("location", filters.location);
      if (filters.date) qs.append("date", filters.date);
      if (filters.max_price) qs.append("max_price", filters.max_price);

      // Call backend API with query string
      const data = await apiFetch(
        `/grounds/?${qs.toString()}`,
        { method: "GET" }
      );

      // Some backends return paginated response like:
      // { results: [...] }
      // Others return plain array: [...]
      // So we support both formats
      setGrounds(data?.results || data || []);

    } catch (ex) {
      // If API fails (network error, backend error, etc.)
      setErr(ex.message);
    } finally {
      // Stop loading whether success or failure
      setLoading(false);
    }
  };

  // 6️. useEffect:
  // Runs only once when component loads
  // Automatically fetches grounds on page load
  useEffect(() => {
    load();
  }, []);

  // 7️. onChange handler:
  // Updates filter state dynamically
  const onChange = (e) =>
    setFilters((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  return (
    <div className="page-bg">
      <div className="container">

        {/* Header Section */}
        <div className="grounds-header">
          <div>
            <div className="badge">Live Availability</div>

            <h1 className="h1" style={{ marginTop: 10 }}>
              Find a <span>Futsal Ground</span>
            </h1>

            <p className="p">
              Search approved grounds, view slots, and book in seconds.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card grounds-filters">

          {/* Location filter */}
          <input
            className="input"
            name="location"
            placeholder="Location (e.g., Thapathali)"
            value={filters.location}
            onChange={onChange}
          />

          {/* Date filter */}
          <input
            className="input"
            name="date"
            type="date"
            value={filters.date}
            onChange={onChange}
          />

          {/* Max price filter */}
          <input
            className="input"
            name="max_price"
            type="number"
            placeholder="Max price"
            value={filters.max_price}
            onChange={onChange}
          />

          {/* Search button */}
          <button
            className="btn primary"
            onClick={load}
          >
            Search
          </button>

        </div>

        {/* Error Message */}
        {err ? <div className="grounds-error">{err}</div> : null}

        {/* Loading State */}
        {loading ? (
          <div className="grounds-loading">
            Loading grounds...
          </div>
        ) : (

          /* Grounds Grid */
          <div className="grounds-grid">

            {/* Map through grounds array and display cards */}
            {grounds.map((g) => (

              <Link
                to={`/grounds/${g.id}`} // Navigate to Ground Details page
                key={g.id}
                className="grounds-card"
              >

                <div className="grounds-cardTop">

                  {/* Ground Name */}
                  <div className="grounds-name">
                    {g.name}
                  </div>

                  {/* Price per hour */}
                  <div className="grounds-price">
                    Rs {g.price_per_hour ?? g.price}
                  </div>

                </div>

                <div className="grounds-meta">

                  {/* Location */}
                  <span>📍 {g.location}</span>

                  {/* Rating (if available) */}
                  <span>⭐ {g.avg_rating ?? "New"}</span>

                </div>

                <div className="grounds-cta">
                  View Details →
                </div>

              </Link>

            ))}

          </div>
        )}
      </div>
    </div>
  );
}
