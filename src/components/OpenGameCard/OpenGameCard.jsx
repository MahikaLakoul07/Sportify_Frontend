import React from "react";
import { Link } from "react-router-dom";
import "./OpenGameCard.css";

export default function OpenGameCard({
  image,
  name,
  date,
  time,
  requiredPlayers,
  phone,
  chatLink = "/open-games",
}) {
  return (
    <div className="openCard">
      <img className="openCard__img" src={image} alt={name} />

      <div className="openCard__body">
        <h4 className="openCard__title">{name}</h4>

        <div className="openCard__meta">
          <div><b>Date:</b> {date}</div>
          <div><b>Time:</b> {time}</div>
          <div><b>Players Needed:</b> {requiredPlayers}</div>
          <div><b>Phone:</b> {phone}</div>
        </div>

        <Link to={chatLink} className="btn primary openCard__btn">
          Join Game
        </Link>
      </div>
    </div>
  );
}