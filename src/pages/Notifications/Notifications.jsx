import React, { memo, useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/connections/notifications/");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      alert(error.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/connections/${notificationId}/notifications/read/`, {
        method: "POST",
      });

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      alert(error.message || "Failed to update notification.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/connections/notifications/read-all/", {
        method: "POST",
      });

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      alert(error.message || "Failed to update notifications.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-page">
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Notifications</h1>
            <p style={{ marginTop: "6px", opacity: 0.8 }}>
              Connection updates and booking activity.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                background: "#14532d",
                color: "#dcfce7",
                fontSize: "12px",
                padding: "6px 10px",
                borderRadius: "999px",
                fontWeight: 700,
              }}
            >
              Unread: {unreadCount}
            </span>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "#22c55e",
                  color: "#052e16",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="notification-card">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-card">
            <Bell size={22} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="notification-card"
              style={{
                borderLeft: item.is_read ? "4px solid transparent" : "4px solid #4ade80",
                opacity: item.is_read ? 0.82 : 1,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    alignItems: "start",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{item.message}</strong>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    {!item.is_read && (
                      <span
                        style={{
                          background: "#14532d",
                          color: "#dcfce7",
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          fontWeight: 700,
                        }}
                      >
                        New
                      </span>
                    )}

                    {!item.is_read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid #4ade80",
                          color: "#4ade80",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={16} />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ marginTop: "8px", opacity: 0.75 }}>
                  From: {item.actor?.full_name || item.actor?.username || "User"}
                </p>

                <p style={{ marginTop: "6px", opacity: 0.6, fontSize: "13px" }}>
                  Type: {item.notification_type}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default memo(Notifications);