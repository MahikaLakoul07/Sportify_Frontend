import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Chat.css";

export default function Chat() {
  const nav = useNavigate();
  const { id } = useParams();
  const { pathname } = useLocation();

  const isGroup = pathname.includes("/chat/group/");
  const title = isGroup ? "Group Chat" : "Friend Chat";

  // ✅ MOCK CHAT HEADER INFO (based on route type)
  const chatInfo = useMemo(() => {
    if (isGroup) {
      return {
        id,
        name: "Kamal Pokhari Open Game",
        meta: "8 members • Match day discussion",
      };
    }
    return {
      id,
      name: "Sagar Shrestha",
      meta: "Last seen recently",
    };
  }, [id, isGroup]);

  // ✅ MOCK MESSAGES
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      by: "other",
      text: isGroup
        ? "Guys, 1 defender needed. Who’s coming?"
        : "Bro, game confirm ho?",
      time: "6:40 PM",
      senderName: isGroup ? "Aayush" : null,
    },
    {
      id: 2,
      by: "me",
      text: "Ma aunchu. Time kati ho?",
      time: "6:41 PM",
      senderName: isGroup ? "You" : null,
    },
    {
      id: 3,
      by: "other",
      text: isGroup ? "12 PM sharp. Court booked ✅" : "12 PM. Islington.",
      time: "6:42 PM",
      senderName: isGroup ? "Rohit" : null,
    },
  ]);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef(null);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;

    setSending(true);

    // add message instantly (optimistic)
    const newMsg = {
      id: Date.now(),
      by: "me",
      text: t,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderName: isGroup ? "You" : null,
    };

    setMessages((p) => [...p, newMsg]);
    setText("");

    try {
      // Later: POST /chats/:id/messages
      await new Promise((r) => setTimeout(r, 300));
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

  return (
    <div className="chat-page">
      <div className="chat-wrap">
        {/* Header */}
        <div className="chat-top">
          <button className="chat-back" onClick={() => nav(-1)} type="button">
            ← Back
          </button>

          <div className="chat-headInfo">
            <div className="chat-titleRow">
              <div className="chat-avatar">{getInitials(chatInfo.name)}</div>
              <div>
                <div className="chat-name">{chatInfo.name}</div>
                <div className="chat-meta">{chatInfo.meta}</div>
              </div>
            </div>

            <div className="chat-chip">{title}</div>
          </div>
        </div>

        {/* Body */}
        <div className="chat-card">
          <div className="chat-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`msg ${m.by === "me" ? "me" : "other"}`}
              >
                {isGroup && m.by !== "me" && (
                  <div className="msg-sender">{m.senderName}</div>
                )}

                <div className="msg-bubble">{m.text}</div>
                <div className="msg-time">{m.time}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
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