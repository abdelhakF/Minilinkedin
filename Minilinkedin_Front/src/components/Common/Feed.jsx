import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { useAuth } from "../../hooks/useAuth";
import { PostContext } from "../../context/PostContext";

const normalizeType = (type) => {
  if (!type) return "";
  switch (type) {
    case "OFFRE_STAGE":   return "stage";
    case "SUJET_THESE":   return "these";
    case "PROJET_TUTORE": return "projet";
    case "DEMANDE":       return "demande";
    case "PUBLICATION":   return "publication";
    default: return type.toLowerCase();
  }
};

const TrendItem = ({ tag, count }) => (
  <div style={S.trendItem}>
    <span style={S.trendTag}>{tag}</span>
    {count && <span style={S.trendCount}>{count} publications</span>}
  </div>
);

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading, fetchAllPosts } = useContext(PostContext);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const role = (user?.role || user?.roleEnum || "").toUpperCase().replace("ROLE_", "");
  const isEtudiant = role === "ETUDIANT";
  const isEnseignant = role === "ENSEIGNANT";

  const roleFilteredPosts = posts.filter(() => true);

  const filteredPosts = filter === "all"
    ? roleFilteredPosts
    : roleFilteredPosts.filter(p => normalizeType(p.type) === filter);

  const filters = [
    { key: "all",         label: "Tout" },
    { key: "stage",       label: "Stages" },
    { key: "these",       label: "Thèses" },
    { key: "projet",      label: "Projets" },
    { key: "publication", label: "Publications" },
    { key: "demande",     label: "Demandes" },
  ];

  const initials = user?.nom
    ? user.nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const userAvatar = user?.photoUrl || user?.avatar || null;

  const quickItems = [
  { icon: "📂", label: "Mes publications", path: "/profile" },
  ...(isEtudiant ? [{ icon: "📨", label: "Mes candidatures", path: "/candidatures" }] : []),
  { icon: "🔔", label: "Notifications", path: "/notifications" },
];

  // ── Right sidebar content based on role ──────────────────────────
  const RightSidebar = () => {
    if (isEtudiant) {
      return (
        <>
          {/* Card candidatures étudiant */}
          <div
            style={{ ...S.sideCard, ...S.sideCardClickable }}
            onClick={() => navigate("/candidatures")}
            title="Voir mes candidatures"
          >
            <div style={S.candidatureCardHeader}>
              <span style={S.candidatureCardIcon}>📨</span>
              <h4 style={S.sideCardTitle}>Mes candidatures</h4>
            </div>
            <p style={S.candidatureCardDesc}>
              Suivez l'état de vos candidatures aux offres de stage et gérez vos dossiers.
            </p>
            <div style={S.candidatureCardCta}>
              Voir mes candidatures →
            </div>
          </div>

          {/* Actualités */}
          <div style={S.sideCard}>
            <h4 style={S.sideCardTitle}>Actualités</h4>
            <p style={S.newsItem}>💡 Améliorer votre profil augmente votre visibilité de 3×</p>
            <p style={S.newsItem}>📢 Nouvelles offres de stage disponibles</p>
            <p style={S.newsItem}>🎓 Sessions de soutenance bientôt disponibles</p>
          </div>
        </>
      );
    }

    if (isEnseignant) {
      return (
        <>
          {/* Card candidatures enseignant */}
          <div
            style={{ ...S.sideCard, ...S.sideCardClickable }}
            onClick={() => navigate("/teacher/candidatures")}
            title="Voir les candidatures reçues"
          >
            <div style={S.candidatureCardHeader}>
              <span style={S.candidatureCardIcon}>📋</span>
              <h4 style={S.sideCardTitle}>Candidatures reçues</h4>
            </div>
            <p style={S.candidatureCardDesc}>
              Consultez et gérez les candidatures des étudiants pour vos offres de stage.
            </p>
            <div style={{ ...S.candidatureCardCta, color: "#7B1FA2" }}>
              Gérer les candidatures →
            </div>
          </div>

          {/* Actualités */}
          <div style={S.sideCard}>
            <h4 style={S.sideCardTitle}>Actualités</h4>
            <p style={S.newsItem}>📊 Gérez vos offres et suivez les candidatures en temps réel</p>
            <p style={S.newsItem}>🎓 Sessions de soutenance bientôt disponibles</p>
            <p style={S.newsItem}>💼 Publiez de nouvelles offres de stage</p>
          </div>
        </>
      );
    }

    // Default (admin or other)
    return (
      <>
        <div style={S.sideCard}>
          <h4 style={S.sideCardTitle}>Tendances sur votre réseau</h4>
          <TrendItem tag="#Stage" count="420" />
          <TrendItem tag="#DéveloppementWeb" count="318" />
          <TrendItem tag="#React" count="215" />
          <TrendItem tag="#IntelligenceArtificielle" count="189" />
          <TrendItem tag="#Emploi" count="152" />
        </div>

        <div style={S.sideCard}>
          <h4 style={S.sideCardTitle}>Actualités</h4>
          <p style={S.newsItem}>💡 Améliorer votre profil augmente votre visibilité de 3×</p>
          <p style={S.newsItem}>📢 Nouvelles offres de stage disponibles</p>
          <p style={S.newsItem}>🎓 Sessions de soutenance bientôt disponibles</p>
        </div>
      </>
    );
  };

  return (
    <div style={S.page}>
      <Navbar />

      <div style={S.container}>
        <div style={S.layout}>

          {/* ── Left Sidebar ── */}
          <aside style={S.leftSidebar}>
            {/* Profile Card */}
            <div
              style={{ ...S.profileCard, cursor: "pointer" }}
              onClick={() => navigate("/profile")}
              title="Voir mon profil"
            >
              <div style={S.profileBanner} />
              <div style={S.profileContent}>
                <p style={S.profileName}>{user?.nom || user?.email || "Mon profil"}</p>
                <p style={S.profileRole}>{(user?.role || user?.roleEnum || "").replace("ROLE_", "")}</p>
                <div style={S.profileDivider} />
                <div style={S.profileStat}>
                  <span style={S.profileStatLabel}>Vos connexions</span>
                  <span style={S.profileStatValue}>Développez votre réseau</span>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div style={S.sideCard}>
              <h4 style={S.sideCardTitle}>Accès rapide</h4>
              {quickItems.map(item => (
                <div
                  key={item.label}
                  style={S.quickItem}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                >
                  <span style={S.quickIcon}>{item.icon}</span>
                  <span style={S.quickLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main Feed ── */}
          <main style={S.main}>
            <CreatePost onCreated={fetchAllPosts} />

            {/* Filter chips */}
            <div style={S.filterRow}>
              {filters.map(f => (
                <button
                  key={f.key}
                  style={{ ...S.filterChip, ...(filter === f.key ? S.filterChipActive : {}) }}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div style={S.skeleton}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={S.empty}>
                <p style={S.emptyText}>Aucune publication dans cette catégorie.</p>
              </div>
            ) : (
              <div style={S.feedList}>
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} onRefresh={fetchAllPosts} />
                ))}
              </div>
            )}
          </main>

          {/* ── Right Sidebar ── */}
          <aside style={S.rightSidebar}>
            <RightSidebar />
          </aside>

        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={SK.card}>
      <div style={SK.row}>
        <div style={SK.circle} />
        <div style={{ flex: 1 }}>
          <div style={{ ...SK.line, width: "60%", marginBottom: "8px" }} />
          <div style={{ ...SK.line, width: "40%", height: "10px" }} />
        </div>
      </div>
      <div style={{ ...SK.line, width: "100%", marginBottom: "8px" }} />
      <div style={{ ...SK.line, width: "80%" }} />
    </div>
  );
}

