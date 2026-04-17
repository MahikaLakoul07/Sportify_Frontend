import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./Inbox.css";

export default function Inbox() {
  const nav = useNavigate();

  const [tab, setTab] = useState("friends");
  const [q, setQ] = useState("");

  const [friendChats, setFriendChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [groupErr, setGroupErr] = useState("");
  const [friendErr, setFriendErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token || token === "undefined" || token === "null") {
      setFriendErr("Your session expired. Please log in again.");
      setGroupErr("Your session expired. Please log in again.");
      setFriendChats([]);
      setGroupChats([]);
      return;
    }

    const loadGroups = async () => {
      try {
        setLoadingGroups(true);
        setGroupErr("");
        const data = await apiFetch("/chat-groups/my/");
        setGroupChats(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load group chats", e);
        setGroupErr(e?.message || "Failed to load group chats.");
        setGroupChats([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    const loadFriends = async () => {
      try {
        setLoadingFriends(true);
        setFriendErr("");
        const data = await apiFetch("/direct-chats/my/");
        setFriendChats(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load friend chats", e);
        setFriendErr(e?.message || "Failed to load friend chats.");
        setFriendChats([]);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadGroups();
    loadFriends();
  }, []);

  const list = useMemo(() => {
    const items = tab === "friends" ? friendChats : groupChats;
    const query = q.trim().toLowerCase();

    if (!query) return items;

    return items.filter((x) =>
      (
        x?.other_username ||
        x?.other_full_name ||
        x?.title ||
        x?.name ||
        ""
      )
        .toLowerCase()
        .includes(query)
    );
  }, [tab, q, friendChats, groupChats]);

  const getFriendTargetUserId = (item) => {
    return (
      item?.other_user_id ||
      item?.other_user?.user_id ||
      item?.other_user?.id ||
      item?.friend_id ||
      item?.friend?.user_id ||
      item?.friend?.id ||
      item?.user_id ||
      null
    );
  };

  const getFriendDisplayName = (item) => {
    return (
      item?.other_full_name ||
      item?.other_username ||
      item?.friend?.full_name ||
      item?.friend?.username ||
      "User"
    );
  };

  const openChat = (item) => {
    if (tab === "friends") {
      const otherUserId = getFriendTargetUserId(item);

      if (!otherUserId) {
        console.error("Direct chat item is missing other user id:", item);
        setFriendErr("Could not open this direct chat because the friend id is missing.");
        return;
      }

      nav(`/chat/friend/${otherUserId}`);
    } else {
      nav(`/chat/group/${item.id}`);
    }
  };

  return (
    <div className="inbox-page">
      <div className="inbox-wrap">
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

        <div className="inbox-card">
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

          <div className="inbox-list">
            {tab === "friends" ? (
              loadingFriends ? (
                <div className="inbox-empty">Loading friend chats...</div>
              ) : friendErr ? (
                <div className="inbox-empty">{friendErr}</div>
              ) : list.length > 0 ? (
                list.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="inbox-row"
                    onClick={() => openChat(item)}
                  >
                    <div className="inbox-avatar">
                      {getInitials(getFriendDisplayName(item))}
                    </div>

                    <div className="inbox-mid">
                      <div className="inbox-name">
                        {getFriendDisplayName(item)}
                      </div>
                      <div className="inbox-last">
                        {item?.last_message || "No messages yet"}
                      </div>
                    </div>

                    <div className="inbox-right">
                      <div className="inbox-time">
                        {formatLastTime(item?.last_time)}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="inbox-empty">No friend chats found.</div>
              )
            ) : loadingGroups ? (
              <div className="inbox-empty">Loading groups...</div>
            ) : groupErr ? (
              <div className="inbox-empty">{groupErr}</div>
            ) : list.length > 0 ? (
              list.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="inbox-row"
                  onClick={() => openChat(item)}
                >
                  <div className="inbox-avatar">
                    {getInitials(item?.name || "Group")}
                  </div>

                  <div className="inbox-mid">
                    <div className="inbox-name">
                      {item?.name || "Untitled Group"}
                    </div>
                    <div className="inbox-last">
                      {item?.last_message || "No messages yet"}
                    </div>
                  </div>

                  <div className="inbox-right">
                    <div className="inbox-time">
                      {formatLastTime(item?.last_time)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="inbox-empty">No group chats found.</div>
            )}
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

function formatLastTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}