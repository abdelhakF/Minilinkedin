import React from 'react';
import { PencilLine, MapPin, CheckCircle2, Clock } from 'lucide-react';

const ProfileHeader = ({ profile, onEdit }) => {
  if (!profile) return null;

  const displayName = profile.utilisateur?.nom || 'Utilisateur inconnu';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  const profileComplete =
    !!profile.headline &&
    !!profile.summary &&
    (profile.experiences?.length ?? 0) > 0;

  return (
    <section className="section-card profile-header-card">
      {/* Cover banner */}
      <div className="profile-cover" />

      {/* Body */}
      <div className="profile-header-body">
        {/* Avatar */}
        <div className="profile-avatar-wrap">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={displayName} className="profile-photo" />
          ) : (
            <div className="profile-photo profile-photo-fallback">{initials || 'U'}</div>
          )}
        </div>

        {/* Name + badge */}
        <div className="profile-name-row">
          <h1 className="profile-name">{displayName}</h1>
          <span className="profile-badge">Ouvert aux opportunites</span>
        </div>

        {/* Headline */}
        <p className="profile-headline">
          {profile.headline || 'Ajoutez un titre pour decrire votre expertise'}
        </p>

        {/* Meta row */}
        <div className="profile-meta">
          {profile.location && (
            <>
              <MapPin size={13} strokeWidth={2} />
              <span>{profile.location}</span>
              <span className="profile-meta-sep" />
            </>
          )}

          {profileComplete ? (
            <>
              <CheckCircle2 size={13} strokeWidth={2} className="profile-status-icon complete" />
              <span className="profile-status complete">Profil complet</span>
            </>
          ) : (
            <>
              <Clock size={13} strokeWidth={2} className="profile-status-icon" />
              <span className="profile-status">Profil incomplet — ajoutez des informations</span>
            </>
          )}
        </div>

        {/* Summary */}
        {profile.summary && (
          <p className="profile-summary">{profile.summary}</p>
        )}

        {/* CTA actions */}
        <div className="profile-actions">
          {/* Visible seulement si onEdit existe */}
          {onEdit && (
            <button className="btn btn-primary" onClick={onEdit} type="button">
              <PencilLine size={15} strokeWidth={2} />
              Modifier le profil
            </button>
          )}

        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;