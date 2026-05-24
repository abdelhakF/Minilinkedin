import React, { useState } from 'react';
import { Mail, SendHorizontal } from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';

const InviteForm = () => {
  const { sendInvitation, error, setError, suggestions } = useNetwork();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [sendingSuggestionId, setSendingSuggestionId] = useState(null);

  // ───── Helpers pour l'affichage des suggestions ─────
  const formatRoleLabel = (value) => {
    if (!value || typeof value !== 'string') return '';
    const raw = value.startsWith('ROLE_') ? value.slice('ROLE_'.length) : value;
    return raw
      .trim()
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const getSuggestionSubtitle = (suggestion) => {
    return (
      suggestion?.headline ||
      suggestion?.institution ||
      formatRoleLabel(suggestion?.role) ||
      'Profil suggere'
    );
  };

  const handleSuggestionInvite = async (suggestion) => {
    if (!suggestion?.id || sendingSuggestionId) return;
    setSendingSuggestionId(suggestion.id);
    setSuccess('');
    setError(null);
    try {
      await sendInvitation({ receiverId: suggestion.id });
      setSuccess(`Invitation envoyee a ${suggestion.nom || 'ce compte'}.`);
    } catch (err) {
      void err;
    } finally {
      setSendingSuggestionId(null);
    }
  };

  // ───── Envoi par email ─────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setSuccess('');
    setError(null);

    try {
      await sendInvitation({ receiverEmail: email.trim() });
      setEmail('');
      setSuccess('Invitation envoyee avec succes.');
    } catch (err) {
      void err;
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="network-panel">
      {/* En-tête original */}
      <div className="network-panel__header">
        <div>
          <h2>Inviter une personne</h2>
          <p>Ajoutez un contact par email et gardez un flux d invitation propre.</p>
        </div>
      </div>

      {/* Section Suggestions (ajoutée) */}
      <div className="network-panel__header">
        <div>
          <h2>Comptes suggeres</h2>
          <p>Choisissez un profil a ajouter ou utilisez l email ci dessous.</p>
        </div>
      </div>

      <ul className="network-suggestion-list">
        {suggestions.length === 0 ? (
          <li className="network-suggestion-empty">Aucune suggestion disponible pour le moment.</li>
        ) : (
          suggestions.map((suggestion) => (
            <li key={suggestion.id} className="network-suggestion-card">
              <div className="network-suggestion-card__identity">
                {suggestion.photoUrl ? (
                  <img
                    src={suggestion.photoUrl}
                    alt={suggestion.nom || 'Profil'}
                    className="network-suggestion-card__avatar"
                  />
                ) : (
                  <div className="network-avatar network-suggestion-card__avatar">
                    {getInitials(suggestion.nom || 'Utilisateur')}
                  </div>
                )}
                <div className="network-suggestion-card__meta">
                  <strong className="network-suggestion-card__name">
                    {suggestion.nom || 'Utilisateur'}
                  </strong>
                  <span className="network-suggestion-card__role">
                    {getSuggestionSubtitle(suggestion)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="network-button network-button--secondary"
                onClick={() => handleSuggestionInvite(suggestion)}
                disabled={sendingSuggestionId === suggestion.id}
              >
                {sendingSuggestionId === suggestion.id ? 'Envoi...' : 'Ajouter'}
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Formulaire email (inchangé dans sa structure) */}
      <form className="network-invite-form" onSubmit={handleSubmit}>
        <label className="network-input-group" htmlFor="network-invite-email">
          <span className="network-input-group__label">Email du destinataire</span>
          <div className="network-input-group__field">
            <Mail size={18} />
            <input
              id="network-invite-email"
              type="email"
              placeholder="prenom.nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sending}
            />
          </div>
        </label>

        <button
          type="submit"
          className="network-button network-button--primary"
          disabled={sending}
        >
          <SendHorizontal size={16} />
          <span>{sending ? 'Envoi...' : 'Envoyer l invitation'}</span>
        </button>
      </form>

      {success && <div className="network-alert network-alert--success">{success}</div>}
      {error && <div className="network-alert network-alert--error">{error}</div>}
    </section>
  );
};

export default InviteForm;