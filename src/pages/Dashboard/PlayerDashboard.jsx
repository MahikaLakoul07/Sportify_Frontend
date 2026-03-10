import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlayerDashboard.css";

export default function PlayerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="playerDash">

      {/* HEADER */}
      <div className="playerDash__header">
        <div>
          <h1>Player Dashboard</h1>
          <p>Book grounds, join matches, and manage your games easily.</p>
        </div>

        <button
          className="primaryBtn"
          onClick={() => navigate("/grounds")}
        >
          Browse Grounds
        </button>
      </div>

      {/* STATS */}
      <div className="statsRow">
        <div className="statCard">
          <span>Upcoming Matches</span>
          <h2>0</h2>
          <small>Next 7 days</small>
        </div>

        <div className="statCard">
          <span>Total Bookings</span>
          <h2>0</h2>
          <small>All time</small>
        </div>

        <div className="statCard">
          <span>Open Game Requests</span>
          <h2>0</h2>
          <small>Waiting approval</small>
        </div>

        <div className="statCard">
          <span>Unread Messages</span>
          <h2>0</h2>
          <small>Inbox notifications</small>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="playerDash__grid">

        <div className="card" onClick={() => navigate("/mybookings")}>
          <h3>My Bookings</h3>
          <p>View your booked grounds and match details.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card" onClick={() => navigate("/browsearena")}>
          <h3>Join Open Game</h3>
          <p>Find public matches and request to join.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card" onClick={() => navigate("/inbox")}>
          <h3>Inbox</h3>
          <p>Chat with players and ground owners.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card" onClick={() => navigate("/notifications")}>
          <h3>Notifications</h3>
          <p>See booking updates and match alerts.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card" onClick={() => navigate("/playerprofile")}>
          <h3>My Profile</h3>
          <p>Update your profile and game preferences.</p>
          <span className="linkish">Open →</span>
        </div>

        <div className="card ghost">
          <h3>Quick Tip</h3>
          <p>
            Join open games to meet new players and build your network.
          </p>
        </div>

      </div>

    </div>
  );
}