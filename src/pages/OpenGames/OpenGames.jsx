// src/pages/OpenGames/OpenGames.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import OpenGameCard from "../../components/OpenGameCard/OpenGameCard";
import "./OpenGames.css";

export default function OpenGames() {
  const nav = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [joinErr, setJoinErr] = useState("");
  const [joinedInfo, setJoinedInfo] = useState(null);
  const [specificGame, setSpecificGame] = useState(null);

  const currentUserId = user?.user_id ?? user?.id ?? null;

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setJoinErr("");

        if (id) {
          const data = await apiFetch(`/bookings/${id}/`);
          setSpecificGame(data);
        } else {
          const data = await apiFetch("/bookings/open-games/");
          setGames(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load open games", err);
        setGames([]);
        setSpecificGame(null);
        setJoinErr(err?.message || "Failed to load open game.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [id]);

  const isGameCreator = (game) => {
    if (!currentUserId) return false;

    const creatorIds = [
      game?.created_by,
      game?.player,
      game?.player_id,
      game?.ground_owner_id,
      game?.owner_id,
    ].filter((v) => v !== null && v !== undefined);

    return creatorIds.includes(currentUserId);
  };

  const handleJoinGame = async (game) => {
    if (joiningId) return;

    const now = new Date();
    const gameEnd = new Date(`${game.date}T${game.end_time}`);
    const hasJoined = Boolean(game.is_joined);
    const isOwner = isGameCreator(game);

    if (gameEnd <= now) {
      setJoinErr("This game is in the past and cannot be joined.");
      return;
    }

    if (hasJoined) {
      const groupId = game.group_chat_id;
      if (groupId) {
        nav(`/chat/group/${groupId}`);
        return;
      }
      setJoinErr("You have already joined this open game.");
      return;
    }

    if (isOwner) {
      setJoinErr("You cannot join a game you created.");
      return;
    }

    setJoinErr("");
    setJoinedInfo(null);
    setJoiningId(game.id);

    try {
      const joined = await apiFetch(`/bookings/${game.id}/join/`, {
        method: "POST",
      });

      setJoinedInfo({
        bookingId: game.id,
        name: joined?.ground_name || game.ground_name || game.name || "Open Game",
        groupChatId: joined?.group_chat_id || null,
      });

      const refreshed = await apiFetch("/bookings/open-games/");
      setGames(Array.isArray(refreshed) ? refreshed : []);

      if (id) {
        const data = await apiFetch(`/bookings/${id}/`);
        setSpecificGame(data);
      }

      if (joined?.group_chat_id) {
        nav(`/chat/group/${joined.group_chat_id}`);
      }
    } catch (err) {
      console.error("Failed to join game", err);
      setJoinErr(err?.message || "Failed to join this open game.");
    } finally {
      setJoiningId(null);
    }
  };

  const specificGameEndsAt = specificGame
    ? new Date(`${specificGame.date}T${specificGame.end_time}`)
    : null;

  const isSpecificPast = specificGame ? specificGameEndsAt <= new Date() : false;
  const isSpecificJoined = specificGame ? Boolean(specificGame.is_joined) : false;
  const isSpecificOwner = specificGame ? isGameCreator(specificGame) : false;

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

        {joinedInfo && !joinedInfo.groupChatId ? (
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
                <div>
                  <b>Players Needed:</b> {specificGame.spots_left} player
                  {specificGame.spots_left > 1 ? "s" : ""}
                </div>
                <div><b>Current Players:</b> {specificGame.current_players}</div>
                <div><b>Phone:</b> {specificGame.ground_phone || "Contact not available"}</div>
              </div>

              <button
                className="btn primary"
                onClick={() => handleJoinGame(specificGame)}
                disabled={joiningId === specificGame.id || isSpecificPast}
              >
                {joiningId === specificGame.id
                  ? "Joining..."
                  : isSpecificPast
                  ? "Game Finished"
                  : isSpecificOwner
                  ? "Game Creator"
                  : isSpecificJoined
                  ? "Open Group Chat"
                  : "Join Game"}
              </button>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="card open-games-empty">
            <div className="open-games-emptyTitle">No open games available</div>
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
                  requiredPlayers={`${game.spots_left} player${game.spots_left > 1 ? "s" : ""} needed`}
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