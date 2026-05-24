import React, { useState, useEffect } from 'react';
import { Plus, PencilLine, Trash2, X, GraduationCap, Calendar } from 'lucide-react';
import profileService from '../../services/profileService';
import { useProfile } from '../../hooks/useProfile';

const emptyForm = {
  school: '',
  degree: '',
  fromYear: '',
  toYear: '',
  description: '',
};

const EducationList = ({ profileId, isOwner }) => {
  const { addEducation, updateEducation, removeEducation } = useProfile();
  const [educations, setEducations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profileId) {
      profileService
        .getEducations(profileId)
        .then(setEducations)
        .catch((err) => setError(err.response?.data || "Echec du chargement des formations"));
    }
  }, [profileId]);

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError('');
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!formData.school || !formData.fromYear) {
      setError("L'etablissement et l'annee de debut sont obligatoires.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addEducation(formData);
      const data = await profileService.getEducations(profileId);
      setEducations(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de l'ajout de la formation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!formData.school || !formData.fromYear) {
      setError("L'etablissement et l'annee de debut sont obligatoires.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateEducation(editing.id, formData);
      const data = await profileService.getEducations(profileId);
      setEducations(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de la mise a jour de la formation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    try {
      await removeEducation(id);
      setEducations(educations.filter((edu) => edu.id !== id));
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const handleEdit = (edu) => {
    setEditing(edu);
    setShowForm(true);
    setFormData({
      school: edu.school || '',
      degree: edu.degree || '',
      fromYear: edu.fromYear || '',
      toYear: edu.toYear || '',
      description: edu.description || '',
    });
    setError('');
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">
          <GraduationCap size={20} className="section-icon" /> Formation
        </h2>

        {isOwner && (
          <button
            type="button"
            className="btn-icon"
            aria-label={showForm && !editing ? 'Fermer le formulaire' : 'Ajouter une formation'}
            title={showForm && !editing ? 'Fermer' : 'Ajouter une formation'}
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditing(null);
              setFormData(emptyForm);
              setError('');
            }}
          >
            {showForm && !editing ? (
              <X size={16} strokeWidth={2.2} />
            ) : (
              <Plus size={16} strokeWidth={2.2} />
            )}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {educations.length === 0 && !showForm && (
        <p className="empty-state">Aucune formation ajoutee pour le moment.</p>
      )}

      {educations.map((edu) => (
        <div key={edu.id} className="section-item">
          <div style={{ display: 'flex', gap: 14, minWidth: 0, flex: 1 }}>
            <div className="item-icon-col">
              <GraduationCap size={18} strokeWidth={1.8} />
            </div>

            <div className="item-body">
              {edu.degree && <p className="item-title">{edu.degree}</p>}
              <p className={edu.degree ? 'item-sub' : 'item-title'}>{edu.school}</p>
              <p className="item-date">
                <Calendar size={12} strokeWidth={2} />
                {edu.fromYear} — {edu.toYear || 'En cours'}
              </p>
              {edu.description && <p className="item-desc">{edu.description}</p>}
            </div>
          </div>

          {isOwner && (
            <div className="item-actions">
              <button
                type="button"
                className="btn-action"
                onClick={() => handleEdit(edu)}
                aria-label="Modifier la formation"
                title="Modifier"
              >
                <PencilLine size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="btn-action danger"
                onClick={() => handleDelete(edu.id)}
                aria-label="Supprimer la formation"
                title="Supprimer"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      ))}

      {isOwner && showForm && (
        <div className="inline-form">
          <p className="inline-form-title">
            {editing ? 'Modifier la formation' : 'Ajouter une formation'}
          </p>

          <div className="form-row">
            <div className="form-field">
              <label>Etablissement *</label>
              <input
                name="school"
                placeholder="ex : Sorbonne Universite"
                value={formData.school}
                onChange={onChange}
              />
            </div>
            <div className="form-field">
              <label>Diplome</label>
              <input
                name="degree"
                placeholder="ex : Master 2 Informatique"
                value={formData.degree}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Annee de debut *</label>
              <input
                name="fromYear"
                placeholder="ex : 2024"
                value={formData.fromYear}
                onChange={onChange}
                maxLength={4}
              />
            </div>
            <div className="form-field">
              <label>
                Annee de fin{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  (laisser vide si en cours)
                </span>
              </label>
              <input
                name="toYear"
                placeholder="ex : 2026"
                value={formData.toYear}
                onChange={onChange}
                maxLength={4}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Cours, reussites, sujet de memoire…"
              value={formData.description}
              onChange={onChange}
            />
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

export default EducationList;