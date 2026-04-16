import React, { useEffect, useState, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import {
  Mail,
  Phone,
  UserPlus,
  Check,
  X,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import "./ViewPlayerProfile.css";

const ViewPlayerProfile = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [statusData, setStatusData] = useState({
    status: "NONE",
    request_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfileAndStatus = async () => {
    try {
      setLoading(true);

      const [playerData, relationData] = await Promise.all([
        apiFetch(`/auth/players/${playerId}/`),
        apiFetch(`/connections/status/${playerId}/`),
      ]);

      console.log("PLAYER PROFILE DATA:", playerData);
      console.log("CONNECTION STATUS DATA:", relationData);

      setPlayer(playerData);
      setStatusData(relationData || { status: "NONE", request_id: null });
    } catch (error) {
      console.error("Failed to load player profile:", error);
      alert(error?.message || "Failed to load player profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playerId) {
      fetchProfileAndStatus();
    }
  }, [playerId]);

  const handleSendRequest = async () => {
    try {
      setActionLoading(true);

      const payload = {
        receiver_id: Number(playerId),
      };

      console.log("SEND CONNECTION PAYLOAD:", payload);

      const res = await apiFetch("/connections/request/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("SEND CONNECTION RESPONSE:", res);

      if (res?.status === "ACCEPTED") {
        setStatusData({ status: "CONNECTED", request_id: res.id });
      } else if (res?.status === "PENDING") {
        setStatusData({ status: "OUTGOING_PENDING", request_id: res.id });
      } else {
        await fetchProfileAndStatus();
      }
    } catch (error) {
      console.error("Failed to send request:", error);
      alert(error?.message || "Failed to send request.");
      await fetchProfileAndStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      if (!statusData?.request_id) return;

      setActionLoading(true);

      const res = await apiFetch(`/connections/${statusData.request_id}/accept/`, {
        method: "POST",
      });

      console.log("ACCEPT CONNECTION RESPONSE:", res);

      setStatusData((prev) => ({
        ...prev,
        status: "CONNECTED",
      }));
    } catch (error) {
      console.error("Failed to accept request:", error);
      alert(error?.message || "Failed to accept request.");
      await fetchProfileAndStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      if (!statusData?.request_id) return;

      setActionLoading(true);

      const res = await apiFetch(`/connections/${statusData.request_id}/reject/`, {
        method: "POST",
      });

      console.log("REJECT CONNECTION RESPONSE:", res);

      setStatusData({ status: "NONE", request_id: null });
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert(error?.message || "Failed to reject request.");
      await fetchProfileAndStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const renderConnectionAction = () => {
    if (actionLoading) {
      return (
        <button className="vp-btn vp-btn-primary" disabled>
          Working...
        </button>
      );
    }

    switch (statusData?.status) {
      case "SELF":
        return null;

      case "NONE":
        return (
          <button className="vp-btn vp-btn-primary" onClick={handleSendRequest}>
            <UserPlus size={16} />
            Connect
          </button>
        );

      case "OUTGOING_PENDING":
        return (
          <button className="vp-btn vp-btn-muted" disabled>
            Request Sent
          </button>
        );

      case "INCOMING_PENDING":
        return (
          <div className="vp-actionGroup">
            <button className="vp-btn vp-btn-success" onClick={handleAccept}>
              <Check size={16} />
              Accept
            </button>
            <button className="vp-btn vp-btn-danger" onClick={handleReject}>
              <X size={16} />
              Reject
            </button>
          </div>
        );

      case "CONNECTED":
        return (
          <div className="vp-actionGroup">
            <button className="vp-btn vp-btn-connected" disabled>
              <Check size={16} />
              Connected
            </button>

            <Link
              to={`/chat/friend/${playerId}`}
              className="vp-btn vp-btn-primary"
              onClick={() => console.log("Opening chat for playerId =", playerId)}
            >
              <MessageCircle size={16} />
              Message
            </Link>
          </div>
        );

      default:
        return (
          <button className="vp-btn vp-btn-primary" onClick={handleSendRequest}>
            <UserPlus size={16} />
            Connect
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="vp-page">
        <div className="vp-loading">Loading player profile...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="vp-page">
        <div className="vp-loading">Player not found.</div>
      </div>
    );
  }

  const displayName =
    `${player?.first_name || ""} ${player?.last_name || ""}`.trim() ||
    player?.full_name ||
    player?.username ||
    "Player";

  return (
    <div className="vp-page">
      <div className="vp-wrap">
        <button className="vp-backBtn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="vp-card">
          <div className="vp-top">
            <div className="vp-avatar">
              {(player?.username || player?.first_name || "P")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="vp-mainInfo">
              <h1>{displayName}</h1>

              <div className="vp-subInfo">
                <span>
                  <Mail size={14} />
                  {player?.email || "No email"}
                </span>

                <span>
                  <Phone size={14} />
                  {player?.phone || "No phone"}
                </span>
              </div>
            </div>

            <div className="vp-actions">{renderConnectionAction()}</div>
          </div>

          <div className="vp-section">
            <h3>Player Info</h3>
            <p>
              This player can be added to your connections for easier future
              invites and chats.
            </p>
          </div>

          <div className="vp-grid">
            <div className="vp-miniCard">
              <div className="vp-miniLabel">Username</div>
              <div className="vp-miniValue">{player?.username || "-"}</div>
            </div>

            <div className="vp-miniCard">
              <div className="vp-miniLabel">Phone</div>
              <div className="vp-miniValue">{player?.phone || "Not available"}</div>
            </div>

            <div className="vp-miniCard">
              <div className="vp-miniLabel">Email</div>
              <div className="vp-miniValue">{player?.email || "Not available"}</div>
            </div>

            <div className="vp-miniCard">
              <div className="vp-miniLabel">Gender</div>
              <div className="vp-miniValue">{player?.gender || "Not set"}</div>
            </div>
          </div>

          {statusData?.status === "CONNECTED" && (
            <div className="vp-note success">
              You are connected with this player.
            </div>
          )}

          {statusData?.status === "OUTGOING_PENDING" && (
            <div className="vp-note">
              Connection request has been sent and is waiting for approval.
            </div>
          )}

          {statusData?.status === "INCOMING_PENDING" && (
            <div className="vp-note">
              This player has sent you a connection request.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ViewPlayerProfile);