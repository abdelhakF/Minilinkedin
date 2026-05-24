import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import postService from "../../services/postService";
import ApplyModal from "./Applymodal.jsx";
import { useAuth } from "../../hooks/useAuth";

const POST_TYPE_META = {
  OFFRE_STAGE: { label: "Offre de stage", color: "#057642", bg: "#E8F5E9", emoji: "💼" },
  SUJET_THESE: { label: "Sujet de thèse", color: "#7B1FA2", bg: "#F3E5F5", emoji: "🎓" },
  PROJET_TUTORE: { label: "Projet tutoré", color: "#E65100", bg: "#FFF3E0", emoji: "🔧" },
  DEMANDE: { label: "Demande", color: "#0277BD", bg: "#E3F2FD", emoji: "📋" },
  PUBLICATION: { label: "Publication", color: "#4A4A4A", bg: "#F5F5F5", emoji: "📝" },
};

const getTypeMeta = (post) =>
  POST_TYPE_META[(post?.type || "").toUpperCase()] || POST_TYPE_META.PUBLICATION;

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ─── Icons ───
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill={filled ? "#CC1016" : "none"}
    stroke={filled ? "#CC1016" : "#999"}
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ─── Delete Confirmation Modal ───
function DeleteCommentModal({ onConfirm, onCancel }) {
  return (
    <div style={DM.overlay} onClick={onCancel}>
      <div style={DM.modal} onClick={(e) => e.stopPropagation()}>
        <div style={DM.iconWrap}>💬</div>
        <h3 style={DM.title}>Supprimer ce commentaire ?</h3>
        <p style={DM.text}>Cette action est irréversible.</p>
        <div style={DM.actions}>
          <button style={DM.cancelBtn} onClick={onCancel}>
            Annuler
          </button>
          <button style={DM.deleteBtn} onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

const DM = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    maxWidth: "360px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
  },
  iconWrap: { fontSize: "36px", marginBottom: "10px" },
  title: { margin: "0 0 6px", fontSize: "17px", fontWeight: "700", color: "#000" },
  text: { margin: "0 0 18px", fontSize: "13px", color: "#666" },
  actions: { display: "flex", gap: "10px" },
  cancelBtn: {
    flex: 1,
    padding: "9px",
    border: "1px solid #C9CDD2",
    borderRadius: "999px",
    background: "#fff",
    color: "#333",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    padding: "9px",
    border: "none",
    borderRadius: "999px",
    background: "#CC1016",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
};

// ─── Avatar helper ───
function Avatar({ name, photoUrl, size = 36 }) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "linear-gradient(135deg, #0A66C2, #70B5F9)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: "700",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Single Comment Card ───
function CommentCard({ comment, currentUserEmail, onDelete, onLike, onUnlike }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cName = comment.auteurNom || "Utilisateur";
  const cPhoto = comment.auteurPhotoUrl || null;
  const cEmail = comment.auteurEmail || "";
  const isOwner = currentUserEmail && cEmail && currentUserEmail === cEmail;
  const text = comment?.text || comment?.contenu || "";
  const date = comment?.createdAt || comment?.dateCreation;

  const [isLiked, setIsLiked] = useState(comment.likedByMe || false);
  const [totalLikes, setTotalLikes] = useState(comment.totalLikes || 0);

  const handleLike = async () => {
    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setTotalLikes((prev) => (wasLiked ? Math.max(prev - 1, 0) : prev + 1));

    try {
      if (wasLiked) {
        await onUnlike(comment.id);
      } else {
        await onLike(comment.id);
      }
    } catch (err) {
      console.error(err);
      setIsLiked(wasLiked);
      setTotalLikes(comment.totalLikes || 0);
    }
  };

  return (
    <>
      {confirmDelete && (
        <DeleteCommentModal
          onConfirm={() => {
            onDelete(comment.id);
            setConfirmDelete(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <div style={C.wrap}>
        <Avatar name={cName} photoUrl={cPhoto} size={36} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={C.bubble}>
            <div style={C.bubbleHeader}>
              <span style={C.name}>{cName}</span>
              {date && <span style={C.time}>{timeAgo(date)}</span>}
            </div>
            <p style={C.text}>{text}</p>
          </div>

          <div style={C.actions}>
            <button
              style={{ ...C.actionBtn, color: isLiked ? "#CC1016" : "#999" }}
              onClick={handleLike}
            >
              <HeartIcon filled={isLiked} />
              {totalLikes > 0 && <span style={C.likeCount}>{totalLikes}</span>}
              J'aime
            </button>

            {isOwner && (
              <button
                style={{ ...C.actionBtn, color: "#CC1016" }}
                onClick={() => setConfirmDelete(true)}
              >
                <TrashIcon />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = (user?.role || user?.roleEnum || "").toUpperCase().replace("ROLE_", "");
  const isEtudiant = role === "ETUDIANT";

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const goToUserProfile = () => {
    const userId = post?.auteurId;
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const [data, commentsData] = await Promise.all([
        postService.getPostById(id),
        postService.getCommentaires(id).catch(() => []),
      ]);
      setPost(data);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error("Erreur chargement post :", error);
      setPost(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault?.();
    const trimmed = comment.trim();
    if (!trimmed) return;

    setCommentLoading(true);
    try {
      await postService.addComment(id, trimmed);
      setComment("");
      loadPost();
      window.dispatchEvent(new CustomEvent("commentAdded", { detail: { postId: id } }));
    } catch (error) {
      console.error("Erreur commentaire :", error);
      alert("Erreur lors de l'ajout du commentaire.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(commentId);
      loadPost();
    } catch {
      alert("Erreur lors de la suppression du commentaire.");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await postService.likeComment(commentId);
      const freshComments = await postService.getCommentaires(id);
      setComments(Array.isArray(freshComments) ? freshComments : []);
    } catch (err) {
      console.error("Erreur like commentaire:", err);
      alert("Impossible de liker le commentaire.");
    }
  };

  const handleUnlikeComment = async (commentId) => {
    try {
      await postService.unlikeComment(commentId);
      const freshComments = await postService.getCommentaires(id);
      setComments(Array.isArray(freshComments) ? freshComments : []);
    } catch (err) {
      console.error("Erreur unlike commentaire:", err);
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <Navbar />
        <div style={S.container}>
          <div style={S.loadingState}>
            <div style={S.spinner} />
            <p style={{ color: "#666", marginTop: "12px" }}>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={S.page}>
        <Navbar />
        <div style={S.container}>
          <div style={S.errorState}>
            <p style={{ fontSize: "48px", margin: 0 }}>🔍</p>
            <h3 style={{ color: "#000", marginTop: "8px" }}>Post introuvable</h3>
            <p style={{ color: "#666" }}>Ce post a peut-être été supprimé.</p>
            <button style={S.backBtnLarge} onClick={() => navigate(-1)}>
              Retourner au fil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = post.titre || post.title || "Détail du post";
  const description = post.description || post.contenu || "";
  const authorName = post.auteurNom || "Utilisateur";
  const authorTitle = post.auteur?.titre || post.auteur?.role || "Membre du réseau";
  const authorAvatar = post.auteurPhotoUrl || null;
  const typeMeta = getTypeMeta(post);

  const currentUserEmail = user?.email || user?.sub || "";
  const authorEmail = post.auteurEmail || "";
  const isOwner = currentUserEmail && authorEmail && currentUserEmail === authorEmail;

  const canApply =
    isEtudiant &&
    !isOwner &&
    ["OFFRE_STAGE", "SUJET_THESE", "PROJET_TUTORE"].includes((post?.type || "").toUpperCase());

  const userAvatar = user?.photoUrl || user?.avatar || null;

  return (
    <div style={S.page}>
      <Navbar />

      <div style={S.container}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
          Retour
        </button>

        <div style={S.layout}>
          <div style={S.mainCol}>
            <article style={S.card}>
              <div style={S.authorRow}>
                <div style={{ cursor: "pointer" }} onClick={goToUserProfile}>
                  <Avatar name={authorName} photoUrl={authorAvatar} size={48} />
                </div>

                <div style={S.authorInfo}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ ...S.authorName, cursor: "pointer" }} onClick={goToUserProfile}>
                      {authorName}
                    </span>
                    <span style={{ ...S.typePill, color: typeMeta.color, background: typeMeta.bg }}>
                      {typeMeta.emoji} {typeMeta.label}
                    </span>
                  </div>
                  <span style={S.authorSubtitle}>{authorTitle}</span>
                  <span style={S.postTime}>{timeAgo(post.dateCreation || post.datePublication)}</span>
                </div>
              </div>

              <h1 style={S.postTitle}>{title}</h1>

              {post.imageUrl && (
                <div style={S.imageWrap}>
                  <img src={post.imageUrl} alt="Contenu du post" style={S.postImage} />
                </div>
              )}

              {description && <p style={S.postDescription}>{description}</p>}

              {(post.duree ||
                post.lieu ||
                post.remuneration ||
                post.dateLimite ||
                post.typeDemande ||
                post.niveauEtude ||
                post.domaine ||
                post.dureeSouhaitee ||
                post.localisationPreferee ||
                post.module ||
                post.promotion ||
                post.niveau ||
                post.laboratoire) && (
                <div style={S.metaGrid}>
                  {post.duree && <MetaChip label="Durée" value={post.duree} icon="⏱" />}
                  {post.lieu && <MetaChip label="Lieu" value={post.lieu} icon="📍" />}
                  {post.remuneration && <MetaChip label="Rémunération" value={post.remuneration} icon="💰" />}

                  {post.typeDemande && <MetaChip label="Type de demande" value={post.typeDemande} icon="📌" />}
                  {post.niveauEtude && <MetaChip label="Niveau d'étude" value={post.niveauEtude} icon="🎓" />}
                  {post.domaine && <MetaChip label="Domaine" value={post.domaine} icon="🔬" />}
                  {post.dureeSouhaitee && (
                    <MetaChip label="Durée souhaitée" value={post.dureeSouhaitee} icon="⏳" />
                  )}
                  {post.localisationPreferee && (
                    <MetaChip
                      label="Localisation préférée"
                      value={post.localisationPreferee}
                      icon="📍"
                    />
                  )}

                  {post.module && <MetaChip label="Module" value={post.module} icon="📘" />}
                  {post.promotion && <MetaChip label="Promotion" value={post.promotion} icon="👥" />}

                  {post.niveau && <MetaChip label="Niveau" value={post.niveau} icon="🎓" />}
                  {post.laboratoire && <MetaChip label="Laboratoire" value={post.laboratoire} icon="🔬" />}

                  {post.dateLimite && (
                    <MetaChip
                      label="Date limite"
                      value={new Date(post.dateLimite).toLocaleDateString("fr-FR")}
                      icon="📅"
                    />
                  )}
                </div>
              )}

              <div style={S.statsRow}>
                <span style={S.stat}>👍 {post.likeCount ?? 0} j'aime</span>
                <span style={S.stat}>
                  💬 {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
                </span>
                <span style={S.stat}>
                  🔄 {post.shareCount ?? 0} partage{(post.shareCount ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>

              {canApply && (
                <div style={S.applySection}>
                  <div>
                    <p style={S.applyTitle}>Intéressé(e) par cette offre ?</p>
                    <p style={S.applySubtitle}>Postulez directement depuis votre profil.</p>
                  </div>
                  <button style={S.applyBtn} onClick={() => setShowApplyModal(true)}>
                    Postuler maintenant
                  </button>
                </div>
              )}
            </article>

            <section style={S.card}>
              <h2 style={S.sectionTitle}>
                Commentaires
                <span style={S.commentCount}>{comments.length}</span>
              </h2>

              <div style={S.commentInputRow}>
                <Avatar name={user?.nom || user?.email || "U"} photoUrl={userAvatar} size={40} />
                <div style={S.commentInputWrap}>
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    style={S.commentInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (comment.trim()) handleComment(e);
                      }
                    }}
                  />
                  <button
                    style={{
                      ...S.sendBtn,
                      opacity: !comment.trim() || commentLoading ? 0.4 : 1,
                    }}
                    onClick={handleComment}
                    disabled={!comment.trim() || commentLoading}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>

              <div style={S.commentsList}>
                {comments.length === 0 ? (
                  <p style={S.noComments}>Soyez le premier à commenter !</p>
                ) : (
                  comments.map((c, idx) => (
                    <CommentCard
                      key={c.id || idx}
                      comment={c}
                      currentUserEmail={currentUserEmail}
                      onDelete={handleDeleteComment}
                      onLike={handleLikeComment}
                      onUnlike={handleUnlikeComment}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          <aside style={S.sidebar}>
            {post.dateLimite && (
              <div style={S.sideCard}>
                <h4 style={S.sideTitle}>Date limite</h4>
                <p style={S.deadlineDate}>
                  📅{" "}
                  {new Date(post.dateLimite).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal
          post={post}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => navigate("/candidatures")}
        />
      )}
    </div>
  );
}

function MetaChip({ label, value, icon }) {
  return (
    <div style={MC.chip}>
      <span style={MC.icon}>{icon}</span>
      <div>
        <p style={MC.label}>{label}</p>
        <p style={MC.value}>{value}</p>
      </div>
    </div>
  );
}

const MC = {
  chip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "#F3F2EF",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  icon: { fontSize: "18px", marginTop: "2px" },
  label: {
    margin: 0,
    fontSize: "11px",
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: { margin: "2px 0 0", fontSize: "14px", color: "#000", fontWeight: "500" },
};

const C = {
  wrap: { display: "flex", gap: "10px", alignItems: "flex-start" },
  bubble: {
    background: "#F3F2EF",
    borderRadius: "10px",
    padding: "10px 14px",
    flex: 1,
  },
  bubbleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  name: { fontSize: "13px", fontWeight: "700", color: "#000" },
  time: { fontSize: "11px", color: "#999" },
  text: { margin: 0, fontSize: "14px", color: "#222", lineHeight: 1.4 },
  actions: {
    display: "flex",
    gap: "16px",
    marginTop: "4px",
    paddingLeft: "2px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "2px 0",
  },
  likeCount: { fontSize: "11px", fontWeight: "700" },
};

const S = {
  page: {
    minHeight: "100vh",
    background: "#F3F2EF",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "20px 16px 60px" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    color: "#0A66C2",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "16px",
    padding: "8px 12px",
    borderRadius: "4px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 280px",
    gap: "20px",
    alignItems: "start",
  },
  mainCol: { display: "flex", flexDirection: "column", gap: "12px" },
  card: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  authorRow: { display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" },
  authorInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  authorName: { fontSize: "15px", fontWeight: "700", color: "#000" },
  typePill: { fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px" },
  authorSubtitle: { fontSize: "12px", color: "#666" },
  postTime: { fontSize: "11px", color: "#999" },
  postTitle: { fontSize: "22px", fontWeight: "700", color: "#000", margin: "0 0 16px", lineHeight: 1.3 },
  imageWrap: { borderRadius: "8px", overflow: "hidden", marginBottom: "16px", border: "1px solid #E0DFDC" },
  postImage: { width: "100%", maxHeight: "400px", objectFit: "cover", display: "block" },
  postDescription: { fontSize: "15px", color: "#222", lineHeight: 1.6, margin: "0 0 16px", whiteSpace: "pre-wrap" },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" },
  statsRow: { display: "flex", gap: "20px", paddingTop: "12px", borderTop: "1px solid #E0DFDC", marginTop: "8px" },
  stat: { fontSize: "13px", color: "#666" },
  applySection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#EEF3F8",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  applyTitle: { margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#000" },
  applySubtitle: { margin: 0, fontSize: "13px", color: "#666" },
  applyBtn: {
    background: "#057642",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "10px 22px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: "700",
    color: "#000",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  commentCount: {
    background: "#E0DFDC",
    color: "#666",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "999px",
    padding: "2px 8px",
  },
  commentInputRow: { display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" },
  commentInputWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    border: "1px solid #C9CDD2",
    borderRadius: "999px",
    overflow: "hidden",
    padding: "0 4px 0 16px",
    background: "#fff",
  },
  commentInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    padding: "10px 0",
    color: "#000",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#0A66C2",
    display: "flex",
    alignItems: "center",
    padding: "8px",
    borderRadius: "50%",
  },
  commentsList: { display: "flex", flexDirection: "column", gap: "14px" },
  noComments: { textAlign: "center", color: "#666", fontSize: "14px", padding: "16px 0", margin: 0 },
  sidebar: { position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "12px" },
  sideCard: { background: "#fff", border: "1px solid #E0DFDC", borderRadius: "10px", padding: "16px" },
  sideTitle: { margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#000" },
  deadlineDate: { margin: 0, fontSize: "14px", color: "#333", lineHeight: 1.4, fontWeight: "500" },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #E0DFDC",
    borderTop: "3px solid #0A66C2",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorState: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    padding: "48px",
    textAlign: "center",
    marginTop: "20px",
  },
  backBtnLarge: {
    background: "#0A66C2",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "10px 24px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "16px",
  },
};