const SK = {
  card: {
    background: "#fff", border: "1px solid #E0DFDC",
    borderRadius: "10px", padding: "16px",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  row: { display: "flex", gap: "12px", marginBottom: "16px" },
  circle: { width: "48px", height: "48px", borderRadius: "50%", background: "#E0DFDC", flexShrink: 0 },
  line: { height: "14px", borderRadius: "4px", background: "#E0DFDC", marginBottom: "8px" },
};

const S = {
  page: {
    minHeight: "100vh",
    background: "#F3F2EF",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  },
  container: {
    maxWidth: "1128px",
    margin: "0 auto",
    padding: "24px 16px 60px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "225px minmax(0,554px) 300px",
    gap: "24px",
    alignItems: "start",
    justifyContent: "center",
  },
  leftSidebar: {
    position: "sticky",
    top: "72px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  rightSidebar: {
    position: "sticky",
    top: "72px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  main: { display: "flex", flexDirection: "column", gap: "8px" },

  /* Profile card */
  profileCard: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "box-shadow 0.15s, transform 0.1s",
  },
  profileBanner: {
    height: "56px",
    background: "linear-gradient(135deg, #0A66C2 0%, #70B5F9 100%)",
  },
  profileContent: {
    padding: "0 16px 16px",
    textAlign: "center",
  },
  profileAvatarImg: {
    width: "56px", height: "56px", borderRadius: "50%",
    objectFit: "cover", border: "3px solid #fff",
    marginTop: "-28px", display: "block",
    marginLeft: "auto", marginRight: "auto",
    boxSizing: "border-box",
  },
  profileAvatar: {
    width: "56px", height: "56px", borderRadius: "50%",
    background: "linear-gradient(135deg, #0A66C2, #70B5F9)",
    border: "3px solid #fff", marginTop: "-28px",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: "18px", fontWeight: "700",
    marginLeft: "auto", marginRight: "auto",
    boxSizing: "border-box",
  },
  profileName: {
    margin: "8px 0 2px", fontSize: "14px",
    fontWeight: "700", color: "#000",
  },
  profileRole: {
    margin: "0 0 8px", fontSize: "12px",
    color: "#666", textTransform: "capitalize",
  },
  profileDivider: { height: "1px", background: "#E0DFDC", margin: "8px 0" },
  profileStat: { display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" },
  profileStatLabel: { fontSize: "12px", color: "#666" },
  profileStatValue: { fontSize: "12px", color: "#0A66C2", fontWeight: "600" },

  /* Side cards */
  sideCard: {
    background: "#fff", border: "1px solid #E0DFDC",
    borderRadius: "10px", padding: "14px 16px",
  },
  sideCardClickable: {
    cursor: "pointer",
    transition: "box-shadow 0.15s, transform 0.1s",
  },
  sideCardTitle: { margin: "0 0 10px", fontSize: "14px", fontWeight: "700", color: "#000" },

  /* Candidature sidebar card */
  candidatureCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  candidatureCardIcon: {
    fontSize: "22px",
    lineHeight: 1,
  },
  candidatureCardDesc: {
    margin: "0 0 12px",
    fontSize: "13px",
    color: "#555",
    lineHeight: 1.5,
  },
  candidatureCardCta: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0A66C2",
  },

  quickItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "8px 6px", cursor: "pointer",
    borderRadius: "6px", transition: "background 0.12s",
  },
  quickIcon: { fontSize: "18px", lineHeight: 1 },
  quickLabel: { fontSize: "13px", color: "#0A66C2", fontWeight: "500" },

  /* Trends */
  trendItem: { padding: "6px 0", borderBottom: "1px solid #F3F2EF" },
  trendTag: { display: "block", fontSize: "13px", fontWeight: "600", color: "#000" },
  trendCount: { fontSize: "11px", color: "#666" },
  newsItem: { margin: "0 0 10px", fontSize: "13px", color: "#444", lineHeight: 1.4 },

  /* Filters */
  filterRow: {
    display: "flex", gap: "8px", overflowX: "auto",
    scrollbarWidth: "none", paddingBottom: "2px",
  },
  filterChip: {
    background: "#fff", border: "1px solid #C9CDD2",
    borderRadius: "999px", padding: "5px 14px",
    fontSize: "13px", fontWeight: "500", color: "#666",
    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
  },
  filterChipActive: {
    background: "#EEF3F8", border: "1px solid #0A66C2",
    color: "#0A66C2", fontWeight: "700",
  },

  feedList: { display: "flex", flexDirection: "column", gap: "8px" },
  skeleton: { display: "flex", flexDirection: "column", gap: "8px" },
  empty: {
    background: "#fff", border: "1px solid #E0DFDC",
    borderRadius: "10px", padding: "32px 20px", textAlign: "center",
  },
  emptyText: { color: "#666", fontSize: "14px", margin: 0 },
};