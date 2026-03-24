import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./Chat.css";

export default function Chat() {
  const nav = useNavigate();
  const { id } = useParams();
  const { pathname } = useLocation();

  const isGroup = pathname.includes("/chat/group/");
  const title = isGroup ? "Group Chat" : "Friend Chat";

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const endRef = useRef(null);

  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadGroupChat = async () => {
    try {
      setErr("");

      const [groupData, messageData] = await Promise.all([
        apiFetch(`/api/chat-groups/${id}/`),
        apiFetch(`/api/chat-groups/${id}/messages/`),
      ]);

      setChatInfo(groupData);
      setMessages(Array.isArray(messageData) ? messageData : []);
    } catch (e) {
      console.error("Failed to load chat", e);
      setErr(e?.message || "Failed to load chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGroup) {
      setLoading(false);
      return;
    }

    loadGroupChat();

    const timer = setInterval(() => {
      loadGroupChat();
    }, 3000);

    return () => clearInterval(timer);
  }, [id, isGroup]);

  const send = async () => {
    const t = text.trim();
    if (!t || !isGroup) return;

    setSending(true);
    setErr("");

    try {
      const created = await apiFetch(`/api/chat-groups/${id}/messages/`, {
        method: "POST",
        body: JSON.stringify({ message: t }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (e) {
      console.error("Failed to send message", e);
      setErr(e?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
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
          ? `${chatInfo.member_count || 0} members • Temporary match chat`
          : "",
      };
    }

    return {
      name: "Friend Chat",
      meta: "Friend chat backend not connected yet",
    };
  }, [isGroup, chatInfo]);

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
          ) : !isGroup ? (
            <div className="chat-messages">Friend chat backend not connected yet.</div>
          ) : (
            <>
              <div className="chat-messages">
                {messages.map((m) => {
                  const mine =
                    m.by === "me" ||
                    m.sender === "me" ||
                    m.is_mine === true;

                  return (
                    <div
                      key={m.id}
                      className={`msg ${mine ? "me" : "other"}`}
                    >
                      {!mine && (
                        <div className="msg-sender">
                          {m.sender_name || "User"}
                        </div>
                      )}

                      <div className="msg-bubble">
                        {m.message || m.text}
                      </div>

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
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
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