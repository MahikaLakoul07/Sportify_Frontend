import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import GroundCard from "../../components/GroundCard/GroundCard.jsx";
import "./Grounds.css";

export default function Grounds() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [grounds, setGrounds] = useState([]);

  const [filters, setFilters] = useState({
    location: "",
    date: "",
    max_price: "",
  });

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      const qs = new URLSearchParams();

      // Backend-friendly params (UI uses these)
      if (filters.location) qs.append("search", filters.location);
      if (filters.date) qs.append("date", filters.date);
      if (filters.max_price) qs.append("max_price", filters.max_price);

      // use /api/grounds
      const url = qs.toString()
        ? `/grounds/?${qs.toString()}`
        : "/grounds/";

      const data = await apiFetch(url, { method: "GET" });

      // supports both paginated and non-paginated
      const list = data?.results ? data.results : Array.isArray(data) ? data : [];
      setGrounds(list);
    } catch (ex) {
      setErr(ex.message || "Failed to load grounds.");
      setGrounds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="page-bg">
      <div className="container">
        {/* Header */}
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

        {/* Filters */}
        <div className="card grounds-filters">
          <input
            className="input"
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={onChange}
          />

          <input
            className="input"
            name="date"
            type="date"
            value={filters.date}
            onChange={onChange}
          />

          <input
            className="input"
            name="max_price"
            type="number"
            placeholder="Max price"
            value={filters.max_price}
            onChange={onChange}
          />

          <button className="btn primary" onClick={load}>
            Search
          </button>
        </div>

        {/* Error */}
        {err && <div className="grounds-error">{err}</div>}

        {/* Loading */}
        {loading ? (
          <div className="grounds-loading">Loading grounds...</div>
        ) : (
          <div className="grounds-grid">
            {grounds.length === 0 && <div className="card">No grounds found.</div>}

            {grounds.map((g) => {
              const gid = g.id ?? g.ground_id;
              const price = g.price_per_hour ?? g.price;
              const desc = g.description || "";

              // backend sends image_url 
              const image =
                g.image_url ||
                "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=70";

              return (
                <GroundCard
                  key={gid}
                  id={gid}
                  image={image}
                  name={g.name}
                  location={g.location}
                  desc={desc}
                  price={price}
                  to={`/grounds/${gid}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}