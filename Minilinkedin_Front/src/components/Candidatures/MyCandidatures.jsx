import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Common/Navbar";
import candidatureService from "../../services/candidatureService";

const STATUT_META = {
  EN_ATTENTE: { label: "En attente", color: "#B45309", bg: "#FEF3C7", icon: "⏳" },
  ACCEPTEE:   { label: "Acceptée",   color: "#065F46", bg: "#D1FAE5", icon: "✅" },
  REFUSEE:    { label: "Refusée",    color: "#991B1B", bg: "#FEE2E2", icon: "❌" },
};

const getStatut = (statut) =>
  STATUT_META[(statut || "EN_ATTENTE").toUpperCase()] || STATUT_META.EN_ATTENTE;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
};

export default function MyCandidatures() {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await candidatureService.getMyCandidatures();
      setCandidatures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement candidatures :", error);
      setCandidatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const filtered =
    filter === "all"
      ? candidatures
      : candidatures.filter(
          (c) => (c.statut || "EN_ATTENTE").toUpperCase() === filter
        );

  const counts = {
    all: candidatures.length,
    EN_ATTENTE: candidatures.filter(c => (c.statut || "EN_ATTENTE") === "EN_ATTENTE").length,
    ACCEPTEE: candidatures.filter(c => c.statut === "ACCEPTEE").length,
    REFUSEE: candidatures.filter(c => c.statut === "REFUSEE").length,
  };

  const tabs = [
    { key: "all",       label: "Toutes",      count: counts.all },
    { key: "EN_ATTENTE", label: "En attente", count: counts.EN_ATTENTE },
    { key: "ACCEPTEE",  label: "Acceptées",   count: counts.ACCEPTEE },
    { key: "REFUSEE",   label: "Refusées",    count: counts.REFUSEE },
  ];

  return (
    <div style={S.page}>
      <Navbar />

      <div style={S.container}>
        {/* Header */}
        <div style={S.pageHeader}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>← Retour</button>
          <div>
            <h2 style={S.title}>📨 Mes candidatures</h2>
            <p style={S.subtitle}>
              {candidatures.length} candidature{candidatures.length !== 1 ? "s" : ""} envoyée{candidatures.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div style={S.summaryRow}>
          <div style={{ ...S.summaryCard, borderTop: "3px solid #B45309" }}>
            <span style={S.summaryNum}>{counts.EN_ATTENTE}</span>
            <span style={S.summaryLabel}>⏳ En attente</span>
          </div>
          <div style={{ ...S.summaryCard, borderTop: "3px solid #065F46" }}>
            <span style={S.summaryNum}>{counts.ACCEPTEE}</span>
            <span style={S.summaryLabel}>✅ Acceptées</span>
          </div>
          <div style={{ ...S.summaryCard, borderTop: "3px solid #991B1B" }}>
            <span style={S.summaryNum}>{counts.REFUSEE}</span>
            <span style={S.summaryLabel}>❌ Refusées</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={S.tabRow}>
          {tabs.map(t => (
            <button
              key={t.key}
              style={{ ...S.tab, ...(filter === t.key ? S.tabActive : {}) }}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{ ...S.tabBadge, ...(filter === t.key ? S.tabBadgeActive : {}) }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>⏳</div>
            <p>Chargement de vos candidatures…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>📭</div>
            <p style={S.emptyText}>Aucune candidature dans cette catégorie.</p>
            <button style={S.emptyBtn} onClick={() => navigate("/feed")}>
              Voir les offres de stage
            </button>
          </div>
        ) : (
          <div style={S.list}>
            {filtered.map((cand) => {
              const meta = getStatut(cand.statut);
              return (
                <div key={cand.id} style={S.card}>
                  {/* Card header */}
                  <div style={S.cardHeader}>
                    <div style={S.postIconWrap}>💼</div>
                    <div style={S.cardHeaderInfo}>
                      <h3 style={S.cardTitle}>
                        {cand?.postTitre || cand?.post?.titre || "Offre de stage"}
                      </h3>
                      {cand?.postDescription && (
                        <p style={S.cardDesc}>
                          {cand.postDescription.length > 120
                            ? cand.postDescription.slice(0, 120) + "…"
                            : cand.postDescription}
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        ...S.statutBadge,
                        color: meta.color,
                        background: meta.bg,
                      }}
                    >
                      {meta.icon} {meta.label}
                    </div>
                  </div>

                  <div style={S.cardDivider} />

                  {/* Card body */}
                  <div style={S.cardBody}>
                    <div style={S.infoItem}>
                      <span style={S.infoLabel}>📅 Date d'envoi</span>
                      <span style={S.infoValue}>{formatDate(cand?.dateDepot)}</span>
                    </div>
                    <div style={S.infoItem}>
                      <span style={S.infoLabel}>✉️ Message</span>
                      <span style={S.infoValue}>
                        {cand?.messageMotivation || cand?.lettreMotivation || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Status message for accepted/refused */}
                  {cand.statut === "ACCEPTEE" && (
                    <div style={S.statusMsg(true)}>
                      🎉 Félicitations ! Votre candidature a été acceptée.
                    </div>
                  )}
                  {cand.statut === "REFUSEE" && (
                    <div style={S.statusMsg(false)}>
                      Votre candidature n'a pas été retenue pour cette offre.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "#F3F2EF",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "24px 16px 60px",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  backBtn: {
    background: "none",
    border: "1px solid #C9CDD2",
    borderRadius: "999px",
    padding: "8px 16px",
    fontSize: "13px",
    color: "#555",
    cursor: "pointer",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  title: {
    margin: "0 0 2px",
    fontSize: "22px",
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#666",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  summaryNum: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#111",
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#555",
    fontWeight: "500",
  },
  tabRow: {
    display: "flex",
    gap: "6px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 16px",
    border: "1px solid #C9CDD2",
    borderRadius: "999px",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#EEF3F8",
    border: "1px solid #0A66C2",
    color: "#0A66C2",
    fontWeight: "700",
  },
  tabBadge: {
    background: "#E0DFDC",
    color: "#555",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    padding: "0 6px",
    minWidth: "18px",
    textAlign: "center",
  },
  tabBadgeActive: {
    background: "#0A66C2",
    color: "#fff",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 16px 12px",
  },
  postIconWrap: {
    fontSize: "28px",
    lineHeight: 1,
    flexShrink: 0,
  },
  cardHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111",
  },
  cardDesc: {
    margin: 0,
    fontSize: "13px",
    color: "#666",
    lineHeight: 1.4,
  },
  statutBadge: {
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },
  cardDivider: {
    height: "1px",
    background: "#F3F2EF",
    margin: "0 16px",
  },
  cardBody: {
    padding: "12px 16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoItem: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: "6px",
    alignItems: "baseline",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  infoValue: {
    fontSize: "14px",
    color: "#333",
    lineHeight: 1.5,
  },
  statusMsg: (accepted) => ({
    margin: "0 16px 14px",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    background: accepted ? "#D1FAE5" : "#FEE2E2",
    color: accepted ? "#065F46" : "#991B1B",
  }),
  empty: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "12px",
    padding: "48px 24px",
    textAlign: "center",
    color: "#666",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyText: {
    margin: "0 0 16px",
    fontSize: "15px",
  },
  emptyBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "999px",
    background: "#0A66C2",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
};