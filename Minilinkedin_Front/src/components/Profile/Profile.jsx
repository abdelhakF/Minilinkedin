import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { useNetwork } from '../../hooks/useNetwork';
import ProfileForm from './ProfileForm';
import ProfileHeader from './ProfileHeader';
import ExperienceList from './ExperienceList';
import EducationList from './EducationList';
import SkillList from './SkillList';
import AccomplishmentList from './AccomplishmentList';
import Navbar from '../Common/Navbar';
import RecommendationList from './RecommendationList';
import ProfilePostList from './ProfilePostList';
import './Profile.css';
import AddRecommendationForm from './AddRecommendationForm';

const getConnectionName = (user) => user?.nom || user?.name || user?.email || 'Utilisateur';
const getConnectionSubtitle = (user) => user?.headline || user?.email || 'Profil disponible';
const getConnectionAvatar = (user) => getConnectionName(user).charAt(0).toUpperCase();

const Profile = () => {
  const { userId } = useParams();
  const { profile: myProfile, getProfileById, loading: contextLoading, error, refreshProfile } = useProfile();
  const { connexions } = useNetwork();
  const navigate = useNavigate();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [displayedProfile, setDisplayedProfile] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  // 👇 LOGIQUE CORRIGÉE : Tu es propriétaire si (pas d'id) OU (l'id de l'URL est ton id utilisateur)
  const isOwner = !userId || (myProfile && String(myProfile.utilisateur?.id) === String(userId)); 

  useEffect(() => {
    if (userId) {
      setLocalLoading(true);
      getProfileById(userId).then(data => {
        setDisplayedProfile(data);
        setLocalLoading(false);
      });
    } else {
      setDisplayedProfile(myProfile);
      setLocalLoading(contextLoading);
    }
  }, [userId, myProfile, getProfileById, contextLoading]);

  const profile = displayedProfile;
  const displayName = profile?.utilisateur?.nom || 'Utilisateur inconnu';
  const visibleConnections = connexions.slice(0, 6);
  const connectionCount = connexions.length;

  /* ── Loading ── */
  if (localLoading) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-state-card profile-loading-state">
          <div className="profile-spinner" />
          <p>Chargement de votre profil professionnel…</p>
        </div>
      </div>
    );
  }

  /* ── Create profile (first-time) OR Profile Not Found ── */
  if (!profile) {
    if (isOwner) {
      return (
        <div className="profile-container">
          <Navbar />
          <div className="profile-state-card create-profile-welcome">
            <span className="profile-state-badge">Profil</span>
            <h2>Bienvenue ! Creez votre profil pour commencer</h2>
            <p>Completez vos informations pour etre visible par les recruteurs.</p>
            {error && <div className="profile-error">{error}</div>}
            <ProfileForm onSuccess={() => refreshProfile()} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="profile-container">
          <Navbar />
          <div className="profile-state-card create-profile-welcome">
            <span className="profile-state-badge">Erreur</span>
            <h2>Profil introuvable</h2>
            <p>L'utilisateur que vous recherchez n'a pas encore créé son profil.</p>
          </div>
        </div>
      );
    }
  }

  /* ── Sidebar stats ── */
  const stats = [
    { label: 'Experiences', value: profile.experiences?.length ?? 0 },
    { label: 'Formations', value: profile.educations?.length ?? 0 },
    { label: 'Competences', value: profile.skills?.length ?? 0 },
    { label: 'Realisations', value: profile.accomplishments?.length ?? 0 },
  ];

  return (
    <div className="profile-container">
      <Navbar />

      <div className="profile-layout">

        {/* ── Main column ── */}
        <main className="profile-main">

          {/* Profile header card */}
          <ProfileHeader
            profile={profile}
            // On masque le bouton Modifier si on n'est pas propriétaire
            onEdit={isOwner ? () => setShowEditForm((prev) => !prev) : null}
          />
          
         <ProfilePostList profileUserId={profile.utilisateur?.id} isOwner={isOwner} />
          
          {/* Inline edit form */}
          {isOwner && showEditForm && (
            <ProfileForm
              initialData={profile}
              onSuccess={() => {
                setShowEditForm(false);
                refreshProfile();
              }}
              onCancel={() => setShowEditForm(false)}
            />
          )}

          {/* Section cards : On passe isOwner partout pour masquer les boutons d'ajout/suppression si besoin */}
          <div className="profile-sections">
            <ExperienceList profileId={profile.id} isOwner={isOwner} />
            <EducationList profileId={profile.id} isOwner={isOwner} />
            <SkillList profileId={profile.id} isOwner={isOwner} />
            <AccomplishmentList profileId={profile.id} isOwner={isOwner} />
            <RecommendationList profileId={profile.id} isOwner={isOwner} />
            {!isOwner && (
              <div className="section-card">
                <AddRecommendationForm
                  profileId={profile.id}
                  onSuccess={() => {
                    refreshProfile();
                  }}
                />
              </div>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <aside className="profile-sidebar">
          {/* Identity card */}
          <section className="sidebar-card">
            <h3>Apercu du profil</h3>
            <div className="sidebar-identity">
              <div className="sidebar-avatar">
                {profile.photoUrl
                  ? <img src={profile.photoUrl} alt={displayName} />
                  : <span>{displayName.charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <strong>{displayName}</strong>
                <p>{profile.headline || 'Aucun titre defini pour le moment'}</p>
              </div>
            </div>
            {profile.summary && (
              <p className="sidebar-summary">{profile.summary}</p>
            )}
          </section>

          {/* Quick stats */}
          <section className="sidebar-card">
            <h3>Statistiques</h3>
            <div className="stats-grid">
              {stats.map((item) => (
                <div key={item.label} className="stat-pill">
                  <span className="stat-value">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Relations */}
          {isOwner && (
            <section className="sidebar-card relations-card">
              <div className="relations-header">
                <div>
                  <h3>Relations</h3>
                  <p>{connectionCount} connexion(s)</p>
                </div>
                <span className="relations-pill">Pro</span>
              </div>

              {connectionCount === 0 ? (
                <div className="relations-empty">
                  Vous n'avez pas encore de relations.
                </div>
              ) : (
                <div className="relations-list">
                  {visibleConnections.map((connection) => (
                    <button
                      key={connection.id}
                      type="button"
                      className="relation-item"
                      onClick={() => navigate(`/profile/${connection.id}`)}
                    >
                      <div className="relation-avatar">
                        {getConnectionAvatar(connection)}
                      </div>
                      <div className="relation-info">
                        <span className="relation-name">{getConnectionName(connection)}</span>
                        <span className="relation-meta">{getConnectionSubtitle(connection)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {connectionCount > 0 && (
                <div className="relations-footer">
                  <button
                    type="button"
                    className="relations-link"
                    onClick={() => navigate('/network')}
                  >
                    Voir toutes les relations
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Profile details */}
          <section className="sidebar-card">
            <h3>Informations</h3>
            <div className="sidebar-details">
              <div>
                <span className="detail-label">Nom</span>
                <span className="detail-value">{displayName}</span>
              </div>
              <div>
                <span className="detail-label">Titre</span>
                <span className="detail-value">{profile.headline || '—'}</span>
              </div>
              <div>
                <span className="detail-label">Resume</span>
                <span className="detail-value">
                  {profile.summary ? 'Complete ✓' : 'Non renseigne'}
                </span>
              </div>
              {profile.institution && (
                <div>
                  <span className="detail-label">Etablissement</span>
                  <span className="detail-value">{profile.institution}</span>
                </div>
              )}
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
};

export default Profile;