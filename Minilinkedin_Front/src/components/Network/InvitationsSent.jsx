import React from 'react';
import { Clock3, MailCheck, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../../hooks/useNetwork';

const STATUS_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptee',
  REJECTED: 'Refusee',
  CANCELED: 'Annulee',
};

const getDisplayName = (user) => user?.nom || user?.name || user?.email || 'Utilisateur';
const getDisplaySubtitle = (user) => user?.headline || user?.role || user?.roleEnum || 'Contact cible';
const getAvatarText = (user) => getDisplayName(user).charAt(0).toUpperCase();

const InvitationsSent = () => {
  const { invitationsEnvoyees, cancelInvitation } = useNetwork();
  const navigate = useNavigate();

  const handleOpenProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  return (
    <section className="network-section">
      <div className="network-section__header">
        <div>
          <h2>Invitations envoyees</h2>
          <p>Suivez vos demandes en cours et nettoyez celles qui ne servent plus.</p>
        </div>
        <span className="network-count-pill">{invitationsEnvoyees.length}</span>
      </div>

      {invitationsEnvoyees.length === 0 ? (
        <div className="network-empty-state">
          <div className="network-empty-state__icon">
            <Send size={18} />
          </div>
          <div>
            <strong>Aucune invitation envoyee</strong>
            <p>Vos demandes de connexion apparaitront ici.</p>
          </div>
        </div>
      ) : (
        <div className="network-card-grid">
          {invitationsEnvoyees.map((invitation) => {
            const receiver = invitation.receiver || {};
            const status = invitation.status || 'PENDING';
            const isPending = status === 'PENDING';

            return (
              <article key={invitation.id} className="network-person-card">
                <div className="network-person-card__top">
                  <button
                    type="button"
                    className="network-avatar network-avatar--interactive"
                    onClick={() => handleOpenProfile(receiver.id)}
                    aria-label={`Voir le profil de ${getDisplayName(receiver)}`}
                  >
                    {getAvatarText(receiver)}
                  </button>

                  <div className="network-person-card__identity">
                    <div className="network-person-card__title-row">
                      <h3>{getDisplayName(receiver)}</h3>
                      <span className={`network-badge network-badge--${status.toLowerCase()}`}>
                        <MailCheck size={12} />
                        {STATUS_LABELS[status] || status}
                      </span>
                    </div>
                    <p>{getDisplaySubtitle(receiver)}</p>
                    <button
                      type="button"
                      className="network-inline-link"
                      onClick={() => handleOpenProfile(receiver.id)}
                    >
                      Voir le profil
                    </button>
                  </div>
                </div>

                <div className="network-card-footer">
                  <div className="network-card-footer__meta">
                    <Clock3 size={14} />
                    <span>{isPending ? 'En attente de reponse' : 'Statut mis a jour'}</span>
                  </div>

                  {isPending && (
                    <button
                      type="button"
                      className="network-button network-button--ghost-danger"
                      onClick={() => cancelInvitation(invitation.id)}
                    >
                      <Trash2 size={16} />
                      <span>Annuler</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default InvitationsSent;
