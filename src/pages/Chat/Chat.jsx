import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./Chat.css";

export default function Chat() {
  const nav = useNavigate();
  const { id } = useParams();
  const { pathname } = useLocation();

  const isGroup = pathname.includes("/chat/group/");
  const isDirect =
    pathname.includes("/chat/friend/") || pathname.includes("/chat/direct/");
  const title = isGroup ? "Group Chat" : "Friend Chat";

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [socketReady, setSocketReady] = useState(false);

  const socketRef = useRef(null);
  const endRef = useRef(null);

  const myUserId = Number(localStorage.getItem("user_id"));

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        setErr("");
        setLoading(true);

        const token = localStorage.getItem("access");
        if (!token || token === "undefined" || token === "null") {
          if (isMounted) {
            setErr("Your session expired. Please log in again.");
            setLoading(false);
          }
          return;
        }

        if (isGroup) {
          const [groupData, messageData] = await Promise.all([
            apiFetch(`/chat-groups/${id}/`),
            apiFetch(`/chat-groups/${id}/messages/`)
          ]);

          if (!isMounted) return;
          setChatInfo(groupData);
          setMessages(Array.isArray(messageData) ? messageData : []);
        } else if (isDirect) {
          const [chatData, messageData] = await Promise.all([
            apiFetch(`/direct-chats/${id}/`),
            apiFetch(`/direct-chats/${id}/messages/`),
          ]);

          if (!isMounted) return;
          setChatInfo(chatData);
          setMessages(Array.isArray(messageData) ? messageData : []);
        } else {
          if (isMounted) setErr("Invalid chat route.");
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setErr(e?.message || "Failed to load chat.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [id, isGroup, isDirect]);

  useEffect(() => {
    if (!id || (!isGroup && !isDirect)) return;
    if (loading) return;
    if (err) return;

    const token = localStorage.getItem("access");
    if (!token || token === "undefined" || token === "null") {
      setErr("Your session expired. Please log in again.");
      return;
    }

    const rawHost = import.meta.env.VITE_WS_HOST || "127.0.0.1:8000";
    const cleanHost = rawHost
      .replace(/^https?:\/\//, "")
      .replace(/^wss?:\/\//, "")
      .replace(/\/+$/, "");

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsPath = isGroup ? `/ws/chat/${id}/` : `/ws/direct-chat/${id}/`;

    const socketUrl = `${protocol}://${cleanHost}${wsPath}?token=${encodeURIComponent(token)}`;
    console.log("Opening WebSocket:", socketUrl);

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS connected");
      setSocketReady(true);
      setErr("");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setMessages((prev) => {
          const exists = prev.some((m) => String(m.id) === String(data.id));
          if (exists) return prev;

          return [
            ...prev,
            {
              ...data,
              is_mine: Number(data.sender_id) === myUserId,
            },
          ];
        });
      } catch (e) {
        console.error("Bad socket message", e);
      }
    };

    socket.onerror = (e) => {
      console.error("WS error", e);
      setSocketReady(false);
    };

    socket.onclose = (e) => {
      console.error("WS closed", e.code, e.reason);
      setSocketReady(false);

      if (e.code === 4001) {
        setErr("WebSocket auth failed. Please log in again.");
      } else if (e.code === 4003) {
        setErr("You are not allowed to access this chat.");
      } else if (e.code === 4004) {
        setErr("This group chat is inactive or expired.");
      } else if (e.code === 1006) {
        setErr("Socket closed unexpectedly. Check Django terminal logs.");
      }
    };

    return () => {
      setSocketReady(false);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [id, isGroup, isDirect, myUserId, loading]);

  const send = () => {
    const t = text.trim();

    if (!t) return;
    if (!socketRef.current) return;
    if (socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({ message: t }));
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const headerInfo = useMemo(() => {
    if (isGroup) {
      return {
        name: chatInfo?.name || "Group Chat",
        meta: chatInfo
          ? `${chatInfo.member_count || 0} members • ${
              socketReady ? "Live" : "Connecting..."
            }`
          : "",
      };
    }

    return {
      name: chatInfo?.other_username || "Friend Chat",
      meta: socketReady ? "Live" : "Connecting...",
    };
  }, [isGroup, chatInfo, socketReady]);

  return (
    <div className="chat-page">
      <div className="chat-wrap">
        <div className="chat-top">
          <button className="chat-back" onClick={() => nav(-1)} type="button">
            ← Back
          </button>

          <div className="chat-headInfo">
            <div className="chat-titleRow">
              <div className="chat-avatar">{getInitials(headerInfo.name)}</div>
              <div>
                <div className="chat-name">{headerInfo.name}</div>
                <div className="chat-meta">{headerInfo.meta}</div>
              </div>
            </div>

            <div className="chat-chip">{title}</div>
          </div>
        </div>

        <div className="chat-card">
          {loading ? (
            <div className="chat-messages">Loading chat...</div>
          ) : err ? (
            <div className="chat-messages">{err}</div>
          ) : (
            <>
              <div className="chat-messages">
                {messages.map((m) => {
                  const mine =
                    Number(m.sender_id) === myUserId || m.is_mine === true;

                  return (
                    <div key={m.id} className={`msg ${mine ? "me" : "other"}`}>
                      {!mine && (
                        <div className="msg-sender">
                          {m.sender_name || "User"}
                        </div>
                      )}

                      <div className="msg-bubble">{m.message || m.text}</div>

                      <div className="msg-time">
                        {formatMsgTime(m.created_at || m.time)}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="chat-compose">
                <textarea
                  className="chat-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                />

                <button
                  className="chat-send"
                  type="button"
                  onClick={send}
                  disabled={!socketReady || !text.trim()}
                >
                  {socketReady ? "Send" : "Connecting..."}
                </button>
              </div>
            </>
          )}
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

function formatMsgTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}