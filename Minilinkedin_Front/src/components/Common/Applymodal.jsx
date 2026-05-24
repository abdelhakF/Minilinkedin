// src/components/Posts/ApplyModal.jsx
import React, { useState } from "react";
import candidatureService from "../../services/candidatureService";

export default function ApplyModal({ post, onClose, onSuccess }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Veuillez écrire un message de motivation.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await candidatureService.postuler(post.id, message.trim());
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "";
      setError(msg || "Erreur lors de l'envoi de la candidature.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.iconBadge}>💼</div>
          <div>
            <h3 style={S.title}>Postuler à cette offre</h3>
            <p style={S.subtitle}>{post?.titre || "Offre de stage"}</p>
          </div>
          <button style={S.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div style={S.divider} />

        {/* Post recap */}
        <div style={S.postRecap}>
          <span style={S.recapLabel}>Auteur :</span>
          <span style={S.recapValue}>{post?.auteur?.nom || "—"}</span>
          {post?.lieu && (
            <>
              <span style={S.recapLabel}>Lieu :</span>
              <span style={S.recapValue}>{post.lieu}</span>
            </>
          )}
          {post?.duree && (
            <>
              <span style={S.recapLabel}>Durée :</span>
              <span style={S.recapValue}>{post.duree}</span>
            </>
          )}
        </div>

        {/* Message field */}
        <div style={S.fieldGroup}>
          <label style={S.label}>Lettre de motivation *</label>
          <textarea
            style={S.textarea}
            placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={1000}
          />
          <span style={S.charCount}>{message.length}/1000</span>
        </div>

        {error && <div style={S.error}>{error}</div>}

        {/* Actions */}
        <div style={S.actions}>
          <button style={S.cancelBtn} onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button style={S.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span style={S.spinner}>⏳ Envoi…</span>
            ) : (
              "📨 Envoyer ma candidature"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(3px)",
    padding: "16px",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "520px",
    width: "100%",
    boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    animation: "fadeInUp 0.2s ease-out",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  iconBadge: {
    fontSize: "28px",
    lineHeight: 1,
    flexShrink: 0,
  },
  title: {
    margin: "0 0 2px",
    fontSize: "18px",
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#057642",
    fontWeight: "600",
  },
  closeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#666",
    padding: "0 4px",
    lineHeight: 1,
    flexShrink: 0,
  },
  divider: {
    height: "1px",
    background: "#E0DFDC",
    margin: "16px 0",
  },
  postRecap: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "4px 12px",
    background: "#F3F2EF",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "16px",
    alignItems: "center",
  },
  recapLabel: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  recapValue: {
    fontSize: "13px",
    color: "#111",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "8px",
    position: "relative",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },
  textarea: {
    padding: "12px",
    border: "1.5px solid #C9CDD2",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#111",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
    outline: "none",
    transition: "border-color 0.15s",
    minHeight: "120px",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: "11px",
    color: "#999",
  },
  error: {
    background: "#FFF0F0",
    border: "1px solid #FFCDD2",
    color: "#CC1016",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    marginBottom: "8px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  cancelBtn: {
    flex: "0 0 auto",
    padding: "11px 20px",
    border: "1.5px solid #C9CDD2",
    borderRadius: "999px",
    background: "#fff",
    color: "#333",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 1,
    padding: "11px 20px",
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #057642, #0A9660)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(5,118,66,0.35)",
  },
  spinner: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
};