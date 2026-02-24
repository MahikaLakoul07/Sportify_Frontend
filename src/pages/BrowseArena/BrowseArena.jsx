import React, { useEffect, useState } from "react";
import "./BrowseArena.css";

/* IMPORT the Reusable Card */
import GroundCard from "../../components/GroundCard/GroundCard.jsx";

export default function BrowseArena() {

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Mock grounds data
  const [allGrounds] = useState([
    {
      id: 1,
      name: "Kathmandu Futsal Arena",
      location: "Kathmandu",
      price_per_hour: 1500,
      avg_rating: 4.5,
      image: "/default-futsal.png",
      description: "Premium futsal ground with night lighting.",
    },
    {
      id: 2,
      name: "Lalitpur Sports Hub",
      location: "Lalitpur",
      price_per_hour: 1200,
      avg_rating: 4.2,
      image: "/default-futsal.png",
      description: "Popular turf with parking and clean facilities.",
    },
    {
      id: 3,
      name: "Bhaktapur Turf Ground",
      location: "Bhaktapur",
      price_per_hour: 1000,
      avg_rating: null,
      image: "/default-futsal.png",
      description: "Budget friendly ground for friendly matches.",
    },
  ]);

  const [grounds, setGrounds] = useState([]);

  const [filters, setFilters] = useState({
    location: "",
    date: "",
    max_price: "",
  });

  /* FILTER FUNCTION */
  const load = () => {
    setErr("");
    setLoading(true);

    try {
      let filtered = [...allGrounds];

      if (filters.location) {
        filtered = filtered.filter(g =>
          g.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      if (filters.max_price) {
        filtered = filtered.filter(g =>
          g.price_per_hour <= Number(filters.max_price)
        );
      }

      setGrounds(filtered);
    } catch {
      setErr("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

            {grounds.length === 0 && (
              <div className="card">No grounds found.</div>
            )}

            {/* USE REUSABLE CARD */}
            {grounds.map(g => (
              <GroundCard
                key={g.id}
                id={g.id}
                image={g.image}
                name={g.name}
                location={g.location}
                desc={g.description}
                price={g.price_per_hour}
                to={`/grounds/${g.id}`}
              />
            ))}

          </div>
        )}

      </div>
    </div>
  );
}