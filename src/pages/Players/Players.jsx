import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, Mail, Phone } from "lucide-react";
import { apiFetch } from "../../lib/api";
import "./Players.css";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/auth/players/");
      const list = Array.isArray(data) ? data : [];

      setPlayers(list);
      setFilteredPlayers(list);
    } catch (error) {
      console.error("Failed to fetch players:", error);
      alert(error.message || "Failed to load players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredPlayers(players);
      return;
    }

    const result = players.filter((player) => {
      const fullName = `${player.first_name || ""} ${player.last_name || ""}`.toLowerCase();
      const username = (player.username || "").toLowerCase();
      const email = (player.email || "").toLowerCase();
      const phone = (player.phone || "").toLowerCase();

      return (
        fullName.includes(query) ||
        username.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });

    setFilteredPlayers(result);
  }, [search, players]);

  return (
    <div className="players-page">
      <div className="players-wrap">
        <div className="players-header">
          <div>
            <h1>Find Players</h1>
            <p>Browse player profiles and build your connections.</p>
          </div>

          <div className="players-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, username, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="players-empty">
            <Users size={34} />
            <p>Loading players...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="players-empty">
            <Users size={34} />
            <p>No players found.</p>
          </div>
        ) : (
          <div className="players-grid">
            {filteredPlayers.map((player) => {
              const displayName =
                `${player.first_name || ""} ${player.last_name || ""}`.trim() ||
                player.full_name ||
                player.username ||
                "Player";

              return (
                <div key={player.user_id} className="player-card">
                  <div className="player-card-top">
                    <div className="player-avatar">
                      {(player.username || "P").charAt(0).toUpperCase()}
                    </div>

                    <div className="player-meta">
                      <h3>{displayName}</h3>
                      <p>@{player.username || "player"}</p>
                    </div>
                  </div>

                  <div className="player-details">
                    <div className="player-line">
                      <Mail size={14} />
                      <span>{player.email || "No email"}</span>
                    </div>

                    <div className="player-line">
                      <Phone size={14} />
                      <span>{player.phone || "No phone"}</span>
                    </div>
                  </div>

                  <Link
                    to={`/players/${player.user_id}`}
                    className="player-view-btn"
                  >
                    View Profile
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Players);