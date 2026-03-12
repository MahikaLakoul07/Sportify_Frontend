import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import OpenGameCard from "../../components/OpenGameCard/OpenGameCard";
import "./OpenGames.css";

export default function OpenGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await apiFetch("/api/bookings/open-games/");
        setGames(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load open games", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <div className="page-bg open-games-page">
      <div className="container open-games-wrap">
        <div className="open-games-head">
          <div>
            <div className="badge">Open Games</div>
            <h1 className="h1" style={{ marginTop: 10 }}>
              Available Open Games
            </h1>
            <p className="open-games-sub">
              Find available public matches and join teams that need players.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card open-games-loading">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="card open-games-empty">
            <div className="open-games-emptyTitle">
              No open games available
            </div>
            <div className="open-games-emptySub">
              There are no public matches available right now. Check again later.
            </div>

            <div className="open-games-actions">
              <Link to="/" className="btn outline">
                Back Home
              </Link>
              <Link to="/grounds" className="btn primary">
                Browse Grounds
              </Link>
            </div>
          </div>
        ) : (
          <div className="open-games-grid">
            {games.map((game) => (
              <OpenGameCard
                key={game.id}
                image={game.ground_image_url}
                name={game.ground_name}
                date={game.date}
                time={`${game.start_time} - ${game.end_time}`}
                requiredPlayers={`${game.spots_left} player${
                  game.spots_left > 1 ? "s" : ""
                } needed`}
                phone={game.ground_phone || "Contact not available"}
                chatLink={`/open-games/${game.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}