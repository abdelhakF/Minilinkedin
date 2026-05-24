import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Check, X, User } from 'lucide-react';
import profileService from '../../services/profileService';
import { useProfile } from '../../hooks/useProfile';

const RecommendationList = ({ profileId, isOwner }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { acceptRecommendation, rejectRecommendation } = useProfile();

  const fetchRecommendations = async () => {
    try {
      const data = await profileService.getRecommendations(profileId);
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Impossible de charger les recommandations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) fetchRecommendations();
  }, [profileId]);

  const handleAccept = async (id) => {
    try {
      await acceptRecommendation(id);
      await fetchRecommendations();
    } catch (err) {
      alert("Erreur lors de l'acceptation");
    }
  };

  const handleReject = async (id) => {
    try {
      if (window.confirm("Voulez-vous vraiment supprimer cette recommandation ?")) {
        await rejectRecommendation(id);
        await fetchRecommendations();
      }
    } catch (err) {
      alert("Erreur lors du rejet");
    }
  };

  if (loading) return <div className="p-4">Chargement des recommandations...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  const displayList = isOwner
    ? recommendations
    : recommendations.filter((r) => r.status === 'ACCEPTED');

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <MessageSquareQuote size={20} className="section-icon" />
          <h2>Recommandations</h2>
        </div>
      </div>

      <div className="section-content">
        {displayList.length === 0 ? (
          <p className="empty-message">Aucune recommandation pour le moment.</p>
        ) : (
          <div className="recommendation-grid">
            {displayList.map((rec) => (
              <div key={rec.id} className={`recommendation-item ${rec.status.toLowerCase()}`}>
                <div className="rec-header">
                  <div className="rec-avatar">
                    <User size={20} />
                  </div>

                  <div className="rec-info">
                    <strong>{rec.recommenderName}</strong>
                    {rec.relationship && (
                      <span className="rec-relation">{rec.relationship}</span>
                    )}
                  </div>

                  {isOwner && rec.status === 'PENDING' && (
                    <div className="rec-actions">
                      <button
                        onClick={() => handleAccept(rec.id)}
                        className="btn-icon accept"
                        title="Accepter"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(rec.id)}
                        className="btn-icon reject"
                        title="Refuser"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="rec-text">"{rec.description}"</p>

                {isOwner && (
                  <div style={{ marginTop: '8px' }}>
                    <span className={`status-badge ${rec.status.toLowerCase()}`}>
                      {rec.status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationList;