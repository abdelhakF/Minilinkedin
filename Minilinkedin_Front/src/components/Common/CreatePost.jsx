import React, { useState, useRef, useEffect } from "react";
import postService from "../../services/postService";
import { useAuth } from "../../hooks/useAuth";
import { TAB_CONFIG, TAB_LABELS } from "../../config/postTypes";

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#378FE9">
    <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-.29.71L16 14l-2 2-6-6-4 4V7a1 1 0 011-1h14a1 1 0 011 1v10zm-2-7a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const EMPTY_FORM = {
  titre: "",
  description: "",
  dateLimite: "",
  duree: "",
  lieu: "",
  remuneration: "",
  typeDemande: "STAGE",
  niveauEtude: "",
  domaine: "",
  dureeSouhaitee: "",
  localisationPreferee: "",
  module: "",
  promotion: "",
};

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  // Normalisation du rôle
let rawRole = (user?.role || user?.roleEnum || "").toUpperCase().replace("ROLE_", "");
if (!rawRole) rawRole = "ETUDIANT";

const ROLE_MAP = {
  ETUDIANT: "etudiant",
  ENSEIGNANT: "enseignant",
  ADMIN: "admin",
};

const userRole = ROLE_MAP[rawRole] || "etudiant";
console.log("Rôle détecté :", rawRole, "→", userRole); // debug

