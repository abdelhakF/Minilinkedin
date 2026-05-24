import React from 'react';
import { Check, Clock3, UserRoundPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../../hooks/useNetwork';

const getDisplayName = (user) => user?.nom || user?.name || user?.email || 'Utilisateur';
const getDisplaySubtitle = (user) => user?.headline || user?.role || user?.roleEnum || 'Membre du reseau';
const getAvatarText = (user) => getDisplayName(user).charAt(0).toUpperCase();

const InvitationsReceived = () => {
  const { invitationsRecues, acceptInvitation, rejectInvitation } = useNetwork();
  const navigate = useNavigate();

  const handleOpenProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  return (
    <section className="network-section">
      <div className="network-section__header">
        <div>
          <h2>Invitations recues</h2>
          <p>Validez les bons profils et gardez une file d attente sous controle.</p>
        </div>
        <span className="network-count-pill">{invitationsRecues.length}</span>
      </div>

      {invitationsRecues.length === 0 ? (
        <div className="network-empty-state">
          <div className="network-empty-state__icon">
            <Clock3 size={18} />
          </div>
          <div>
            <strong>Aucune invitation en attente</strong>
            <p>Les nouvelles demandes apparaitront ici.</p>
          </div>
        </div>
      ) : (
        <div className="network-card-grid">
          {invitationsRecues.map((invitation) => {
            const sender = invitation.sender || {};

            return (
              <article key={invitation.id} className="network-person-card">
                <div className="network-person-card__top">
                  <button
                    type="button"
                    className="network-avatar network-avatar--interactive"
                    onClick={() => handleOpenProfile(sender.id)}
                    aria-label={`Voir le profil de ${getDisplayName(sender)}`}
                  >
                    {getAvatarText(sender)}
                  </button>

                  <div className="network-person-card__identity">
                    <div className="network-person-card__title-row">
                      <h3>{getDisplayName(sender)}</h3>
                      <span className="network-badge network-badge--pending">
                        <UserRoundPlus size={12} />
                        Recue
                      </span>
                    </div>
                    <p>{getDisplaySubtitle(sender)}</p>
                    <button
                      type="button"
                      className="network-inline-link"
                      onClick={() => handleOpenProfile(sender.id)}
                    >
                      Voir le profil
                    </button>
                  </div>
                </div>

                <div className="network-card-actions">
                  <button
                    type="button"
                    className="network-button network-button--primary"
                    onClick={() => acceptInvitation(invitation.id)}
                  >
                    <Check size={16} />
                    <span>Accepter</span>
                  </button>

                  <button
                    type="button"
                    className="network-button network-button--secondary"
                    onClick={() => rejectInvitation(invitation.id)}
                  >
                    <X size={16} />
                    <span>Refuser</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default InvitationsReceived;
