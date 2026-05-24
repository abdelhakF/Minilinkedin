import React, { useState, useEffect } from 'react';
import { Plus, PencilLine, Trash2, X, Briefcase, Calendar } from 'lucide-react';
import profileService from '../../services/profileService';
import { useProfile } from '../../hooks/useProfile';

const emptyForm = {
  title: '',
  company: '',
  location: '',
  from: '',
  to: '',
  description: '',
};

const formatDate = (str) => {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const ExperienceList = ({ profileId, isOwner }) => {
  const { addExperience, updateExperience, removeExperience } = useProfile();
  const [experiences, setExperiences] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profileId) {
      profileService
        .getExperiences(profileId)
        .then(setExperiences)
        .catch((err) => setError(err.response?.data || "Echec du chargement des experiences"));
    }
  }, [profileId]);

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError('');
    setShowForm(false);
  };

  const validate = () => {
    if (!formData.title || !formData.company || !formData.from) {
      setError("Le poste, l'entreprise et la date de debut sont obligatoires.");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      await addExperience({ ...formData, to: formData.to || null });
      const data = await profileService.getExperiences(profileId);
      setExperiences(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de l'ajout de l'experience");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing || !validate()) return;
    setError('');
    setLoading(true);
    try {
      await updateExperience(editing.id, { ...formData, to: formData.to || null });
      const data = await profileService.getExperiences(profileId);
      setExperiences(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de la mise a jour de l'experience");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette experience ?')) return;
    try {
      await removeExperience(id);
      setExperiences(experiences.filter((exp) => exp.id !== id));
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const handleEdit = (exp) => {
    setEditing(exp);
    setFormData({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      from: exp.from || '',
      to: exp.to || '',
      description: exp.description || '',
    });
    setShowForm(true);
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
          <Briefcase size={20} className="section-icon" /> Experience
        </h2>

        {isOwner && (
          <button
            type="button"
            className="btn-icon"
            aria-label={showForm && !editing ? 'Fermer le formulaire' : 'Ajouter une experience'}
            title={showForm && !editing ? 'Fermer' : 'Ajouter une experience'}
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

      {experiences.length === 0 && !showForm && (
        <p className="empty-state">Aucune experience ajoutee pour le moment.</p>
      )}

      {experiences.map((exp) => (
        <div key={exp.id} className="section-item">
          <div style={{ display: 'flex', gap: 14, minWidth: 0, flex: 1 }}>
            <div className="item-icon-col">
              <Briefcase size={18} strokeWidth={1.8} />
            </div>

            <div className="item-body">
              <p className="item-title">{exp.title}</p>
              <p className="item-sub">
                {exp.company}
                {exp.location && (
                  <span style={{ color: 'var(--c-text-3)' }}> · {exp.location}</span>
                )}
              </p>
              <p className="item-date">
                <Calendar size={12} strokeWidth={2} />
                {formatDate(exp.from)} — {exp.to ? formatDate(exp.to) : 'Actuel'}
              </p>
              {exp.description && <p className="item-desc">{exp.description}</p>}
            </div>
          </div>

          {isOwner && (
            <div className="item-actions">
              <button
                type="button"
                className="btn-action"
                onClick={() => handleEdit(exp)}
                aria-label="Modifier l'experience"
                title="Modifier"
              >
                <PencilLine size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="btn-action danger"
                onClick={() => handleDelete(exp.id)}
                aria-label="Supprimer l'experience"
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
            {editing ? 'Modifier l\'experience' : 'Ajouter une experience'}
          </p>

          <div className="form-row">
            <div className="form-field">
              <label>Poste *</label>
              <input
                name="title"
                placeholder="ex : Stage Developpeur Java"
                value={formData.title}
                onChange={onChange}
              />
            </div>
            <div className="form-field">
              <label>Entreprise *</label>
              <input
                name="company"
                placeholder="ex : Capgemini"
                value={formData.company}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Lieu</label>
            <input
              name="location"
              placeholder="ex : Paris La Defense"
              value={formData.location}
              onChange={onChange}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Date de debut *</label>
              <input type="date" name="from" value={formData.from} onChange={onChange} />
            </div>
            <div className="form-field">
              <label>
                Date de fin{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  (laisser vide si en cours)
                </span>
              </label>
              <input type="date" name="to" value={formData.to} onChange={onChange} />
            </div>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Decrivez vos missions et reussites…"
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

export default ExperienceList;