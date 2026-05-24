import React, { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';

const AddRecommendationForm = ({ profileId, onSuccess }) => {
  const { addRecommendation } = useProfile();
  const [form, setForm] = useState({
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      setError('Le message est obligatoire');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addRecommendation(profileId, form);
      setForm({ description: '' });
      if (onSuccess) onSuccess(); // rafraîchit la liste
    } catch (err) {
      setError("Erreur lors de l'envoi de la recommandation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="recommendation-form">
      <h3>Recommander ce profil</h3>
      {error && <div className="profile-error">{error}</div>}
      <textarea
        name="description"
        placeholder="Votre message de recommandation *"
        value={form.description}
        onChange={handleChange}
        rows={4}
        required
      />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Envoi…' : 'Envoyer la recommandation'}
      </button>
    </form>
  );
};

export default AddRecommendationForm;