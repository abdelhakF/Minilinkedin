import React, { useEffect, useMemo, useState } from 'react';
import { Inbox, MessageSquare, SendHorizontal, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useLocation } from 'react-router-dom';

const getDisplayName = (user) => user?.nom || user?.name || user?.email || 'Utilisateur';
const getDisplaySubtitle = (user) =>
  user?.headline || user?.role || user?.roleEnum || user?.email || 'Connexion active';
const getAvatarText = (user) => getDisplayName(user).charAt(0).toUpperCase();

const formatMessageTime = (value) => {
  if (!value) return 'Maintenant';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Maintenant';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const MessagingPanel = () => {
  const { user } = useAuth();
  const location = useLocation();
  const {
    connexions,
    inbox,
    currentConversation,
    fetchConversation,
    sendMessage,
    setError,
    unreadCountByUser,
    totalUnreadCount,
    setLastReadByUserId,
  } = useNetwork();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const inboxSummaryByUser = useMemo(() => {
    const summary = new Map();

    inbox.forEach((message) => {
      const sender = message?.sender;
      if (!sender?.id) return;

      const previous = summary.get(sender.id);
      const previousTime = previous?.sentAt ? new Date(previous.sentAt).getTime() : 0;
      const nextTime = message?.sentAt ? new Date(message.sentAt).getTime() : 0;

      if (!previous || nextTime >= previousTime) {
        summary.set(sender.id, message);
      }
    });

    return summary;
  }, [inbox]);

  const contacts = useMemo(() => {
    const merged = new Map();

    connexions.forEach((contact) => {
      if (contact?.id) {
        merged.set(contact.id, contact);
      }
    });

    inbox.forEach((message) => {
      const sender = message?.sender;
      if (sender?.id && !merged.has(sender.id)) {
        merged.set(sender.id, sender);
      }
    });

    return Array.from(merged.values()).sort((left, right) => {
      const leftLatest = inboxSummaryByUser.get(left.id)?.sentAt
        ? new Date(inboxSummaryByUser.get(left.id).sentAt).getTime()
        : 0;
      const rightLatest = inboxSummaryByUser.get(right.id)?.sentAt
        ? new Date(inboxSummaryByUser.get(right.id).sentAt).getTime()
        : 0;

      if (rightLatest !== leftLatest) {
        return rightLatest - leftLatest;
      }

      return getDisplayName(left).localeCompare(getDisplayName(right), 'fr', {
        sensitivity: 'base',
      });
    });
  }, [connexions, inbox, inboxSummaryByUser]);

  const preferredUserId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('userId');
    const parsed = raw ? Number(raw) : null;
    return Number.isFinite(parsed) ? parsed : null;
  }, [location.search]);

  const activeConversationUserId = useMemo(() => {
    const selectedStillExists = contacts.some((contact) => contact.id === selectedUserId);
    if (selectedStillExists) {
      return selectedUserId;
    }

    const preferredExists = preferredUserId
      ? contacts.some((contact) => contact.id === preferredUserId)
      : false;
    if (preferredExists) {
      return preferredUserId;
    }

    return contacts[0]?.id ?? null;
  }, [contacts, preferredUserId, selectedUserId]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === activeConversationUserId) || null,
    [activeConversationUserId, contacts]
  );

  const markConversationRead = (userId) => {
    const latestMessage = inboxSummaryByUser.get(userId);
    if (!latestMessage?.sentAt) return;

    setLastReadByUserId((prev) => {
      const previousTime = prev[userId] ? new Date(prev[userId]).getTime() : 0;
      const latestTime = new Date(latestMessage.sentAt).getTime();

      if (!latestTime || latestTime <= previousTime) {
        return prev;
      }

      return { ...prev, [userId]: latestMessage.sentAt };
    });
  };

  useEffect(() => {
    if (!activeConversationUserId) return;
    fetchConversation(activeConversationUserId).catch(() => {});
  }, [activeConversationUserId, fetchConversation]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const messageBody = draft.trim();
    if (!selectedContact || !messageBody || sending) return;

    setSending(true);
    setError(null);

    try {
      await sendMessage(selectedContact.id, messageBody);
      setLastReadByUserId((prev) => ({
        ...prev,
        [selectedContact.id]: new Date().toISOString(),
      }));
      setDraft('');
    } catch (err) {
      void err;
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="network-section network-message-section">
      <div className="network-section__header">
        <div>
          <h2>Messagerie reseau</h2>
          <p>Consultez les messages recus et envoyez une reponse depuis vos connexions.</p>
        </div>
        <span className="network-count-pill">{totalUnreadCount}</span>
      </div>

      {contacts.length === 0 ? (
        <div className="network-empty-state">
          <div className="network-empty-state__icon">
            <Inbox size={18} />
          </div>
          <div>
            <strong>Aucune conversation disponible</strong>
            <p>Acceptez une connexion pour commencer a echanger des messages.</p>
          </div>
        </div>
      ) : (
        <div className="network-message-layout">
          <aside className="network-message-list" aria-label="Conversations">
            {contacts.map((contact) => {
              const latestInboxMessage = inboxSummaryByUser.get(contact.id);
              const unreadCount = unreadCountByUser[contact.id] || 0;
              const isActive = contact.id === activeConversationUserId;

              return (
                <button
                  key={contact.id}
                  type="button"
                  className={`network-message-thread ${isActive ? 'network-message-thread--active' : ''}`}
                  onClick={() => {
                    markConversationRead(contact.id);
                    setSelectedUserId(contact.id);
                  }}
                >
                  <span className="network-avatar">{getAvatarText(contact)}</span>

                  <span className="network-message-thread__body">
                    <span className="network-message-thread__top">
                      <strong>{getDisplayName(contact)}</strong>
                      <span>{formatMessageTime(latestInboxMessage?.sentAt)}</span>
                    </span>

                    <span className="network-message-thread__bottom">
                      <span>{latestInboxMessage?.messageBody || getDisplaySubtitle(contact)}</span>
                      {unreadCount > 0 && (
                        <span className="network-message-thread__count">{unreadCount}</span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="network-message-panel">
            {selectedContact && (
              <>
                <header className="network-message-panel__header">
                  <div className="network-message-panel__identity">
                    <span className="network-avatar">{getAvatarText(selectedContact)}</span>
                    <div>
                      <h3>{getDisplayName(selectedContact)}</h3>
                      <p>{getDisplaySubtitle(selectedContact)}</p>
                    </div>
                  </div>

                  <div className="network-message-panel__meta">
                    <MessageSquare size={16} />
                    <span>{unreadCountByUser[selectedContact.id] || 0} message(s) non lus</span>
                  </div>
                </header>

                <div className="network-message-history">
                  {currentConversation.length === 0 ? (
                    <div className="network-empty-state">
                      <div className="network-empty-state__icon">
                        <UserRound size={18} />
                      </div>
                      <div>
                        <strong>Aucun message pour le moment</strong>
                        <p>Envoyez le premier message a cette connexion.</p>
                      </div>
                    </div>
                  ) : (
                    currentConversation.map((message) => {
                      const isOwnMessage =
                        (user?.id && Number(message?.sender?.id) === Number(user.id)) ||
                        (!user?.id && message?.sender?.email === user?.email);

                      return (
                        <article
                          key={message.id}
                          className={`network-message-bubble ${isOwnMessage ? 'network-message-bubble--own' : ''}`}
                        >
                          <div className="network-message-bubble__meta">
                            <strong>{isOwnMessage ? 'Vous' : getDisplayName(message?.sender)}</strong>
                            <span>{formatMessageTime(message?.sentAt)}</span>
                          </div>
                          <p>{message?.messageBody || 'Message vide'}</p>
                        </article>
                      );
                    })
                  )}
                </div>

                <form className="network-message-composer" onSubmit={handleSubmit}>
                  <label className="network-input-group" htmlFor="network-message-body">
                    <span className="network-input-group__label">Nouveau message</span>
                    <div className="network-message-composer__field">
                      <textarea
                        id="network-message-body"
                        placeholder={`Ecrire a ${getDisplayName(selectedContact)}...`}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={4}
                        disabled={sending}
                      />
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="network-button network-button--primary"
                    disabled={sending || !draft.trim()}
                  >
                    <SendHorizontal size={16} />
                    <span>{sending ? 'Envoi...' : 'Envoyer le message'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MessagingPanel;
