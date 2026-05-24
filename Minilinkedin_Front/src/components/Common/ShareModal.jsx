// ShareModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

export default function ShareModal({ post, onClose, onShareSuccess }) {
  const [connections, setConnections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingConnections, setFetchingConnections] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFetchingConnections(true);
    axios.get(`${API_BASE_URL}/network/connections`, { headers: getAuthHeader() })
      .then(res => {
        setConnections(res.data);
      })
      .catch(err => {
        console.error('Erreur détaillée:', err.response?.status, err.response?.data);
      })
      .finally(() => setFetchingConnections(false));
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/posts/${post.id}/share`, {
        commentShare: comment,
        destinataireIds: selectedIds
      }, { headers: getAuthHeader() });
      onShareSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (nom, email) => {
    if (nom) return nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return email?.[0]?.toUpperCase() || "?";
  };

  const avatarColors = [
    "linear-gradient(135deg,#0A66C2,#70B5F9)",
    "linear-gradient(135deg,#057642,#5cb85c)",
    "linear-gradient(135deg,#8B5CF6,#C4B5FD)",
    "linear-gradient(135deg,#DC2626,#FCA5A5)",
    "linear-gradient(135deg,#D97706,#FCD34D)",
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .share-conn-item {
          transition: background 0.15s;
        }
        .share-conn-item:hover {
          background: #F3F6FA !important;
        }
        .share-close-btn:hover {
          background: #F3F4F6 !important;
          color: #111 !important;
        }
        .share-cancel-btn:hover {
          background: #F3F4F6 !important;
        }
        .share-submit-btn:not(:disabled):hover {
          background: #004da6 !important;
          box-shadow: 0 4px 16px rgba(10,102,194,0.35) !important;
        }
        .share-submit-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .share-textarea:focus {
          border-color: #0A66C2 !important;
          box-shadow: 0 0 0 3px rgba(10,102,194,0.12) !important;
        }
        .share-search-input:focus {
          border-color: #0A66C2 !important;
          box-shadow: 0 0 0 3px rgba(10,102,194,0.12) !important;
        }
        .share-checkbox:checked {
          background: #0A66C2;
          border-color: #0A66C2;
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeInOverlay 0.2s ease',
        }}
      >
        {/* Modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '16px',
            width: '480px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
            animation: 'slideUpModal 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            overflow: 'hidden',
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #E8EAED',
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111', letterSpacing: '-0.2px' }}>
                Partager la publication
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#666' }}>
                Envoyez à vos connexions
              </p>
            </div>
            <button
              className="share-close-btn"
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#666', transition: 'background 0.15s, color 0.15s',
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* Comment textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Votre message <span style={{ fontWeight: '400', color: '#9CA3AF' }}>(optionnel)</span>
              </label>
              <textarea
                className="share-textarea"
                placeholder="Ajoutez un commentaire à votre partage..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#111',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                  background: '#FAFBFC',
                }}
              />
            </div>

            {/* Recipients section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  Destinataires
                  {selectedIds.length > 0 && (
                    <span style={{
                      marginLeft: '8px',
                      background: '#0A66C2',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '1px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      {selectedIds.length}
                    </span>
                  )}
                </label>
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => setSelectedIds([])}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: '#0A66C2', fontWeight: '600', padding: 0,
                    }}
                  >
                    Tout désélectionner
                  </button>
                )}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#9CA3AF',
                  display: 'flex', alignItems: 'center',
                }}>
                  <SearchIcon />
                </span>
                <input
                  className="share-search-input"
                  type="text"
                  placeholder="Rechercher une connexion..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    paddingLeft: '38px',
                    paddingRight: '14px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#F9FAFB',
                    color: '#111',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Connection list */}
              <div style={{
                maxHeight: '240px',
                overflowY: 'auto',
                borderRadius: '10px',
                border: '1.5px solid #E5E7EB',
              }}>
                {fetchingConnections ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
                    Chargement...
                  </div>
                ) : filteredConnections.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
                    {searchQuery ? 'Aucun résultat trouvé' : 'Aucune connexion disponible'}
                  </div>
                ) : (
                  filteredConnections.map((conn, idx) => {
                    const isSelected = selectedIds.includes(conn.id);
                    return (
                      <div
                        key={conn.id}
                        className="share-conn-item"
                        onClick={() => toggleSelect(conn.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: idx < filteredConnections.length - 1 ? '1px solid #F3F4F6' : 'none',
                          background: isSelected ? '#EEF5FF' : '#fff',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                          background: avatarColors[idx % avatarColors.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '14px', fontWeight: '700',
                        }}>
                          {getInitials(conn.nom, conn.email)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {conn.nom || 'Utilisateur'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {conn.email}
                          </div>
                        </div>

                        {/* Custom checkbox */}
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                          border: isSelected ? '2px solid #0A66C2' : '2px solid #D1D5DB',
                          background: isSelected ? '#0A66C2' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {isSelected && <CheckIcon />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', gap: '10px', justifyContent: 'flex-end',
            padding: '16px 24px',
            borderTop: '1px solid #E8EAED',
            background: '#FAFBFC',
          }}>
            <button
              className="share-cancel-btn"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1.5px solid #D1D5DB',
                borderRadius: '8px',
                padding: '0 20px',
                height: '40px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
            >
              Annuler
            </button>
            <button
              className="share-submit-btn"
              onClick={handleShare}
              disabled={loading || selectedIds.length === 0}
              style={{
                background: '#0A66C2',
                border: 'none',
                borderRadius: '8px',
                padding: '0 22px',
                height: '40px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s, box-shadow 0.15s',
                boxShadow: selectedIds.length > 0 ? '0 2px 8px rgba(10,102,194,0.25)' : 'none',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Envoi...
                </>
              ) : (
                <>
                  <SendIcon />
                  Partager{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}