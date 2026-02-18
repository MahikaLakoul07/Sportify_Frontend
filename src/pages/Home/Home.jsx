import React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Star, Users, LayoutDashboard} from "lucide-react";
import { Link } from "react-router-dom"; //using React Router, it will be client-side navigation.
import "./Home.css";
import logo from "../../assets/logo.png";
import futsalImage from "../../assets/futsal_pic.png"; 
import dhukuFutsalHub from "../../assets/dhuku_futsal_hub.png";
import khelkunjArena from "../../assets/khelkunj_arena.png";
import fieldFutsal from "../../assets/field_futsal.png";


export default function Home() {
  return (
    <div className="page">
     

      {/* Hero Section */}
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
            <button className="btn primary">Book a Ground</button>
            <button
                className="btn outline"
                onClick={() =>
                document
                  .getElementById("how")
                  .scrollIntoView({ behavior: "smooth" })
                }
            >
                 Learn More
            </button>

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hero-image"
        >
          <img
            src={futsalImage}
            alt="Futsal"
          />
        </motion.div>
      </section>

      {/* Features */}

      <section id="features" className="features">
        <h3>Core System Features</h3>
        <div className="feature-grid">
        <FeatureCard
            icon={<CalendarCheck />}
            title="Smart Ground Booking"
            desc="Players can book futsal grounds using public or private booking with real-time availability."
        />

        <FeatureCard
            icon={<Users />}
            title="Team Formation & Connections"
            desc="Create public teams, request to join matches, accept or reject players, and build connections."
        />

        <FeatureCard
            icon={<MapPin />}
            title="Location & Preference Based Search"
            desc="Find futsal grounds based on location, time, budget, and availability preferences."
        />

        </div>
     </section>

    {/* Featured Futsal Grounds */}
     <section className="features">
       <h3>Featured Futsal Grounds</h3>

     <div className="feature-grid">
        <FutsalCard
            image={dhukuFutsalHub}
            name="Dhuku Futsal Hub"
            location="Kathmandu"
            desc="Modern futsal ground with premium turf and night lighting."
        />

        <FutsalCard
            image={khelkunjArena}
            name="Khelkunj Arena"
            location="Pokhara"
            desc="Popular futsal venue with flexible slots and easy parking."
        />

        <FutsalCard
            image={fieldFutsal}
            name="Field Futsal"
            location="Lalitpur"
            desc="Well-maintained ground ideal for competitive and friendly matches."
        />
     </div>
     </section>


     {/* How it works */}
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
        Sportify is a web-based futsal management system designed to solve common
        problems in futsal booking, team formation, and communication. It connects
        players, futsal owners, and administrators on a single platform with
        real-time booking, chat, and secure payment integration.
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
            desc="Players find futsal grounds, choose public or private booking, and pay online or on the field."
        />
        <StepCard
            step="3"
            title="Play, Connect & Chat"
            desc="Players form teams, chat in real time, play matches, and stay connected."
        />
    </div>
    </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="icon">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
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

function FutsalCard({ image, name, location, desc }) {
  return (
    <div className="feature-card">
      <img
        src={image}
        alt={name}
        className="futsal-image"
      />
       

      <h4>{name}</h4>

      <p style={{ fontSize: "14px", color: "#cbd5f5", marginBottom: "8px" }}>
        <MapPin size={14} /> {location}
      </p>

      <p>{desc}</p>
    </div>
  );
}



