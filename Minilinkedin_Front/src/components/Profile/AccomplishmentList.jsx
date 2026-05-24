import React, { useState, useEffect } from 'react';
import { Plus, PencilLine, Trash2, X, Award, Calendar } from 'lucide-react';
import profileService from '../../services/profileService';
import { useProfile } from '../../hooks/useProfile';

const emptyForm = { title: '', description: '', date: '' };

const AccomplishmentList = ({ profileId, isOwner }) => {
  const { addAccomplishment, updateAccomplishment, removeAccomplishment } = useProfile();
  const [accomplishments, setAccomplishments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profileId) {
      profileService
        .getAccomplishments(profileId)
        .then(setAccomplishments)
        .catch((err) => setError(err.response?.data || "Echec du chargement des realisations"));
    }
  }, [profileId]);

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError('');
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!formData.title) {
      setError("Le titre est obligatoire.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addAccomplishment(formData);
      const data = await profileService.getAccomplishments(profileId);
      setAccomplishments(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de l'ajout de la realisation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!formData.title) {
      setError("Le titre est obligatoire.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateAccomplishment(editing.id, formData);
      const data = await profileService.getAccomplishments(profileId);
      setAccomplishments(data);
      resetForm();
    } catch (err) {
      setError(err.response?.data || err.message || "Echec de la mise a jour de la realisation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette realisation ?')) return;
    try {
      await removeAccomplishment(id);
      setAccomplishments(accomplishments.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const handleEdit = (acc) => {
    setEditing(acc);
    setShowForm(true);
    setFormData({
      title: acc.title || '',
      description: acc.description || '',
      date: acc.date || '',
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
          <Award size={20} className="section-icon" /> Realisations
        </h2>

        {isOwner && (
          <button
            type="button"
            className="btn-icon"
            aria-label={showForm && !editing ? 'Fermer le formulaire' : 'Ajouter une realisation'}
            title={showForm && !editing ? 'Fermer' : 'Ajouter une realisation'}
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

      {accomplishments.length === 0 && !showForm && (
        <p className="empty-state">Aucune realisation ajoutee pour le moment.</p>
      )}

      {accomplishments.map((acc) => (
        <div key={acc.id} className="section-item">
          <div style={{ display: 'flex', gap: 14, minWidth: 0, flex: 1 }}>
            <div className="item-icon-col">
              <Award size={18} strokeWidth={1.8} />
            </div>
            <div className="item-body">
              <p className="item-title">{acc.title}</p>
              {acc.date && (
                <p className="item-date">
                  <Calendar size={12} strokeWidth={2} />
                  {acc.date}
                </p>
              )}
              {acc.description && <p className="item-desc">{acc.description}</p>}
            </div>
          </div>

          {isOwner && (
            <div className="item-actions">
              <button
                type="button"
                className="btn-action"
                onClick={() => handleEdit(acc)}
                aria-label="Modifier la realisation"
                title="Modifier"
              >
                <PencilLine size={13} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="btn-action danger"
                onClick={() => handleDelete(acc.id)}
                aria-label="Supprimer la realisation"
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
            {editing ? 'Modifier la realisation' : 'Ajouter une realisation'}
          </p>

          <div className="form-field">
            <label>Titre *</label>
            <input
              name="title"
              placeholder="ex : Vainqueur du Hackathon 2024"
              value={formData.title}
              onChange={onChange}
            />
          </div>

          <div className="form-field">
            <label>Date</label>
            <input
              name="date"
              placeholder="ex : Juin 2024"
              value={formData.date}
              onChange={onChange}
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Decrivez cette realisation…"
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

export default AccomplishmentList;