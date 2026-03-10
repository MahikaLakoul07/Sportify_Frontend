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
import { apiFetch } from "../../lib/api";

export default function Home() {
  const [openGames, setOpenGames] = useState([]);
  const [loadingOpenGames, setLoadingOpenGames] = useState(true);

  useEffect(() => {
    const loadOpenGames = async () => {
      try {
        setLoadingOpenGames(true);
        const data = await apiFetch("/api/bookings/open-games/?today=1", {
          method: "GET",
        });
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

  const fallbackImages = [dhukuFutsalHub, khelkunjArena, fieldFutsal];

  return (
    <div className="page">
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
            Sportify is a smart futsal management system that helps players find
            grounds, owners manage bookings, and admins control everything from
            one platform.
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

      <section id="features" className="features">
        <h3>Core System Features</h3>

        <div className="feature-grid">
          <FeatureCard
            icon={<CalendarCheck />}
            title="Smart Ground Booking"
            desc="Players can book futsal grounds using public or private booking with real-time availability."
            to="/grounds"
          />

          <FeatureCard
            icon={<Users />}
            title="Team Formation & Connections"
            desc="Create public teams, request to join matches, accept or reject players, and build connections."
            to="/open-games"
          />

          <FeatureCard
            icon={<MapPin />}
            title="Location & Preference Based Search"
            desc="Find futsal grounds based on location, time, budget, and availability preferences."
            to="/grounds"
          />
        </div>
      </section>

      <section className="features">
        <h3>Featured Futsal Grounds</h3>

        <div className="feature-grid">
          <div className="featured-wrap">
            <GroundCard
              id="featured-1"
              image={dhukuFutsalHub}
              name="Dhuku Futsal Hub"
              location="Kathmandu"
              desc="Modern futsal ground with premium turf and night lighting."
              to="/grounds"
            />
          </div>

          <div className="featured-wrap">
            <GroundCard
              id="featured-2"
              image={khelkunjArena}
              name="Khelkunj Arena"
              location="Pokhara"
              desc="Popular futsal venue with flexible slots and easy parking."
              to="/grounds"
            />
          </div>

          <div className="featured-wrap">
            <GroundCard
              id="featured-3"
              image={fieldFutsal}
              name="Field Futsal"
              location="Lalitpur"
              desc="Well-maintained ground ideal for competitive and friendly matches."
              to="/grounds"
            />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-head">
          <h3>Open Games (Today)</h3>
        </div>

        <div className="feature-grid">
          {loadingOpenGames ? (
            <div style={{ color: "#cbd5f5" }}>Loading open games...</div>
          ) : openGames.length > 0 ? (
            openGames.slice(0, 3).map((game, index) => (
              <OpenGameCard
                key={game.id}
                image={game.ground_image_url || fallbackImages[index % fallbackImages.length]}
                name={game.ground_name}
                date={game.date}
                time={`${game.start_time} - ${game.end_time}`}
                requiredPlayers={`${game.spots_left} player${game.spots_left > 1 ? "s" : ""} needed`}
                phone={game.ground_phone || "Contact not available"}
                chatLink={`/open-games/${game.id}`}
              />
            ))
          ) : (
            <div style={{ color: "#cbd5f5" }}>No open games available for today.</div>
          )}
        </div>

        <div className="section-foot">
          <Link to="/open-games" className="btn outline">
            View All
          </Link>
        </div>
      </section>

      <section id="how" className="how">
        <h3>How Sportify Works</h3>

        <p
          style={{
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto 48px",
            color: "#cbd5f5",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          Sportify is a web-based futsal management system designed to solve
          common problems in futsal booking, team formation, and communication.
        </p>

        <div className="steps">
          <StepCard
            step="1"
            title="Register & Login"
            desc="Users register as players or futsal owners with secure authentication."
          />
          <StepCard
            step="2"
            title="Search, Book & Pay"
            desc="Players find futsal grounds and book available slots."
          />
          <StepCard
            step="3"
            title="Play, Connect & Chat"
            desc="Players form teams, chat in real time, and stay connected."
          />
        </div>
      </section>
    </div>
  );
}

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

function StepCard({ step, title, desc }) {
  return (
    <div className="step-card">
      <div className="step">{step}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}