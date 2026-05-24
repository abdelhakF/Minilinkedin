import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Common/Navbar";
import postService from "../../services/postService";
import candidatureService from "../../services/candidatureService";
import { useAuth } from "../../hooks/useAuth";
// import './App.css';

export default function PostCandidatures() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    postService.getPostById(postId)
      .then(data => setPost(data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Veuillez écrire une lettre de motivation.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await candidatureService.postuler(postId, message.trim());
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Erreur lors de l'envoi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={S.loading}>Chargement...</div>;
  if (!post) return <div style={S.error}>Offre introuvable.</div>;

  if (success) {
    return (
      <div style={S.page}>
        <Navbar />
        <div style={S.container}>
          <div style={S.successCard}>
            <div style={S.icon}>✅</div>
            <h2>Candidature envoyée !</h2>
            <p>Votre candidature pour <strong>{post.titre || post.title}</strong> a bien été enregistrée.</p>
            <div style={S.actions}>
              <button onClick={() => navigate("/candidatures")}>Voir mes candidatures</button>
              <button onClick={() => navigate("/feed")}>Retour au fil</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.container}>
        <div style={S.card}>
          <h1>Postuler à : {post.titre || post.title}</h1>
          <div style={S.meta}>
            <span>{post.auteur?.nom}</span>
            {post.lieu && <span>📍 {post.lieu}</span>}
            {post.duree && <span>⏱ {post.duree}</span>}
          </div>
          <form onSubmit={handleSubmit}>
            <label>Lettre de motivation *</label>
            <textarea
              rows="6"
              placeholder="Expliquez pourquoi vous êtes le bon candidat..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
            {error && <div style={S.errorMsg}>{error}</div>}
            <div style={S.buttonRow}>
              <button type="button" onClick={() => navigate(-1)}>Annuler</button>
              <button type="submit" disabled={submitting}>
                {submitting ? "Envoi..." : "Envoyer ma candidature"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { background: "#F3F2EF", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "24px 16px" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  meta: { display: "flex", gap: "12px", marginBottom: "20px", color: "#666", fontSize: "13px" },
  textarea: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "8px" },
  buttonRow: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" },
  errorMsg: { color: "#CC1016", marginTop: "8px", fontSize: "13px" },
  successCard: { textAlign: "center", background: "#fff", borderRadius: "12px", padding: "40px" },
  icon: { fontSize: "48px", marginBottom: "16px" },
  actions: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" },
  loading: { textAlign: "center", marginTop: "40px" },
  error: { textAlign: "center", marginTop: "40px", color: "#CC1016" }
};