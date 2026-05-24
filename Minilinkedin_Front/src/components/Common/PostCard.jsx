import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PostContext } from "../../context/PostContext";
import ApplyModal from "./Applymodal.jsx";
import ShareModal from "./ShareModal";
import axios from 'axios';
const API_URL = 'http://localhost:8080/api/posts';
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


const POST_TYPE_META = {
  OFFRE_STAGE:   { label: "Offre de stage",  color: "#057642", bg: "#E8F5E9", emoji: "💼" },
  SUJET_THESE:   { label: "Sujet de thèse",  color: "#7B1FA2", bg: "#F3E5F5", emoji: "🎓" },
  PROJET_TUTORE: { label: "Projet tutoré",   color: "#E65100", bg: "#FFF3E0", emoji: "🔧" },
  DEMANDE:       { label: "Demande",         color: "#0277BD", bg: "#E3F2FD", emoji: "📋" },
  PUBLICATION:   { label: "Publication",     color: "#4A4A4A", bg: "#F5F5F5", emoji: "📝" },
};

const getTypeMeta = (post) =>
  POST_TYPE_META[(post?.type || "").toUpperCase()] || POST_TYPE_META.PUBLICATION;

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

// ─── Three-dot Icon ───
const DotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);

// ─── Like Icon ───
const ThumbIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
    fill={filled ? "#0A66C2" : "none"} stroke={filled ? "#0A66C2" : "currentColor"} strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

// ─── Comment Icon ───
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
    fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// ─── Share Icon ───
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
    fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

// ─── Delete Confirmation Modal ───
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={M.overlay} onClick={onCancel}>
      <div style={M.modal} onClick={(e) => e.stopPropagation()}>
        <div style={M.iconWrap}>🗑️</div>
        <h3 style={M.title}>Supprimer ce post ?</h3>
        <p style={M.text}>
          Cette action est irréversible. Le post et tous ses commentaires seront définitivement supprimés.
        </p>
        <div style={M.actions}>
          <button style={M.cancelBtn} onClick={onCancel}>Annuler</button>
          <button style={M.deleteBtn} onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

const M = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#fff", borderRadius: "14px", padding: "28px 28px 24px",
    maxWidth: "400px", width: "90%", textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.15s ease-out",
  },
  iconWrap: { fontSize: "40px", marginBottom: "12px" },
  title: { margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "#000" },
  text: { margin: "0 0 20px", fontSize: "14px", color: "#666", lineHeight: 1.5 },
  actions: { display: "flex", gap: "10px", justifyContent: "center" },
  cancelBtn: {
    flex: 1, padding: "10px", border: "1px solid #C9CDD2", borderRadius: "999px",
    background: "#fff", color: "#333", fontWeight: "600", fontSize: "14px",
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1, padding: "10px", border: "none", borderRadius: "999px",
    background: "#CC1016", color: "#fff", fontWeight: "700", fontSize: "14px",
    cursor: "pointer",
  },
};

