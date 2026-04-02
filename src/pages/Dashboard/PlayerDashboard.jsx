import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlayerDashboard.css";

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

export default function PlayerDashboard() {
  const navigate = useNavigate();

  const unreadMessages = 0;
  const unreadNotifications = 0;

  return (
    <div className="playerDash">
      {/* HEADER */}
      <div className="playerDash__header">
        <div>
          <h1>Player Dashboard</h1>
          <p>Book grounds, join matches, and manage your games easily.</p>
        </div>

        <div className="headerActions">
          <button
            className="navIconBtn"
            onClick={() => navigate("/inbox")}
            aria-label="Open Inbox"
            title="Inbox"
          >
            <span className="navIconBtn__icon">
              <ChatIcon />
            </span>
            <span className="navIconBtn__text">Inbox</span>
            {unreadMessages > 0 && (
              <span className="navIconBtn__badge">{unreadMessages}</span>
            )}
          </button>

          <button
            className="primaryBtn"
            onClick={() => navigate("/grounds")}
          >
            Browse Grounds
          </button>
        </div>
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
          <h2>{unreadMessages}</h2>
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

        <div className="card" onClick={() => navigate("/open-games")}>
          <h3>Join Open Game</h3>
          <p>Find public matches and request to join.</p>
          <span className="linkish">Open →</span>
        </div>


        <div className="card" onClick={() => navigate("/playerprofile")}>
          <h3>My Profile</h3>
          <p>Update your profile and game preferences.</p>
          <span className="linkish">Open →</span>
        </div>
      </div>
    </div>
  );
}