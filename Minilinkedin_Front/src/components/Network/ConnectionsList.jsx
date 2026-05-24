import React from 'react';
import { BriefcaseBusiness, UserRound, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../../hooks/useNetwork';

const getDisplayName = (user) => user?.nom || user?.name || user?.email || 'Utilisateur';
const getDisplaySubtitle = (user) => user?.headline || user?.email || 'Profil disponible';
const getRole = (user) => user?.role || user?.roleEnum || 'Membre';
const getAvatarText = (user) => getDisplayName(user).charAt(0).toUpperCase();

const ConnectionsList = () => {
  const { connexions } = useNetwork();
  const navigate = useNavigate();

  return (
    <section className="network-section">
      <div className="network-section__header">
        <div>
          <h2>Mes connexions</h2>
          <p>Accedez rapidement aux profils deja etablis dans votre reseau.</p>
        </div>
        <span className="network-count-pill">{connexions.length}</span>
      </div>

      {connexions.length === 0 ? (
        <div className="network-empty-state">
          <div className="network-empty-state__icon">
            <UsersRound size={18} />
          </div>
          <div>
            <strong>Votre reseau est encore vide</strong>
            <p>Commencez par envoyer quelques invitations ciblees.</p>
          </div>
        </div>
      ) : (
        <div className="network-card-grid">
          {connexions.map((user) => (
            <article key={user.id} className="network-person-card network-person-card--connection">
              <div className="network-person-card__top">
                <button
                  type="button"
                  className="network-avatar network-avatar--interactive"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  aria-label={`Voir le profil de ${getDisplayName(user)}`}
                >
                  {getAvatarText(user)}
                </button>

                <div className="network-person-card__identity">
                  <div className="network-person-card__title-row">
                    <h3>{getDisplayName(user)}</h3>
                    <span className="network-badge network-badge--connected">
                      <UserRound size={12} />
                      Connecte
                    </span>
                  </div>
                  <p>{getDisplaySubtitle(user)}</p>
                </div>
              </div>

              <div className="network-connection-meta">
                <div className="network-card-footer__meta">
                  <BriefcaseBusiness size={14} />
                  <span>{getRole(user)}</span>
                </div>
              </div>

              <div className="network-card-actions">
                <button
                  type="button"
                  className="network-button network-button--secondary"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  Voir le profil
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ConnectionsList;
