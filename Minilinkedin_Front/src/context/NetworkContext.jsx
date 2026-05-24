import React, { createContext, useCallback, useEffect, useState } from 'react';
import networkService from '../services/networkService';
import { useAuth } from '../hooks/useAuth';

export const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [invitationsRecues, setInvitationsRecues] = useState([]);
  const [invitationsEnvoyees, setInvitationsEnvoyees] = useState([]);
  const [connexions, setConnexions] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [feed, setFeed] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({}); // postId -> Comment[]
  const [suggestions, setSuggestions] = useState([]);        // ✅ ajouté
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastReadByUserId, setLastReadByUserId] = useState({});

  const normalizeError = (err) => {
    return err?.response?.data?.message || err?.response?.data || err.message || 'An error occurred';
  };

  const unreadCountByUser = React.useMemo(() => {
    return inbox.reduce((acc, message) => {
      const senderId = message?.sender?.id;
      if (!senderId) return acc;

      const lastRead = lastReadByUserId[senderId];
      const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
      const messageTime = message?.sentAt ? new Date(message.sentAt).getTime() : 0;

      if (!messageTime || messageTime > lastReadTime) {
        acc[senderId] = (acc[senderId] || 0) + 1;
      }

      return acc;
    }, {});
  }, [inbox, lastReadByUserId]);

  const totalUnreadCount = React.useMemo(() => {
    return Object.values(unreadCountByUser).reduce((sum, value) => sum + value, 0);
  }, [unreadCountByUser]);

  // Charger les données initiales si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([
        networkService.getInvitationsRecues(),
        networkService.getInvitationsEnvoyees(),
        networkService.getMesConnexions(),
        networkService.getBoiteReception(),
        networkService.getFilActualite(),
        networkService.getSuggestions(),        // ✅ ajouté
      ])
        .then(([recues, envoyees, conn, inbox, feedData, suggested]) => {
          setInvitationsRecues(recues);
          setInvitationsEnvoyees(envoyees);
          setConnexions(conn);
          setInbox(inbox);
          setFeed(feedData);
          setSuggestions(suggested);            // ✅ ajouté
        })
        .catch((err) => setError(normalizeError(err)))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  // ───── INVITATIONS ─────
  // ✅ version améliorée (accepte receiverId ou receiverEmail)
  const sendInvitation = useCallback(async (request) => {
    if (!request?.receiverId && !request?.receiverEmail) {
      throw new Error('receiverId ou receiverEmail est requis');
    }

    try {
      const inv = await networkService.envoyerInvitation(request);
      setInvitationsEnvoyees((prev) => [...prev, inv]);
      if (request?.receiverId) {
        setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== request.receiverId));
      }
      return inv;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const acceptInvitation = useCallback(async (id) => {
    try {
      const inv = await networkService.accepterInvitation(id);
      setInvitationsRecues((prev) => prev.filter((i) => i.id !== id));
      // actualiser la liste des connexions
      const conns = await networkService.getMesConnexions();
      setConnexions(conns);
      return inv;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const rejectInvitation = useCallback(async (id) => {
    try {
      const inv = await networkService.refuserInvitation(id);
      setInvitationsRecues((prev) => prev.filter((i) => i.id !== id));
      return inv;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const cancelInvitation = useCallback(async (id) => {
    try {
      await networkService.annulerInvitation(id);
      setInvitationsEnvoyees((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── MESSAGERIE ─────
  const sendMessage = useCallback(async (receiverId, content) => {
    try {
      const msg = await networkService.envoyerMessage({
        receiverId,
        messageBody: content,
      });
      setCurrentConversation((prev) => [...prev, msg]);
      return msg;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const fetchConversation = useCallback(async (userId) => {
    try {
      const messages = await networkService.getConversation(userId);
      setCurrentConversation(messages);
      // ✅ Marquer les messages de cet utilisateur comme lus à l’instant
      setLastReadByUserId(prev => ({
        ...prev,
        [userId]: new Date().toISOString(),
      }));
      return messages;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, [setLastReadByUserId]);

  // ───── FEED & COMMENTS ─────
  const refreshFeed = useCallback(async () => {
    try {
      const data = await networkService.getFilActualite();
      setFeed(data);
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ✅ Nouvelle fonction pour rafraîchir les suggestions
  const refreshSuggestions = useCallback(async () => {
    try {
      const data = await networkService.getSuggestions();
      setSuggestions(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const commentOnPost = useCallback(async (postId, text) => {
    try {
      const comment = await networkService.commenter({ postId, text });
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));
      return comment;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const fetchComments = useCallback(async (postId) => {
    try {
      const comments = await networkService.getCommentaires(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: comments }));
      return comments;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const likeComment = useCallback(async (commentId) => {
    try {
      const updatedComment = await networkService.likerCommentaire(commentId);
      // Mettre à jour le commentaire dans le state
      setCommentsByPost((prev) => {
        const newState = { ...prev };
        for (const [postId, comments] of Object.entries(newState)) {
          const idx = comments.findIndex((c) => c.id === commentId);
          if (idx !== -1) {
            const updatedList = [...comments];
            updatedList[idx] = updatedComment;
            newState[postId] = updatedList;
            break;
          }
        }
        return newState;
      });
      return updatedComment;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await networkService.supprimerCommentaire(commentId);
      // Retirer le commentaire du state
      setCommentsByPost((prev) => {
        const newState = { ...prev };
        for (const [postId, comments] of Object.entries(newState)) {
          const filtered = comments.filter((c) => c.id !== commentId);
          if (filtered.length !== comments.length) {
            newState[postId] = filtered;
            break;
          }
        }
        return newState;
      });
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const value = {
    // Données
    invitationsRecues,
    invitationsEnvoyees,
    connexions,
    inbox,
    currentConversation,
    feed,
    commentsByPost,
    suggestions,            // ✅ ajouté
    lastReadByUserId,
    unreadCountByUser,
    totalUnreadCount,
    loading,
    error,

    // Actions
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,
    sendMessage,
    fetchConversation,
    refreshFeed,
    refreshSuggestions,      // ✅ ajouté
    commentOnPost,
    fetchComments,
    likeComment,
    deleteComment,

    // Utilitaires
    setError,
    setLastReadByUserId,
    setSuggestions,          // ✅ ajouté (pour mise à jour manuelle si besoin)
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};