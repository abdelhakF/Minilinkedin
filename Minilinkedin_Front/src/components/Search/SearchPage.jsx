import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import Navbar from '../Common/Navbar';
import './SearchPage.css';

// --- Composant utilitaire pour l'affichage des cartes de résultats ---
const ResultCard = ({ item, type }) => {
  const navigate = useNavigate();

  // Extraction générique des données
  const id = item.id || item._id;
  const title = item.name || item.title || item.nom || item.intitule || 'Résultat sans titre';
  const subtitle = item.role || item.headline || item.categorie || '';
  const description = item.description || item.content || item.bio || item.resume || '';
  const author = item.author || item.createur || null; 
  const associatedUsers = item.users || item.utilisateurs || []; 

  // 👇 NOUVELLE LOGIQUE : Redirection intelligente et robuste au clic
  const handleCardClick = (e) => {
    // Évite de déclencher le clic de la carte si on clique sur un sous-élément
    if (e.target.closest('.li-nested-user')) return;

    // Liste des mots-clés qui indiquent que le résultat est un utilisateur
    const userTypes = ['users', 'enseignants', 'utilisateurs', 'user', 'profil'];
    
    // Vérification croisée (par le filtre actif, par le type renvoyé par l'API, ou par la présence d'un rôle)
    const isUser = 
      userTypes.includes(type?.toLowerCase()) || 
      userTypes.includes(item.type?.toLowerCase()) ||
      item.role !== undefined;

    if (isUser) {
      navigate(`/profile/${id}`); // Redirige bien vers le profil
    } else if (type === 'posts' || item.type === 'post') {
      navigate(`/post/${id}`);
    } else if (type === 'skills' || type === 'competences' || item.type === 'skill') {
      navigate(`/skills/${id || title}`);
    } else {
      // Sécurité : si on ne sait vraiment pas ce que c'est, on redirige vers le profil par défaut
      navigate(`/profile/${id}`);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="li-result-card clickable" onClick={handleCardClick}>
      <div className="li-card-avatar">
        {title.charAt(0).toUpperCase()}
      </div>
      
      <div className="li-card-content">
        <h3 className="li-card-title">{title}</h3>
        {subtitle && <p className="li-card-subtitle">{subtitle}</p>}
        {description && <p className="li-card-description">{description}</p>}
        
        {item.skills && Array.isArray(item.skills) && (
          <div className="li-card-tags">
            {item.skills.map((skill, idx) => (
              <span key={idx} className="li-tag">{skill}</span>
            ))}
          </div>
        )}

        {author && (
          <div 
            className="li-nested-user" 
            onClick={() => handleUserClick(author.id || author._id)}
          >
            <div className="li-nested-avatar">{author.name ? author.name.charAt(0) : 'A'}</div>
            <div className="li-nested-info">
              <span className="li-nested-name">{author.name || 'Auteur inconnu'}</span>
              <span className="li-nested-role">Auteur du post</span>
            </div>
          </div>
        )}

        {associatedUsers.length > 0 && (
          <div className="li-associated-users-section">
            <p className="li-associated-title">Utilisateurs avec cette compétence :</p>
            <div className="li-associated-users-list">
              {associatedUsers.slice(0, 5).map((user, idx) => (
                <div 
                  key={idx} 
                  className="li-nested-user mini"
                  onClick={() => handleUserClick(user.id || user._id)}
                >
                  <div className="li-nested-avatar mini">{user.name ? user.name.charAt(0) : 'U'}</div>
                  <span className="li-nested-name">{user.name}</span>
                </div>
              ))}
              {associatedUsers.length > 5 && <span className="li-more-users">+{associatedUsers.length - 5}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Composant Principal ---
const SearchPage = () => {
  const {
    results,
    loading,
    error,
    rechercheGlobale,
    rechercherParNom,
    rechercherEnseignants,
    rechercherPosts,
    rechercherCompetences
  } = useSearch();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('global'); 

  const filtres = [
    { id: 'global', label: 'Top Résultats (Intelligent)' },
    { id: 'users', label: 'Personnes' },
    { id: 'enseignants', label: 'Enseignants' },
    { id: 'posts', label: 'Posts' },
    { id: 'skills', label: 'Compétences' }
  ];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    switch (type) {
      case 'global':
        await rechercheGlobale(query);
        break;
      case 'users':
        await rechercherParNom(query);
        break;
      case 'enseignants':
        await rechercherEnseignants(query);
        break;
      case 'posts':
        await rechercherPosts({ q: query });
        break;
      case 'skills':
        await rechercherCompetences(query);
        break;
      default:
        break;
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (query.trim() && !loading) {
      setTimeout(() => {
        document.getElementById('search-submit-btn').click();
      }, 0);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (Array.isArray(results)) {
      if (results.length === 0) return <p className="li-no-results">Aucun résultat trouvé pour "{query}".</p>;
      return results.map((item, index) => <ResultCard key={index} item={item} type={type} />);
    }

    if (typeof results === 'object') {
      const keys = Object.keys(results).filter(key => Array.isArray(results[key]) && results[key].length > 0);
      
      if (keys.length === 0) return <p className="li-no-results">Aucun résultat trouvé.</p>;

      return keys.map(key => (
        <div key={key} className="li-result-section">
          <div className="li-section-header">
            <h3 className="li-section-title">
              {key === 'users' ? 'Personnes' : key === 'posts' ? 'Posts' : key === 'skills' ? 'Compétences' : key.toUpperCase()}
            </h3>
            <button className="li-see-all-btn" onClick={() => handleTypeChange(key)}>
              Voir tout
            </button>
          </div>
          <div className="li-section-list">
            {results[key].slice(0, 3).map((item, index) => (
              <ResultCard key={index} item={item} type={key} />
            ))}
          </div>
        </div>
      ));
    }

    return null;
  };

  return (
    <div className="li-page-container">
      <Navbar />
      
      <div className="li-main-layout">
        <aside className="li-sidebar">
          <div className="li-sidebar-card">
            <h2 className="li-sidebar-title">Filtres</h2>
            <ul className="li-filter-list">
              {filtres.map(filtre => (
                <li key={filtre.id}>
                  <button 
                    className={`li-filter-btn ${type === filtre.id ? 'active' : ''}`}
                    onClick={() => handleTypeChange(filtre.id)}
                  >
                    {filtre.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="li-feed">
          <div className="li-search-box-card">
            <form className="li-search-form" onSubmit={handleSearch}>
              <div className="li-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="li-search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="li-search-input"
                  placeholder={`Rechercher ${type === 'global' ? 'des personnes, posts, compétences...' : 'des ' + filtres.find(f => f.id === type)?.label.toLowerCase()}`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
              </div>
              <button id="search-submit-btn" type="submit" className="li-btn-primary" disabled={loading}>
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>
          </div>

          {error && <div className="li-error-message">{error}</div>}
          
          {loading && (
             <div className="li-loading-skeleton">
               <div className="li-skeleton-card"></div>
               <div className="li-skeleton-card"></div>
               <div className="li-skeleton-card"></div>
             </div>
          )}

          {!loading && results && (
            <div className="li-results-container">
              {renderResults()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;