// ─── Main PostCard Component ───
export default function PostCard({ post, onRefresh }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { likePost, unlikePost, deleteMyPost, repostPost, deleteRepost } = useContext(PostContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const menuRef = useRef(null);

  // Determine if current user is the post owner
  const currentUserEmail = user?.email || user?.sub || "";
  const authorEmail = post.auteurEmail || "";
  const isOwner = currentUserEmail && authorEmail && currentUserEmail === authorEmail;

  // Role detection
  const role = (user?.role || user?.roleEnum || "").toUpperCase().replace("ROLE_", "");
  const isEtudiant = role === "ETUDIANT";
  const isOffreStage = (post?.type || "").toUpperCase() === "OFFRE_STAGE";

  // Show "Postuler" button only for students on OFFRE_STAGE posts that are NOT theirs
  const canPostuler = isEtudiant && isOffreStage && !isOwner;

  const typeMeta = getTypeMeta(post);
  const title = post.titre || post.title || "Publication";
  const description = post.description || post.contenu || "";
  const authorName = post.auteurNom || "Utilisateur";
  const authorAvatar = post.auteurPhotoUrl || null;
  const authorRole = ""; 
  const initials = authorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const commentCount = post.commentCount ?? post.comment_count ?? (post.comments || []).length;
  const dateStr = post.dateCreation || post.datePublication;

  // À l’intérieur du composant PostCard, après les déclarations
const goToUserProfile = (e) => {
  e.stopPropagation();
  const userId = post.auteurId || post.author?.id;
  if (userId) {
    navigate(`/profile/${userId}`);
  }
};

  // Close menu on outside click
  useEffect(() => {
  const checkRepostStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/${post.id}/repost/status`, { headers: getAuthHeader() });
      setHasReposted(res.data.alreadyReposted);
    } catch (err) {
      console.error(err);
    }
  };
  checkRepostStatus();
}, [post.id]);

  const goToDetail = () => navigate(`/posts/${post.id}`);
  const goToComments = () => navigate(`/posts/${post.id}`);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount(c => Math.max(c - 1, 0));
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount(c => c + 1);
      }
    } catch {}
  };

  const handleRepost = async (e) => {
  e.stopPropagation();
  try {
    if (hasReposted) {
      await deleteRepost(post.id);
      setHasReposted(false);
      alert("Repost retiré de votre profil");
    } else {
      await repostPost(post.id);
      setHasReposted(true);
      alert("Publication republiée sur votre profil !");
    }
    onRefresh?.();
  } catch (err) {
    alert("Erreur lors de l'opération");
  }
};

  const handleShareClick = (e) => {
  e.stopPropagation();
  setShowShareModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMyPost(post.id);
      setShowDeleteModal(false);
      onRefresh?.();
    } catch {
      alert("Erreur lors de la suppression.");
      setDeleting(false);
    }
  };

  const handleApplySuccess = () => {
    setApplied(true);
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => !deleting && setShowDeleteModal(false)}
        />
      )}

      {showApplyModal && (
        <ApplyModal
          post={post}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}

      <article style={S.card}>
        {/* ── Header ── */}
        <div style={S.header}>
          {/* Avatar */}
          <div style={S.avatarWrap} onClick={goToUserProfile}>
  {authorAvatar ? (
    <img src={authorAvatar} alt={authorName} style={S.avatarImg} />
  ) : (
    <div style={S.avatarFallback}>{initials}</div>
  )}
</div>
<div style={S.authorInfo}>
  <div style={S.authorNameRow}>
    <span
      style={{ ...S.authorName, cursor: "pointer" }}
      onClick={goToUserProfile}
    >
      {authorName}
    </span>
    <span
      style={{ ...S.typePill, color: typeMeta.color, background: typeMeta.bg }}
      onClick={(e) => e.stopPropagation()}
    >
      {typeMeta.emoji} {typeMeta.label}
    </span>
  </div>
  {authorRole && <span style={S.authorRole}>{authorRole.replace("ROLE_", "")}</span>}
  {dateStr && <span style={S.postTime}>{timeAgo(dateStr)}</span>}
</div>

          {/* Three-dot menu — only for owner */}
          {isOwner && (
            <div style={S.menuWrap} ref={menuRef}>
              <button
                style={S.dotsBtn}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                aria-label="Options"
              >
                <DotsIcon />
              </button>
              {menuOpen && (
                <div style={S.dropdown}>
                  <button
                    style={S.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setShowDeleteModal(true);
                    }}
                  >
                    <span style={S.dropdownIcon}>🗑️</span>
                    Supprimer ce post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Content (clickable) ── */}
        <div style={S.content} onClick={goToDetail}>
          {title && <h3 style={S.postTitle}>{title}</h3>}
          {description && (
            <p style={S.postDescription}>
              {description.length > 220 ? description.slice(0, 220) + "…" : description}
            </p>
          )}

          {/* Post image */}
          {post.imageUrl && (
            <div style={S.imageWrap}>
              <img src={post.imageUrl} alt="Post" style={S.postImage} />
            </div>
          )}

          {/* Extra meta chips */}
          {/* Extra meta chips */}
{(post.lieu || post.duree || post.typeDemande) && (
  <div style={S.metaRow}>
    {/* Offre de stage */}
    {post.lieu && <span style={S.metaChip}>📍 {post.lieu}</span>}
    {post.duree && <span style={S.metaChip}>⏱ {post.duree}</span>}
    {post.remuneration && <span style={S.metaChip}>💰 {post.remuneration}</span>}
    
    {/* Demande */}
    {post.typeDemande && <span style={S.metaChip}>📌 {post.typeDemande}</span>}
    {post.niveauEtude && <span style={S.metaChip}>🎓 {post.niveauEtude}</span>}
    {post.domaine && <span style={S.metaChip}>🔬 {post.domaine}</span>}
    {post.dureeSouhaitee && <span style={S.metaChip}>⏳ {post.dureeSouhaitee}</span>}
    {post.localisationPreferee && <span style={S.metaChip}>📍 {post.localisationPreferee}</span>}
  </div>
)}
        </div>

        {/* ── Postuler Banner (students only, OFFRE_STAGE only) ── */}
        {canPostuler && (
          <div style={S.postulerBanner}>
            <div style={S.postulerInfo}>
              <span style={S.postulerIcon}>🚀</span>
              <span style={S.postulerText}>
                {applied ? "Candidature envoyée !" : "Intéressé(e) par cette offre ?"}
              </span>
            </div>
            <button
              style={applied ? S.postulerBtnDone : S.postulerBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (!applied) setShowApplyModal(true);
              }}
              disabled={applied}
            >
              {applied ? "✅ Postulé" : "Postuler"}
            </button>
          </div>
        )}

        {showShareModal && (
  <ShareModal
    post={post}
    onClose={() => setShowShareModal(false)}
    onShareSuccess={() => {
      setShareCount(c => c + 1);
      onRefresh?.();
    }}
  />
)}

        {/* ── Stats bar ── */}
        {(likeCount > 0 || commentCount > 0 || shareCount > 0) && (
          <div style={S.statsBar}>
            {likeCount > 0 && (
              <span style={S.statItem}>👍 {likeCount}</span>
            )}
            <div style={S.statsRight}>
              {commentCount > 0 && (
                <button style={S.statLinkBtn} onClick={goToComments}>
                  {commentCount} commentaire{commentCount !== 1 ? "s" : ""}
                </button>
              )}
              {shareCount > 0 && (
                <span style={S.statItem}>{shareCount} partage{shareCount !== 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={S.actionsRow}>
          <button
            style={{ ...S.actionBtn, color: liked ? "#0A66C2" : "#666", fontWeight: liked ? "700" : "500" }}
            onClick={handleLike}
          >
            <ThumbIcon filled={liked} />
            J'aime
          </button>

          <button style={S.actionBtn} onClick={goToComments}>
            <CommentIcon />
            Commenter
            {commentCount > 0 && (
              <span style={S.commentBadge}>{commentCount}</span>
            )}
          </button>

          <button style={S.actionBtn} onClick={handleRepost}>
  <ShareIcon /> {hasReposted ? "Retirer le repost" : "Republier (partager)"}
</button>
        </div>
      </article>
    </>
  );
}

const S = {
  card: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "16px 16px 0",
  },
  avatarWrap: { flexShrink: 0, cursor: "pointer" },
  avatarImg: {
    width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover",
  },
  avatarFallback: {
    width: "48px", height: "48px", borderRadius: "50%",
    background: "linear-gradient(135deg, #0A66C2, #70B5F9)",
    color: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "16px", fontWeight: "700",
  },
  authorInfo: {
    flex: 1, display: "flex", flexDirection: "column",
    gap: "2px", minWidth: 0,
  },
  authorNameRow: {
    display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
  },
  authorName: {
    fontSize: "15px", fontWeight: "700", color: "#000",
  },
  typePill: {
    fontSize: "11px", fontWeight: "600", padding: "2px 8px",
    borderRadius: "999px", whiteSpace: "nowrap",
  },
  authorRole: {
    fontSize: "12px", color: "#666", textTransform: "capitalize",
  },
  postTime: { fontSize: "11px", color: "#999" },

  /* Three-dot menu */
  menuWrap: { position: "relative", flexShrink: 0 },
  dotsBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#666", borderRadius: "50%", padding: "6px",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.15s",
  },
  dropdown: {
    position: "absolute", right: 0, top: "calc(100% + 4px)",
    background: "#fff", border: "1px solid #E0DFDC",
    borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    minWidth: "180px", zIndex: 100, overflow: "hidden",
  },
  dropdownItem: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "12px 16px",
    background: "none", border: "none",
    fontSize: "14px", color: "#CC1016",
    fontWeight: "600", cursor: "pointer", textAlign: "left",
    transition: "background 0.1s",
  },
  dropdownIcon: { fontSize: "16px" },

  /* Content */
  content: { padding: "12px 16px", cursor: "pointer" },
  postTitle: {
    margin: "0 0 8px", fontSize: "16px",
    fontWeight: "700", color: "#000", lineHeight: 1.3,
  },
  postDescription: {
    margin: "0 0 10px", fontSize: "14px",
    color: "#444", lineHeight: 1.5,
  },
  imageWrap: {
    borderRadius: "8px", overflow: "hidden",
    border: "1px solid #E0DFDC", marginBottom: "10px",
  },
  postImage: {
    width: "100%", maxHeight: "300px",
    objectFit: "cover", display: "block",
  },
  metaRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" },
  metaChip: {
    fontSize: "12px", color: "#555",
    background: "#F3F2EF", borderRadius: "999px",
    padding: "3px 10px",
  },

  /* Postuler banner */
  postulerBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 16px 12px",
    background: "linear-gradient(135deg, #E8F5E9, #F1F8F5)",
    border: "1px solid #A5D6A7",
    borderRadius: "10px",
    padding: "10px 14px",
    gap: "10px",
  },
  postulerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  postulerIcon: { fontSize: "18px" },
  postulerText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1B5E20",
  },
  postulerBtn: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #057642, #0A9660)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(5,118,66,0.3)",
    flexShrink: 0,
  },
  postulerBtnDone: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "999px",
    background: "#C8E6C9",
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "default",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  /* Stats bar */
  statsBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "6px 16px",
    borderTop: "1px solid #F3F2EF",
  },
  statsRight: { display: "flex", gap: "12px", alignItems: "center" },
  statItem: { fontSize: "12px", color: "#666" },
  statLinkBtn: {
    background: "none", border: "none",
    fontSize: "12px", color: "#666",
    cursor: "pointer", padding: 0,
    textDecoration: "underline", textDecorationColor: "transparent",
  },

  /* Action buttons */
  actionsRow: {
    display: "flex", borderTop: "1px solid #E0DFDC",
  },
  actionBtn: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", gap: "6px",
    padding: "10px 4px",
    background: "none", border: "none",
    fontSize: "13px", fontWeight: "500",
    color: "#666", cursor: "pointer",
    transition: "background 0.15s",
    position: "relative",
  },
  commentBadge: {
    background: "#0A66C2", color: "#fff",
    fontSize: "10px", fontWeight: "700",
    borderRadius: "999px", padding: "1px 5px",
    minWidth: "16px", textAlign: "center",
  },
};