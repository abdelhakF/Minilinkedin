import axios from 'axios';

const API_URL = 'http://localhost:8080/api/network';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const networkService = {
  // ─────────── INVITATIONS ───────────
  envoyerInvitation: async (request) => {
    // request = { receiverEmail?: string, receiverId?: number }
    const res = await axios.post(`${API_URL}/invite`, request, {
      headers: getAuthHeader(),
    });
    return res.data; // ConnectionInvitation
  },

  accepterInvitation: async (id) => {
    const res = await axios.put(`${API_URL}/invite/${id}/accept`, {}, {
      headers: getAuthHeader(),
    });
    return res.data; // ConnectionInvitation
  },

  refuserInvitation: async (id) => {
    const res = await axios.put(`${API_URL}/invite/${id}/reject`, {}, {
      headers: getAuthHeader(),
    });
    return res.data; // ConnectionInvitation
  },

  annulerInvitation: async (id) => {
    const res = await axios.delete(`${API_URL}/invite/${id}/cancel`, {
      headers: getAuthHeader(),
    });
    return res.data; // string message
  },

  getInvitationsRecues: async () => {
    const res = await axios.get(`${API_URL}/invitations/received`, {
      headers: getAuthHeader(),
    });
    return res.data; // ConnectionInvitation[]
  },

  getInvitationsEnvoyees: async () => {
    const res = await axios.get(`${API_URL}/invitations/sent`, {
      headers: getAuthHeader(),
    });
    return res.data; // ConnectionInvitation[]
  },

  getMesConnexions: async () => {
    const res = await axios.get(`${API_URL}/connections`, {
      headers: getAuthHeader(),
    });
    return res.data; // Utilisateur[]
  },

  // ✅ Ajouté par ton ami·e — suggestions d’utilisateurs
  getSuggestions: async (limit = 6) => {
    const res = await axios.get(`${API_URL}/suggestions`, {
      headers: getAuthHeader(),
      params: { limit },
    });
    return res.data; // SuggestedUserDto[]
  },

  // ─────────── MESSAGERIE ───────────
  envoyerMessage: async (request) => {
    // request = { receiverId: number, messageBody: string }
    const res = await axios.post(`${API_URL}/messages`, request, {
      headers: getAuthHeader(),
    });
    return res.data; // Message
  },

  getBoiteReception: async () => {
    const res = await axios.get(`${API_URL}/messages/inbox`, {
      headers: getAuthHeader(),
    });
    return res.data; // Message[]
  },

  getConversation: async (userId) => {
    const res = await axios.get(`${API_URL}/messages/${userId}`, {
      headers: getAuthHeader(),
    });
    return res.data; // Message[]
  },

  // ─────────── FIL D'ACTUALITÉ & COMMENTAIRES ───────────
  getFilActualite: async () => {
    const res = await axios.get(`${API_URL}/feed`, {
      headers: getAuthHeader(),
    });
    return res.data; // Post[]
  },

  commenter: async (request) => {
    // request = { postId: number, text: string }
    const res = await axios.post(`${API_URL}/comments`, request, {
      headers: getAuthHeader(),
    });
    return res.data; // Comment
  },

  getCommentaires: async (postId) => {
    const res = await axios.get(`${API_URL}/comments/${postId}`, {
      headers: getAuthHeader(),
    });
    return res.data; // Comment[]
  },

  likerCommentaire: async (id) => {
    const res = await axios.put(`${API_URL}/comments/${id}/like`, {}, {
      headers: getAuthHeader(),
    });
    return res.data; // Comment
  },

  supprimerCommentaire: async (id) => {
    const res = await axios.delete(`${API_URL}/comments/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data; // string message
  },
};

export default networkService;