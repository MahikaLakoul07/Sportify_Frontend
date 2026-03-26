import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
// import { fetchBookingChatGroup } from "../../lib/chat";
import OpenGameCard from "../../components/OpenGameCard/OpenGameCard";
import "./OpenGames.css";

export default function OpenGames() {
  const nav = useNavigate();
  const { id } = useParams(); // Check if specific game ID is in URL
  const { user } = useAuth();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [joinErr, setJoinErr] = useState("");
  const [joinedInfo, setJoinedInfo] = useState(null);
  const [specificGame, setSpecificGame] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        if (id) {
          // Load specific game details
          const data = await apiFetch(`/api/bookings/${id}/`);
          setSpecificGame(data);
        } else {
          // Load all open games
          const data = await apiFetch("/api/bookings/open-games/");
          setGames(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load open games", err);
        setGames([]);
        setSpecificGame(null);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [id]);

  const handleJoinGame = async (game) => {
    if (joiningId) return;

    const now = new Date();
    const gameEnd = new Date(`${game.date}T${game.end_time}`);
    const hasJoined = game.is_joined || false;
    const isOwner = user && (game.owner_id === user.id || game.created_by === user.id || game.ground_owner_id === user.id);

    if (gameEnd <= now) {
      setJoinErr("This game is in the past and cannot be joined.");
      return;
    }

    if (hasJoined) {
      setJoinErr("You have already joined this open game.");
      return;
    }

    if (isOwner) {
      setJoinErr("You cannot join a game you created/booked.");
      return;
    }

    setJoinErr("");
    setJoinedInfo(null);
    setJoiningId(game.id);

    try {
      await apiFetch(`/api/bookings/${game.id}/join/`, {
        method: "POST",
        body: {},
      });

      setJoinedInfo({
        bookingId: game.id,
        name: game.ground_name || game.name || "Open Game",
      });

      const refreshed = await apiFetch("/api/bookings/open-games/");
      setGames(Array.isArray(refreshed) ? refreshed : []);
      if (id) {
        const data = await apiFetch(`/api/bookings/${id}/`);
        setSpecificGame(data);
      }
    } catch (err) {
      console.error("Failed to join game", err);
      setJoinErr(err?.message || "Failed to join this open game.");
    } finally {
      setJoiningId(null);
    }
  };

  const specificGameEndsAt = specificGame ? new Date(`${specificGame.date}T${specificGame.end_time}`) : null;
  const isSpecificPast = specificGame ? specificGameEndsAt <= new Date() : false;
  const isSpecificJoined = specificGame ? !!specificGame.is_joined : false;
  const isSpecificOwner = specificGame && user ?
    [specificGame.owner_id, specificGame.created_by, specificGame.ground_owner_id].includes(user.id)
    : false;

  return (
    <div className="page-bg open-games-page">
      <div className="container open-games-wrap">
        <div className="open-games-head">
          <div>
            <div className="badge">Open Games</div>
            <h1 className="h1" style={{ marginTop: 10 }}>
              {id ? "Join Open Game" : "Available Open Games"}
            </h1>
            <p className="open-games-sub">
              {id
                ? "Join this public match and connect with other players."
                : "Find available public matches and join teams that need players."}
            </p>
          </div>
        </div>

        {joinErr ? (
          <div className="card open-games-empty" style={{ marginBottom: 16 }}>
            <div className="open-games-emptyTitle">Could not join game</div>
            <div className="open-games-emptySub">{joinErr}</div>
          </div>
        ) : null}

        {joinedInfo ? (
          <div className="card open-games-empty" style={{ marginBottom: 16 }}>
            <div className="open-games-emptyTitle">Joined successfully</div>
            <div className="open-games-emptySub">
              You joined <strong>{joinedInfo.name}</strong>.
            </div>

            <div className="open-games-actions">
              <Link to="/inbox" className="btn outline">
                Go to Inbox
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="card open-games-loading">Loading...</div>
        ) : specificGame ? (
          <div className="card open-games-detail">
            <div className="open-games-detailImg">
              <img
                src={specificGame.ground_image_url || "/placeholder.png"}
                alt={specificGame.ground_name}
              />
            </div>
            <div className="open-games-detailBody">
              <h3>{specificGame.ground_name}</h3>
              <div className="open-games-detailMeta">
                <div><b>Date:</b> {specificGame.date}</div>
                <div><b>Time:</b> {specificGame.start_time} - {specificGame.end_time}</div>
                <div><b>Players Needed:</b> {specificGame.spots_left} player{specificGame.spots_left > 1 ? "s" : ""}</div>
                <div><b>Phone:</b> {specificGame.ground_phone || "Contact not available"}</div>
              </div>
              <button
                className="btn primary"
                onClick={() => handleJoinGame(specificGame)}
                disabled={
                  joiningId === specificGame.id ||
                  isSpecificPast ||
                  isSpecificJoined ||
                  isSpecificOwner
                }
              >
                {joiningId === specificGame.id
                  ? "Joining..."
                  : isSpecificPast
                  ? "Game Finished"
                  : isSpecificOwner
                  ? "Game Creator"
                  : isSpecificJoined
                  ? "Already Joined"
                  : "Join Game"}
              </button>
            </div>
          </div>
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
              <div key={game.id} className="open-game-item">
                <OpenGameCard
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}