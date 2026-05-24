// src/components/Candidatures/TeacherCandidatures.jsx
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

// Group candidatures by postTitre
const groupByPost = (candidatures) => {
  const map = {};
  candidatures.forEach((c) => {
    const key = c.postId || c.post?.id || "unknown";
    if (!map[key]) {
      map[key] = {
        postId: key,
        postTitre: c.postTitre || c.post?.titre || "Offre de stage",
        postDescription: c.postDescription || c.post?.description || "",
        candidatures: [],
      };
    }
    map[key].candidatures.push(c);
  });
  return Object.values(map);
};

export default function TeacherCandidatures() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null); // candidatureId being updated
  const [toast, setToast] = useState(null); // { msg, type }

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await candidatureService.getTeacherCandidatures();
      const arr = Array.isArray(data) ? data : [];
      setGroups(groupByPost(arr));
    } catch (error) {
      console.error("Erreur chargement candidatures enseignant :", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatut = async (candidatureId, statut) => {
    setActionLoading(candidatureId);
    try {
      await candidatureService.updateStatut(candidatureId, statut);
      // Update local state
      setGroups(prev =>
        prev.map(group => ({
          ...group,
          candidatures: group.candidatures.map(c =>
            c.id === candidatureId ? { ...c, statut } : c
          ),
        }))
      );
      showToast(
        statut === "ACCEPTEE"
          ? "✅ Candidature acceptée avec succès !"
          : "❌ Candidature refusée.",
        statut === "ACCEPTEE" ? "success" : "error"
      );
    } catch (err) {
      showToast("Erreur lors de la mise à jour.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Compute totals
  const allCandidatures = groups.flatMap(g => g.candidatures);
  const counts = {
    all: allCandidatures.length,
    EN_ATTENTE: allCandidatures.filter(c => (c.statut || "EN_ATTENTE") === "EN_ATTENTE").length,
    ACCEPTEE: allCandidatures.filter(c => c.statut === "ACCEPTEE").length,
    REFUSEE: allCandidatures.filter(c => c.statut === "REFUSEE").length,
  };

  // Filter groups
  const filteredGroups =
    filter === "all"
      ? groups
      : groups
          .map(g => ({
            ...g,
            candidatures: g.candidatures.filter(
              c => (c.statut || "EN_ATTENTE").toUpperCase() === filter
            ),
          }))
          .filter(g => g.candidatures.length > 0);

  const tabs = [
    { key: "all",        label: "Toutes",     count: counts.all },
    { key: "EN_ATTENTE", label: "En attente", count: counts.EN_ATTENTE },
    { key: "ACCEPTEE",   label: "Acceptées",  count: counts.ACCEPTEE },
    { key: "REFUSEE",    label: "Refusées",   count: counts.REFUSEE },
  ];

  return (
    <div style={S.page}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, background: toast.type === "success" ? "#065F46" : "#991B1B" }}>
          {toast.msg}
        </div>
      )}

      <div style={S.container}>
        {/* Header */}
        <div style={S.pageHeader}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>← Retour</button>
          <div>
            <h2 style={S.title}>📋 Candidatures reçues</h2>
            <p style={S.subtitle}>
              {allCandidatures.length} candidature{allCandidatures.length !== 1 ? "s" : ""} reçue{allCandidatures.length !== 1 ? "s" : ""} sur {groups.length} offre{groups.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div style={S.summaryRow}>
          <div style={{ ...S.summaryCard, borderTop: "3px solid #0A66C2" }}>
            <span style={S.summaryNum}>{counts.all}</span>
            <span style={S.summaryLabel}>📋 Total</span>
          </div>
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

        {/* Tabs */}
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
            <p>Chargement des candidatures…</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>📭</div>
            <p style={S.emptyText}>
              {filter === "all"
                ? "Aucune candidature reçue pour vos offres de stage."
                : "Aucune candidature dans cette catégorie."}
            </p>
          </div>
        ) : (
          <div style={S.groupList}>
            {filteredGroups.map((group) => (
              <div key={group.postId} style={S.groupCard}>
                {/* Group header: Post info */}
                <div style={S.groupHeader}>
                  <div style={S.groupIconWrap}>💼</div>
                  <div style={S.groupHeaderInfo}>
                    <h3 style={S.groupTitle}>{group.postTitre}</h3>
                    {group.postDescription && (
                      <p style={S.groupDesc}>
                        {group.postDescription.length > 100
                          ? group.postDescription.slice(0, 100) + "…"
                          : group.postDescription}
                      </p>
                    )}
                  </div>
                  <span style={S.groupCount}>
                    {group.candidatures.length} candidat{group.candidatures.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Candidatures list */}
                <div style={S.candidatureList}>
                  {group.candidatures.map((cand, idx) => {
                    const meta = getStatut(cand.statut);
                    const isPending = (cand.statut || "EN_ATTENTE") === "EN_ATTENTE";
                    const isUpdating = actionLoading === cand.id;

                    return (
                      <div
                        key={cand.id}
                        style={{
                          ...S.candidatureItem,
                          ...(idx < group.candidatures.length - 1 ? S.candidatureItemBorder : {}),
                        }}
                      >
                        {/* Etudiant info */}
                        <div style={S.etudiantRow}>
                          <div style={S.etudiantAvatar}>
                            {(cand.etudiantNom || "E").slice(0, 1).toUpperCase()}
                          </div>
                          <div style={S.etudiantInfo}>
                            <span style={S.etudiantNom}>
                              {cand.etudiantNom || "Étudiant"}
                            </span>
                            <span style={S.etudiantEmail}>
                              {cand.etudiantEmail || ""}
                            </span>
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

                        {/* Message */}
                        {cand.messageMotivation && (
                          <div style={S.messageBlock}>
                            <span style={S.messageLabel}>✉️ Message de motivation</span>
                            <p style={S.messageText}>{cand.messageMotivation}</p>
                          </div>
                        )}

                        {/* Date + Actions */}
                        <div style={S.itemFooter}>
                          <span style={S.dateText}>
                            📅 Envoyé le {formatDate(cand.dateDepot)}
                          </span>

                          {isPending && (
                            <div style={S.actionBtns}>
                              <button
                                style={S.refuserBtn}
                                onClick={() => handleStatut(cand.id, "REFUSEE")}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "…" : "✗ Refuser"}
                              </button>
                              <button
                                style={S.accepterBtn}
                                onClick={() => handleStatut(cand.id, "ACCEPTEE")}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "…" : "✓ Accepter"}
                              </button>
                            </div>
                          )}

                          {!isPending && (
                            <span style={{ ...S.finalStatut, color: meta.color }}>
                              Décision prise : {meta.label}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
    maxWidth: "860px",
    margin: "0 auto",
    padding: "24px 16px 60px",
  },
  toast: {
    position: "fixed",
    top: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    padding: "12px 24px",
    borderRadius: "999px",
    zIndex: 9999,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    whiteSpace: "nowrap",
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
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    padding: "14px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  summaryNum: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111",
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
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
  groupList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  groupCard: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  groupHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    background: "linear-gradient(135deg, #F0F7FF, #EEF3F8)",
    borderBottom: "1px solid #E0DFDC",
  },
  groupIconWrap: {
    fontSize: "26px",
    lineHeight: 1,
    flexShrink: 0,
  },
  groupHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },
  groupTitle: {
    margin: "0 0 4px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0A66C2",
  },
  groupDesc: {
    margin: 0,
    fontSize: "13px",
    color: "#555",
    lineHeight: 1.4,
  },
  groupCount: {
    flexShrink: 0,
    background: "#0A66C2",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "999px",
  },
  candidatureList: {
    padding: "0",
  },
  candidatureItem: {
    padding: "16px",
  },
  candidatureItemBorder: {
    borderBottom: "1px solid #F3F2EF",
  },
  etudiantRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  etudiantAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0A66C2, #70B5F9)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    flexShrink: 0,
  },
  etudiantInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  etudiantNom: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111",
  },
  etudiantEmail: {
    fontSize: "12px",
    color: "#666",
  },
  statutBadge: {
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },
  messageBlock: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "10px",
  },
  messageLabel: {
    display: "block",
    fontSize: "11px",
    color: "#888",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "4px",
  },
  messageText: {
    margin: 0,
    fontSize: "14px",
    color: "#333",
    lineHeight: 1.5,
  },
  itemFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  dateText: {
    fontSize: "12px",
    color: "#888",
  },
  actionBtns: {
    display: "flex",
    gap: "8px",
  },
  refuserBtn: {
    padding: "8px 18px",
    border: "1.5px solid #DC2626",
    borderRadius: "999px",
    background: "#fff",
    color: "#DC2626",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  accepterBtn: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #057642, #0A9660)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(5,118,66,0.3)",
    transition: "all 0.15s",
  },
  finalStatut: {
    fontSize: "13px",
    fontWeight: "600",
  },
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
    margin: 0,
    fontSize: "15px",
  },
};