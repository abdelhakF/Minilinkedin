import React, { useState, useEffect } from 'react';
import { Plus, PencilLine, Trash2, X } from 'lucide-react';
import profileService from '../../services/profileService';
import { useProfile } from '../../hooks/useProfile';

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const LEVEL_META = {
  BEGINNER: { label: 'Debutant', short: 'Debutant', cls: 'skill-chip-beginner' },
  INTERMEDIATE: { label: 'Intermediaire', short: 'Intermediaire', cls: 'skill-chip-intermediate' },
  ADVANCED: { label: 'Avance', short: 'Avance', cls: 'skill-chip-advanced' },
  EXPERT: { label: 'Expert', short: 'Expert', cls: 'skill-chip-expert' },
};

const emptyForm = { name: '', level: 'BEGINNER' };

const SkillList = ({ profileId, isOwner }) => {
  const { addSkill, updateSkill, removeSkill } = useProfile();
  const [skills, setSkills] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profileId) {
      profileService
        .getSkills(profileId)
        .then(setSkills)
        .catch((err) => setError(err.response?.data || "Echec du chargement des competences"));
    }
  }, [profileId]);

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError('');
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      setError("Le nom de la competence est obligatoire.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addSkill(formData);
      const data = await profileService.getSkills(profileId);
      setSkills(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de l'ajout de la competence");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!formData.name.trim()) {
      setError("Le nom de la competence est obligatoire.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateSkill(editing.id, formData);
      const data = await profileService.getSkills(profileId);
      setSkills(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de la mise a jour de la competence");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette competence ?')) return;
    try {
      await removeSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const handleEdit = (skill) => {
    setEditing(skill);
    setShowForm(true);
    setFormData({
      name: skill.name || '',
      level: skill.level || 'BEGINNER',
    });
    setError('');
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="section-card">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">Competences</h2>

        {isOwner && (
          <button
            type="button"
            className="btn-icon"
            aria-label={showForm && !editing ? 'Fermer le formulaire' : 'Ajouter une competence'}
            title={showForm && !editing ? 'Fermer' : 'Ajouter une competence'}
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditing(null);
              setFormData(emptyForm);
              setError('');
            }}
          >
            {showForm && !editing ? (
              <X size={24} strokeWidth={2.2} />
            ) : (
              <Plus size={24} strokeWidth={2.2} />
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Empty state */}
      {skills.length === 0 && !showForm && (
        <p className="empty-state">Aucune competence ajoutee pour le moment.</p>
      )}

      {/* Chip grid */}
      {skills.length > 0 && (
        <div className="skills-grid">
          {skills.map((skill) => {
            const meta = LEVEL_META[skill.level] || LEVEL_META.BEGINNER;
            return (
              <div key={skill.id} className={`skill-chip ${meta.cls}`}>
                <span className="skill-level-dot" aria-hidden="true" />
                <span style={{ fontWeight: 600 }}>{skill.name}</span>
                <span style={{ opacity: 0.7, fontSize: '0.75em' }}>
                  {meta.short}
                </span>

                {isOwner && (
                  <span className="skill-chip-actions">
                    <button
                      type="button"
                      className="skill-chip-btn"
                      onClick={() => handleEdit(skill)}
                      aria-label="Modifier la competence"
                      title="Modifier"
                    >
                      <PencilLine size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      className="skill-chip-btn danger"
                      onClick={() => handleDelete(skill.id)}
                      aria-label="Supprimer la competence"
                      title="Supprimer"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inline form */}
      {isOwner && showForm && (
        <div className="inline-form">
          <p className="inline-form-title">
            {editing ? 'Modifier la competence' : 'Ajouter une competence'}
          </p>

          <div className="form-row">
            <div className="form-field">
              <label>Nom de la competence *</label>
              <input
                type="text"
                name="name"
                placeholder="ex : Java, React, SQL…"
                value={formData.name}
                onChange={onChange}
              />
            </div>
            <div className="form-field">
              <label>Niveau</label>
              <select name="level" value={formData.level} onChange={onChange}>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {LEVEL_META[lvl].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={editing ? handleUpdate : handleAdd}
              disabled={loading}
            >
              {loading ? 'Enregistrement…' : editing ? 'Mettre a jour' : 'Ajouter'}
            </button>
            <button type="button" className="btn btn-cancel" onClick={resetForm}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillList;