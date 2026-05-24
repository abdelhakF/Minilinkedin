import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";
import Navbar from "../Common/Navbar";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const { notifications, loading, error, deleteNotification, markAsRead } =
    useNotification();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");

  const handleNotificationClick = (notification) => {
    const notificationId = notification.notificationId ?? notification.id;

    // Marquer comme lu
    if (!(notification.isRead ?? notification.read)) {
      markAsRead(notificationId);
    }

    switch (notification.type) {
      case "LIKE":
      case "LIKE_COMMENT": // ← Gestion propre du like de commentaire
      case "COMMENT":
      case "SHARE":
        // Pour ces types, relatedId doit correspondre à l'ID du Post
        if (notification.relatedId) {
          navigate(`/posts/${notification.relatedId}`);
        } else {
          navigate("/feed"); // fallback
        }
        break;

      case "CONNECTION":
        navigate("/network");
        break;

      case "VISITE":
        if (notification.relatedId) {
          navigate(`/profile/${notification.relatedId}`);
        }
        break;

      case "MESSAGE":
        if (notification.relatedId) {
          navigate(`/messages/${notification.relatedId}`);
        }
        break;

      case "CANDIDATURE":
        navigate("/candidatures");
        break;

      default:
        navigate("/feed");
    }
  };

  const parseNotificationDate = (dateValue) => {
    if (!dateValue) return null;

    if (typeof dateValue === "number") {
      const millis = dateValue < 1e12 ? dateValue * 1000 : dateValue;
      return new Date(millis);
    }

    if (typeof dateValue === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return new Date(`${dateValue}T00:00:00`);
      }

      const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(dateValue);
      const parsed = new Date(hasTimezone ? dateValue : dateValue);
      return Number.isNaN(parsed.getTime()) ? new Date(dateValue) : parsed;
    }

    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getTime = (dateValue) => {
    const parsedDate = parseNotificationDate(dateValue);
    if (!parsedDate) return "—";

    if (
      typeof dateValue === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const startOfDate = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
      );
      const diffDays = Math.floor(
        (startOfToday - startOfDate) / (1000 * 60 * 60 * 24),
      );

      if (diffDays <= 0) return "aujourd'hui";
      if (diffDays === 1) return "hier";
      return `il y a ${diffDays} j`;
    }

    const diff = (new Date() - parsedDate) / 1000;

    if (diff < 60) return "à l’instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return `il y a ${Math.floor(diff / 86400)} j`;
  };

  const filtered = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => {
      const dateA = parseNotificationDate(a.createdAt)?.getTime() || 0;
      const dateB = parseNotificationDate(b.createdAt)?.getTime() || 0;
      return dateB - dateA; 
    });

    if (filter === "UNREAD") {
      return sorted.filter((n) => !(n.isRead ?? n.read));
    }

    return sorted;
  }, [notifications, filter]);

  const getIcon = (type) => {
    switch (type) {
      case "VISITE":
        return "👁️";
      case "LIKE":
      case "LIKE_COMMENT":
        return "👍";
      case "COMMENT":
        return "💬";
      case "SHARE":
        return "🔁";
      case "CONNECTION":
        return "👥";
      case "MESSAGE":
        return "✉️";
      case "CANDIDATURE":
        return "💼";
      default:
        return "🔔";
    }
  };

  return (
    <div className="notif-page">
      <Navbar />

      <div className="notif-container">
        {/* HEADER */}
        <div className="notif-header">
          <div>
            <h2>Notifications</h2>
            <p>
              {notifications?.filter((n) => !(n.isRead ?? n.read)).length || 0}{" "}
              non lue(s)
            </p>
          </div>

          <div className="notif-tabs">
            <button
              onClick={() => setFilter("ALL")}
              className={filter === "ALL" ? "active" : ""}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={filter === "UNREAD" ? "active" : ""}
            >
              Non lues
            </button>
          </div>
        </div>

        {/* STATES */}
        {loading && <div className="state">Chargement...</div>}
        {error && <div className="state error">{error}</div>}

        {/* LIST */}
        <div className="notif-list">
          {filtered.length === 0 && !loading && (
            <div className="state">Aucune notification</div>
          )}

          {filtered.map((n) => {
            const isUnread = !(n.isRead ?? n.read);
            const notificationId = n.notificationId ?? n.id;

            return (
              <div
                key={notificationId}
                className={`notif-item ${isUnread ? "unread" : ""}`}
                onClick={() => handleNotificationClick(n)}
              >
                {/* ICON */}
                <div className="notif-icon">{getIcon(n.type)}</div>

                {/* CONTENT */}
                <div className="notif-content">
                  <div className="notif-text">{n.content}</div>

                  <div className="notif-meta">
                    <span>{getTime(n.createdAt)}</span>
                    <span>•</span>
                    <span>{n.type}</span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="notif-right">
                  {isUnread && <span className="dot" />}

                  <button
                    className="more"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notificationId);
                    }}
                  >
                    ⋯
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
