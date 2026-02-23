// Import React core functions
import React, { useEffect, useState } from "react";

// Import Link for navigation between pages
import { Link } from "react-router-dom";

// Custom API wrapper (handles JWT, base URL, etc.)
import { apiFetch } from "../../lib/api";

// Import CSS styling
import "./Grounds.css";


export default function Grounds() {

  /* ===============================
     STATE MANAGEMENT SECTION
     =============================== */

  // 1️. loading:
  // Controls loading UI while API request is running
  const [loading, setLoading] = useState(true);

  // 2️. err:
  // Stores error message if API request fails
  const [err, setErr] = useState("");

  // 3️. grounds:
  // Stores array of ground objects returned from backend
  const [grounds, setGrounds] = useState([]);

  // 4️. filters:
  // Stores filter input values for searching grounds
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    max_price: "",
  });


  /* ===============================
     LOAD FUNCTION (FETCH GROUNDS)
     =============================== */

  const load = async () => {

    // Clear previous error
    setErr("");

    // Start loading state
    setLoading(true);

    try {

      // Create query string object
      // This helps build URL filters safely
      const qs = new URLSearchParams();

      // If location is filled, send it as search parameter
      // Example: ?search=thapathali
      if (filters.location) {
        qs.append("search", filters.location);
      }

      // If date filter is filled
      if (filters.date) {
        qs.append("date", filters.date);
      }

      // If max price filter is filled
      if (filters.max_price) {
        qs.append("max_price", filters.max_price);
      }

      // Convert query parameters into string format
      // Like search=thapathali&max_price=1500
      const query = qs.toString();

      // If filters exist → add them to URL
      // If not → just fetch all grounds
      const url = query ? "/grounds/?" + query : "/grounds/";

      // Call backend API
      const data = await apiFetch(url, { method: "GET" });

      // Some APIs return:
      // { results: [...] }
      // Others return: [...]
      // So we support both
      setGrounds(data && data.results ? data.results : data || []);

    } catch (ex) {

      // If error occurs (network / backend issue)
      setErr(ex.message);

    } finally {

      // Stop loading no matter what
      setLoading(false);
    }
  };


  /* ===============================
     RUN LOAD ON COMPONENT MOUNT
     =============================== */

  // useEffect runs once when page loads
  useEffect(function () {
    load();
  }, []);


  /* ===============================
     HANDLE INPUT CHANGES
     =============================== */

  const onChange = function (e) {

    // Update filters state dynamically
    // Like if name="location", update filters.location
    setFilters(function (prev) {
      return {
        ...prev,                 // Keep previous values
        [e.target.name]: e.target.value,  // Update changed field
      };
    });
  };


  /* ===============================
     UI RENDERING SECTION
     =============================== */

  return (
    <div className="page-bg">
      <div className="container">

        {/* ================= Header Section ================= */}
        <div className="grounds-header">
          <div>

            <div className="badge">
              Live Availability
            </div>

            <h1 className="h1" style={{ marginTop: 10 }}>
              Find a <span>Futsal Ground</span>
            </h1>

            <p className="p">
              Search approved grounds, view slots, and book in seconds.
            </p>

          </div>
        </div>


        {/* ================= Filter Section ================= */}
        <div className="card grounds-filters">

          {/* Location Filter */}
          <input
            className="input"
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={onChange}
          />

          {/* Date Filter */}
          <input
            className="input"
            name="date"
            type="date"
            value={filters.date}
            onChange={onChange}
          />

          {/* Max Price Filter */}
          <input
            className="input"
            name="max_price"
            type="number"
            placeholder="Max price"
            value={filters.max_price}
            onChange={onChange}
          />

          {/* Search Button */}
          <button
            className="btn primary"
            onClick={load}
          >
            Search
          </button>

        </div>


        {/* ================= Error Display ================= */}
        {err ? (
          <div className="grounds-error">
            {err}
          </div>
        ) : null}


        {/* ================= Loading State ================= */}
        {loading ? (

          <div className="grounds-loading">
            Loading grounds...
          </div>

        ) : (

          /* ================= Grounds Grid ================= */
          <div className="grounds-grid">

            {/* If no grounds found */}
            {grounds.length === 0 ? (
              <div className="card">
                No grounds found.
              </div>
            ) : null}


            {/* Loop through each ground */}
            {grounds.map(function (g) {

              // Use id or ground_id (fallback safety)
              const gid = g.id ? g.id : g.ground_id;

              // Handle price safely
              const price = g.price_per_hour ? g.price_per_hour : g.price;

              return (
                <Link
                  to={"/grounds/" + gid}   // Navigate to ground details page
                  key={gid}
                  className="grounds-card"
                >

                  {/* Card Top Section */}
                  <div className="grounds-cardTop">

                    <div className="grounds-name">
                      {g.name}
                    </div>

                    <div className="grounds-price">
                      Rs {price ? price : "—"}
                    </div>

                  </div>

                  {/* Card Meta Section */}
                  <div className="grounds-meta">
                    <span>📍 {g.location}</span>
                    <span>⭐ {g.avg_rating ? g.avg_rating : "New"}</span>
                  </div>

                  {/* Call To Action */}
                  <div className="grounds-cta">
                    View Details →
                  </div>

                </Link>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}
