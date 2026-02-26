import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Inbox.css";
export default function Inbox() {
  const nav = useNavigate();

  // ✅ MOCK DATA (Friends + Groups)
  const [friendChats] = useState([
    {
      id: 1,
      name: "Sagar Shrestha",
      last_message: "Bro 7 baje game confirm ho?",
      last_time: "6:42 PM",
      unread_count: 2,
    },
    {
      id: 2,
      name: "Rohit Lama",
      last_message: "Location pathau na",
      last_time: "5:10 PM",
      unread_count: 0,
    },
    {
      id: 3,
      name: "Aayush Karki",
      last_message: "Ma goalkeeper aaunchu hai",
      last_time: "Yesterday",
      unread_count: 1,
    },
  ]);

  const [groupChats] = useState([
    {
      id: 101,
      title: "Kamal Pokhari Open Game",
      last_message: "Needed 1 Defender. Anyone?",
      last_time: "7:01 PM",
      unread_count: 5,
    },
    {
      id: 102,
      title: "Islington Futsal - Saturday",
      last_message: "Court booked ✅ 12:00 PM",
      last_time: "Today",
      unread_count: 0,
    },
    {
      id: 103,
      title: "Sportify Players - Kathmandu",
      last_message: "New open game posted at Baneshwor!",
      last_time: "Mon",
      unread_count: 3,
    },
  ]);

  const [tab, setTab] = useState("friends"); // friends | groups
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const items = tab === "friends" ? friendChats : groupChats;
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((x) =>
      (x?.title || x?.name || "").toLowerCase().includes(query)
    );
  }, [tab, q, friendChats, groupChats]);

  const openChat = (item) => {
    // You can change these routes later
    if (tab === "friends") nav(`/chat/friend/${item.id}`);
    else nav(`/chat/group/${item.id}`);
  };

  return (
    <div className="inbox-page">
      <div className="inbox-wrap">
        {/* Header */}
        <div className="inbox-top">
          <div>
            <h1 className="inbox-title">Inbox</h1>
            <p className="inbox-sub">
              Your friend and group conversations in one place.
            </p>
          </div>

          <Link className="inbox-linkBtn" to="/open-games">
            Browse Open Games
          </Link>
        </div>

        {/* Main Card */}
        <div className="inbox-card">
          {/* Tabs + Search */}
          <div className="inbox-toolbar">
            <div className="inbox-tabs">
              <button
                className={`inbox-tab ${tab === "friends" ? "active" : ""}`}
                onClick={() => setTab("friends")}
                type="button"
              >
                Friends <span className="inbox-count">{friendChats.length}</span>
              </button>

              <button
                className={`inbox-tab ${tab === "groups" ? "active" : ""}`}
                onClick={() => setTab("groups")}
                type="button"
              >
                Groups <span className="inbox-count">{groupChats.length}</span>
              </button>
            </div>

            <div className="inbox-search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${tab === "friends" ? "friends" : "groups"}...`}
              />
            </div>
          </div>

          {/* Chats */}
          <div className="inbox-list">
            {list.map((item) => (
              <button
                key={item.id}
                type="button"
                className="inbox-row"
                onClick={() => openChat(item)}
              >
                {/* Avatar */}
                <div className="inbox-avatar">
                  {getInitials(item?.title || item?.name || "Chat")}
                </div>

                {/* Middle */}
                <div className="inbox-mid">
                  <div className="inbox-name">
                    {item?.title || item?.name || "Untitled"}
                  </div>
                  <div className="inbox-last">
                    {item?.last_message || "No messages yet"}
                  </div>
                </div>

                {/* Right */}
                <div className="inbox-right">
                  <div className="inbox-time">{item?.last_time || ""}</div>
                  {!!item?.unread_count && (
                    <div className="inbox-badge">{item.unread_count}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(text) {
  const s = String(text || "").trim();
  if (!s) return "C";
  const parts = s.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "C";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}