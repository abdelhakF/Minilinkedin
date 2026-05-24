import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePost } from '../../hooks/usePost';
import Navbar from '../Common/Navbar';

// Types de posts autorisés par rôle
const ROLES_PERMISSIONS = {
  ETUDIANT: ['PROJET_TUTORE', 'DEMANDE', 'PUBLICATION'],
  ENSEIGNANT: ['OFFRE_STAGE', 'SUJET_THESE', 'PROJET_TUTORE', 'PUBLICATION'],
  ADMIN: ['OFFRE_STAGE', 'SUJET_THESE', 'PROJET_TUTORE', 'DEMANDE', 'PUBLICATION'],
};

const TYPE_LABELS = {
  OFFRE_STAGE: 'Offre de stage',
  SUJET_THESE: 'Sujet de thèse',
  PROJET_TUTORE: 'Projet tutoré',
  DEMANDE: 'Demande',
  PUBLICATION: 'Publication',
};

const Dashboard = () => {
  const { user } = useAuth();
  const {
    posts,
    loading,
    error,
    fetchAllPosts,
    createOffreStage,
    createSujetThese,
    createProjetTutore,
    createDemande,
    createPublication,
    addComment,
    likePost,
    unlikePost,
    sharePost,
    deleteMyPost,
    setError,
  } = usePost();

  // État du formulaire de création
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('PUBLICATION');
  // Champs communs
  const [formContenu, setFormContenu] = useState('');
  // Champs spécifiques (affichés conditionnellement)
  const [formTitre, setFormTitre] = useState('');
  const [formEntreprise, setFormEntreprise] = useState('');
  const [formDomaine, setFormDomaine] = useState('');

  // Commentaires et partage
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [shareTexts, setShareTexts] = useState({});
  const [showShareInput, setShowShareInput] = useState({});

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const allowedTypes = ROLES_PERMISSIONS[user?.role] || [];

  // Gestion de la création selon le type
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      switch (selectedType) {
        case 'OFFRE_STAGE':
          await createOffreStage({
            titre: formTitre,
            contenu: formContenu,
            entreprise: formEntreprise,
            domaine: formDomaine,
          });
          break;
        case 'SUJET_THESE':
          await createSujetThese({
            titre: formTitre,
            contenu: formContenu,
            domaine: formDomaine,
          });
          break;
        case 'PROJET_TUTORE':
          await createProjetTutore({
            titre: formTitre,
            contenu: formContenu,
          });
          break;
        case 'DEMANDE':
          await createDemande({
            contenu: formContenu,
          });
          break;
        case 'PUBLICATION':
        default:
          await createPublication({
            contenu: formContenu,
          });
          break;
      }
      // Réinitialisation du formulaire
      setShowForm(false);
      setFormContenu('');
      setFormTitre('');
      setFormEntreprise('');
      setFormDomaine('');
      setError(null);
    } catch (err) {
      // géré par le contexte
    }
  };

  // Like / Unlike
  const handleLikeToggle = async (postId, isLiked) => {
    try {
      if (isLiked) await unlikePost(postId);
      else await likePost(postId);
    } catch (err) {
      // géré
    }
  };

  // Commentaire
  const handleComment = async (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    try {
      await addComment(postId, text);
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      // géré
    }
  };

  // Partage
  const handleShare = async (postId) => {
    const commentShare = shareTexts[postId]?.trim() || null;
    try {
      await sharePost(postId, commentShare);
      setShareTexts((prev) => ({ ...prev, [postId]: '' }));
      setShowShareInput((prev) => ({ ...prev, [postId]: false }));
    } catch (err) {
      // géré
    }
  };

  // Reset formulaire
  const resetForm = () => {
    setShowForm(false);
    setSelectedType('PUBLICATION');
    setFormContenu('');
    setFormTitre('');
    setFormEntreprise('');
    setFormDomaine('');
    setError(null);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <p>Chargement du fil d'actualité...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <Navbar />

      <div className="dashboard-content">
        <h1>Welcome to MiniLinkedIn Dashboard</h1>
        <p>
          You are logged in as: <strong>{user?.email}</strong> ({user?.role})
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Bouton pour afficher le formulaire de création */}
        {allowedTypes.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ margin: '20px 0' }}
          >
            {showForm ? 'Annuler' : '➕ Create a Post'}
          </button>
        )}

        {/* Formulaire de création */}
        {showForm && (
          <div className="card" style={{ margin: '20px 0', padding: '15px' }}>
            <h3>Nouveau post</h3>
            <form onSubmit={handleCreatePost}>
              {/* Sélection du type */}
              <div className="form-group">
                <label>Type de post :</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {allowedTypes.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Champs communs */}
              <div className="form-group">
                <label>Contenu :</label>
                <textarea
                  rows="4"
                  value={formContenu}
                  onChange={(e) => setFormContenu(e.target.value)}
                  required
                />
              </div>

              {/* Champs spécifiques selon le type */}
              {['OFFRE_STAGE', 'SUJET_THESE', 'PROJET_TUTORE'].includes(selectedType) && (
                <div className="form-group">
                  <label>Titre :</label>
                  <input
                    type="text"
                    value={formTitre}
                    onChange={(e) => setFormTitre(e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedType === 'OFFRE_STAGE' && (
                <>
                  <div className="form-group">
                    <label>Entreprise :</label>
                    <input
                      type="text"
                      value={formEntreprise}
                      onChange={(e) => setFormEntreprise(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Domaine :</label>
                    <input
                      type="text"
                      value={formDomaine}
                      onChange={(e) => setFormDomaine(e.target.value)}
                    />
                  </div>
                </>
              )}

              {selectedType === 'SUJET_THESE' && (
                <div className="form-group">
                  <label>Domaine :</label>
                  <input
                    type="text"
                    value={formDomaine}
                    onChange={(e) => setFormDomaine(e.target.value)}
                  />
                </div>
              )}

              <button type="submit">Publier</button>
              <button type="button" onClick={resetForm}>Annuler</button>
            </form>
          </div>
        )}

        {/* Feed des posts */}
        <div className="posts-feed">
          {posts.length === 0 && <p>Aucune publication pour le moment.</p>}
          {posts.map((post) => {
            const currentUserId = user?.id;
            const isLiked = post.likes?.some(
              (like) => like.utilisateur?.id === currentUserId
            );
            return (
              <div key={post.id} className="post card" style={{ marginBottom: '15px', padding: '15px' }}>
                <div className="post-header">
                  <span style={{ fontWeight: 'bold' }}>
                    {post.auteur?.nom || 'Utilisateur'}
                  </span>
                  <span style={{ float: 'right', fontSize: '12px' }}>
                    {new Date(post.dateCreation).toLocaleDateString()} -{' '}
                    <em>{TYPE_LABELS[post.type] || post.type}</em>
                  </span>
                </div>

                {post.titre && <h4>{post.titre}</h4>}
                <p>{post.contenu}</p>

                {post.entreprise && <p>🏢 {post.entreprise}</p>}
                {post.domaine && <p>📚 {post.domaine}</p>}

                <div className="post-actions">
                  <button onClick={() => handleLikeToggle(post.id, isLiked)}>
                    {isLiked ? '❤️ Unlike' : '🤍 Like'} ({post.likes?.length || 0})
                  </button>
                  <button onClick={() =>
                    setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                  }>
                    💬 Commentaires ({post.comments?.length || 0})
                  </button>
                  <button onClick={() =>
                    setShowShareInput((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                  }>
                    🔗 Partager
                  </button>
                  {post.auteur?.id === currentUserId && (
                    <button onClick={() => deleteMyPost(post.id)}>🗑️</button>
                  )}
                </div>

                {/* Commentaires */}
                {showComments[post.id] && (
                  <div className="comments-section" style={{ marginTop: '10px' }}>
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="comment">
                        <strong>{comment.auteur?.nom}</strong>: {comment.text}
                      </div>
                    ))}
                    <div>
                      <input
                        type="text"
                        placeholder="Ajouter un commentaire..."
                        value={commentTexts[post.id] || ''}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                      />
                      <button onClick={() => handleComment(post.id)}>Envoyer</button>
                    </div>
                  </div>
                )}

                {/* Partage */}
                {showShareInput[post.id] && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Ajouter un commentaire de partage (optionnel)"
                      value={shareTexts[post.id] || ''}
                      onChange={(e) =>
                        setShareTexts((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                    />
                    <button onClick={() => handleShare(post.id)}>Partager</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;