// ⚠️ AJOUTER CETTE LIGNE MANQUANTE
const availableTabs = TAB_CONFIG[userRole] || TAB_CONFIG.etudiant;
console.log("Tabs disponibles :", availableTabs); // vérification

  const [type, setType] = useState(availableTabs[0]);

  useEffect(() => {
    setType(availableTabs[0]);
  }, [userRole]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const initials = user?.nom
    ? user.nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setPreview(null);
    setExpanded(false);
    setType(availableTabs[0]);
  };

  const ACTIONS = {
    "publication": postService.createPublication,
    "offre-stage": postService.createOffreStage,
    "demande": postService.createDemande,
    "sujet-these": postService.createSujetThese,
    "projet-tutore": postService.createProjetTutore,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() && !form.description.trim()) return;
    setLoading(true);

    try {
      let imageUrl = "";

      // Upload image to backend if a file was selected
      if (selectedFile) {
        setUploadingImage(true);
        try {
          imageUrl = await postService.uploadImage(selectedFile);
        } catch (uploadErr) {
          console.error("Erreur upload image :", uploadErr);
          alert("Impossible d'uploader l'image. La publication sera créée sans image.");
        } finally {
          setUploadingImage(false);
        }
      }

      const basePayload = {
        titre: form.titre,
        description: form.description,
        dateLimite: form.dateLimite || null,
        imageUrl,
      };

      let payload = basePayload;

      if (type === "offre-stage") {
        payload = { ...payload, duree: form.duree, lieu: form.lieu, remuneration: form.remuneration };
      }
      if (type === "demande") {
        payload = {
          ...payload,
          typeDemande: form.typeDemande,
          niveauEtude: form.niveauEtude,
          domaine: form.domaine,
          dureeSouhaitee: form.dureeSouhaitee,
          localisationPreferee: form.localisationPreferee,
        };
      }
      if (type === "projet-tutore") {
        payload = { ...payload, module: form.module, promotion: form.promotion };
      }

      await ACTIONS[type](payload);

      resetForm();
      if (onCreated) onCreated();
    } catch (error) {
      console.error("Erreur publication :", error);
      alert("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || uploadingImage;
  const submitLabel = uploadingImage
    ? "Upload image..."
    : loading
    ? "Publication..."
    : "Publier";

  return (
    <div style={S.card}>
      {/* Type tabs */}
      <div style={S.tabs}>
        {availableTabs.map(t => (
          <button
            key={t}
            style={{ ...S.tab, ...(type === t ? S.tabActive : {}) }}
            onClick={() => { setType(t); setExpanded(true); }}
            type="button"
          >
            <span>{TAB_LABELS[t].emoji}</span>
            <span style={S.tabLabel}>{TAB_LABELS[t].label}</span>
          </button>
        ))}
      </div>

      <div style={S.divider} />

      {/* Input area */}
      <div style={S.inputRow} onClick={() => setExpanded(true)}>
        <div style={S.avatarCircle}>{initials}</div>
        {!expanded ? (
          <div style={S.placeholder}>
            Partagez une {TAB_LABELS[type]?.label.toLowerCase() || "publication"}...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={S.form}>
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Titre"
              style={S.titleInput}
              autoFocus
            />
            <textarea
              ref={textareaRef}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez votre publication..."
              style={S.textarea}
            />

            {/* Offre de stage fields */}
            {type === "offre-stage" && (
              <div style={S.extraFields}>
                <input name="duree" value={form.duree} onChange={handleChange} placeholder="Durée (ex: 6 mois)" style={S.fieldInput} required />
                <input name="lieu" value={form.lieu} onChange={handleChange} placeholder="Lieu (ex: Paris)" style={S.fieldInput} required />
                <input name="remuneration" value={form.remuneration} onChange={handleChange} placeholder="Rémunération (ex: 1 200 €/mois)" style={S.fieldInput} />
              </div>
            )}

            {/* Demande fields */}
            {type === "demande" && (
              <div style={S.extraFields}>
                <select name="typeDemande" value={form.typeDemande} onChange={handleChange} style={S.fieldInput}>
                  <option value="STAGE">Stage</option>
                  <option value="THESE">Thèse</option>
                  <option value="PROJET_TUTORE">Projet Tutoré</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <input name="niveauEtude" value={form.niveauEtude} onChange={handleChange} placeholder="Niveau d'étude (ex: Bac+5)" style={S.fieldInput} required />
                <input name="domaine" value={form.domaine} onChange={handleChange} placeholder="Domaine (ex: Informatique)" style={S.fieldInput} required />
                <input name="dureeSouhaitee" value={form.dureeSouhaitee} onChange={handleChange} placeholder="Durée souhaitée" style={S.fieldInput} />
                <input name="localisationPreferee" value={form.localisationPreferee} onChange={handleChange} placeholder="Localisation préférée" style={S.fieldInput} />
              </div>
            )}

            {/* Projet tutoré fields */}
            {type === "projet-tutore" && (
              <div style={S.extraFields}>
                <input name="module" value={form.module} onChange={handleChange} placeholder="Module (ex: Développement Web)" style={S.fieldInput} />
                <input name="promotion" value={form.promotion} onChange={handleChange} placeholder="Promotion (ex: M1 2025)" style={S.fieldInput} />
              </div>
            )}

            {/* Date limite */}
            {type !== "publication" && (
              <div style={S.dateRow}>
                <label style={S.dateLabel}>Date limite :</label>
                <input type="date" name="dateLimite" value={form.dateLimite} onChange={handleChange} style={S.dateInput} />
              </div>
            )}

            {/* Image preview */}
            {preview && (
              <div style={S.previewWrap}>
                <img src={preview} alt="Aperçu" style={S.previewImg} />
                <button
                  type="button"
                  style={S.removeImg}
                  onClick={() => { setPreview(null); setSelectedFile(null); }}
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {/* Footer */}
            <div style={S.formFooter}>
              <div style={S.mediaActions}>
                <button type="button" style={S.mediaBtn} onClick={() => fileInputRef.current.click()}>
                  <ImageIcon />
                  <span style={S.mediaBtnLabel}>Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>

              <div style={S.formActions}>
                <button type="button" style={S.cancelBtn} onClick={resetForm}>Annuler</button>
                <button
                  type="submit"
                  style={{
                    ...S.submitBtn,
                    opacity: isSubmitting || (!form.titre.trim() && !form.description.trim()) ? 0.55 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                  disabled={isSubmitting || (!form.titre.trim() && !form.description.trim())}
                >
                  {submitLabel}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const S = {
  card: {
    background: "#fff",
    border: "1px solid #E0DFDC",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "8px",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  },
  tabs: {
    display: "flex",
    overflowX: "auto",
    padding: "0 16px",
    gap: "0",
    scrollbarWidth: "none",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 14px 10px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#666",
    whiteSpace: "nowrap",
    transition: "color 0.15s, border-color 0.15s",
  },
  tabActive: {
    color: "#0A66C2",
    borderBottomColor: "#0A66C2",
    fontWeight: "600",
  },
  tabLabel: { fontSize: "13px" },
  divider: { height: "1px", background: "#E0DFDC" },
  inputRow: {
    display: "flex",
    gap: "10px",
    padding: "12px 16px",
    alignItems: "flex-start",
    cursor: "text",
  },
  avatarCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0A66C2, #70B5F9)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  placeholder: {
    flex: 1,
    height: "48px",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    border: "1px solid #C9CDD2",
    borderRadius: "35px",
    color: "#666",
    fontSize: "14px",
    cursor: "text",
  },
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  titleInput: {
    border: "none",
    borderBottom: "1px solid #E0DFDC",
    fontSize: "17px",
    fontWeight: "600",
    padding: "4px 0",
    outline: "none",
    color: "#000",
    width: "100%",
  },
  textarea: {
    border: "none",
    fontSize: "15px",
    lineHeight: "1.5",
    outline: "none",
    resize: "none",
    minHeight: "100px",
    color: "#000",
    fontFamily: "inherit",
    width: "100%",
  },
  extraFields: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    padding: "12px",
    background: "#F3F2EF",
    borderRadius: "8px",
  },
  fieldInput: {
    border: "1px solid #C9CDD2",
    borderRadius: "4px",
    padding: "8px 10px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    color: "#000",
    background: "#fff",
  },
  dateRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    background: "#F3F2EF",
    borderRadius: "8px",
  },
  dateLabel: { fontSize: "13px", color: "#666", fontWeight: "600" },
  dateInput: {
    border: "1px solid #C9CDD2",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "13px",
    outline: "none",
    color: "#000",
  },
  previewWrap: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #E0DFDC",
  },
  previewImg: {
    width: "100%",
    maxHeight: "280px",
    objectFit: "cover",
    display: "block",
  },
  removeImg: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "10px",
    borderTop: "1px solid #E0DFDC",
  },
  mediaActions: { display: "flex", gap: "4px" },
  mediaBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#666",
  },
  mediaBtnLabel: { fontSize: "14px", fontWeight: "600", color: "#666" },
  formActions: { display: "flex", gap: "8px", alignItems: "center" },
  cancelBtn: {
    background: "none",
    border: "1px solid #C9CDD2",
    color: "#666",
    padding: "6px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  submitBtn: {
    background: "#0A66C2",
    color: "#fff",
    border: "none",
    padding: "6px 20px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "14px",
    transition: "opacity 0.2s",
  },
};