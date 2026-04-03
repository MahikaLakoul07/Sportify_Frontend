import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css";

import futsalImage from "../../assets/futsal_pic.png";
import dhukuFutsalHub from "../../assets/dhuku_futsal_hub.png";
import khelkunjArena from "../../assets/khelkunj_arena.png";
import fieldFutsal from "../../assets/field_futsal.png";

import GroundCard from "../../components/GroundCard/GroundCard.jsx";
import OpenGameCard from "../../components/OpenGameCard/OpenGameCard.jsx";

// IMPORTANT: use publicFetch
import { publicFetch } from "../../lib/api";

export default function Home() {
  const [openGames, setOpenGames] = useState([]);
  const [loadingOpenGames, setLoadingOpenGames] = useState(true);

  const [featuredGrounds, setFeaturedGrounds] = useState([]);
  const [loadingFeaturedGrounds, setLoadingFeaturedGrounds] = useState(true);

  const fallbackImages = [dhukuFutsalHub, khelkunjArena, fieldFutsal];

  // LOAD OPEN GAMES
  useEffect(() => {
    const loadOpenGames = async () => {
      try {
        setLoadingOpenGames(true);

        const data = await publicFetch("/bookings/open-games/?today=1");

        setOpenGames(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load open games", e);
        setOpenGames([]);
      } finally {
        setLoadingOpenGames(false);
      }
    };

    loadOpenGames();
  }, []);

  // 🔥 LOAD GROUNDS
  useEffect(() => {
    const loadFeaturedGrounds = async () => {
      try {
        setLoadingFeaturedGrounds(true);

        // FIXED PATH (NO /api HERE)
        const data = await publicFetch("/grounds/");

        const grounds = Array.isArray(data) ? data : data?.results || [];

        setFeaturedGrounds(grounds.slice(0, 3));
      } catch (e) {
        console.error("Failed to load featured grounds", e);
        setFeaturedGrounds([]);
      } finally {
        setLoadingFeaturedGrounds(false);
      }
    };

    loadFeaturedGrounds();
  }, []);

  return (
    <div className="page">
      {/* HERO SECTION */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-text"
        >
          <h2>
            Manage Futsal Grounds & Bookings
            <span> Effortlessly</span>
          </h2>

          <p>
            Sportify helps players find grounds, join games, and connect with
            others — all in one place.
          </p>

          <div className="hero-actions">
            <Link to="/grounds" className="btn primary">
              Book a Ground
            </Link>

            <Link to="/open-games" className="btn outline">
              Open Games
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hero-image"
        >
          <img src={futsalImage} alt="Futsal" />
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h3>Core System Features</h3>

        <div className="feature-grid">
          <FeatureCard
            icon={<CalendarCheck />}
            title="Smart Booking"
            desc="Book futsal grounds with real-time availability."
            to="/grounds"
          />

          <FeatureCard
            icon={<Users />}
            title="Team Formation"
            desc="Join open games and connect with players."
            to="/open-games"
          />

          <FeatureCard
            icon={<MapPin />}
            title="Location Search"
            desc="Find grounds based on location and preference."
            to="/grounds"
          />
        </div>
      </section>

      {/* GROUNDS */}
      <section className="features">
        <h3>Featured Grounds</h3>

        <div className="feature-grid">
          {loadingFeaturedGrounds ? (
            <div style={{ color: "#cbd5f5" }}>Loading...</div>
          ) : featuredGrounds.length > 0 ? (
            featuredGrounds.map((ground, index) => (
              <GroundCard
                key={ground.id}
                id={ground.id}
                image={
                  ground.image_url ||
                  fallbackImages[index % fallbackImages.length]
                }
                name={ground.name}
                location={ground.location}
                desc={ground.description || "No description available."}
                to={`/grounds/${ground.id}`}
              />
            ))
          ) : (
            <div style={{ color: "#cbd5f5" }}>No grounds available.</div>
          )}
        </div>
      </section>

      {/* OPEN GAMES */}
      <section className="features">
        <h3>Open Games Today</h3>

        <div className="feature-grid">
          {loadingOpenGames ? (
            <div style={{ color: "#cbd5f5" }}>Loading...</div>
          ) : openGames.length > 0 ? (
            openGames.slice(0, 3).map((game, index) => (
              <OpenGameCard
                key={game.id}
                image={
                  game.ground_image_url ||
                  fallbackImages[index % fallbackImages.length]
                }
                name={game.ground_name}
                date={game.date}
                time={`${game.start_time} - ${game.end_time}`}
                requiredPlayers={`${game.spots_left} players needed`}
                chatLink={`/open-games/${game.id}`}
              />
            ))
          ) : (
            <div style={{ color: "#cbd5f5" }}>No games today.</div>
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <Link to="/open-games" className="btn outline">
            View All Games
          </Link>
        </div>
      </section>
    </div>
  );
}

// FEATURE CARD
function FeatureCard({ icon, title, desc, to }) {
  const content = (
    <div className="feature-card">
      <div className="icon">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );

  return to ? (
    <Link to={to} className="feature-link">
      {content}
    </Link>
  ) : (
    content
  );
}