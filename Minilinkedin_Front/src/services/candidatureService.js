import axios from "axios";

const API_BASE_URL = 'http://localhost:8080/api';
const BASE = `${API_BASE_URL}/candidatures`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const candidatureService = {
  postuler: async (postId, messageMotivation) => {
    const payload = { messageMotivation };
    const response = await axios.post(
      `${BASE}?postId=${postId}`,
      payload,
      { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  getMyCandidatures: async () => {
    const response = await axios.get(`${BASE}/me`, { headers: getAuthHeader() });
    return response.data;
  },

  getTeacherCandidatures: async () => {
    const response = await axios.get(`${BASE}/teacher`, { headers: getAuthHeader() });
    return response.data;
  },

  updateStatut: async (candidatureId, statut) => {
    // ✅ URL correcte : /candidatures/{id}/statut
    const response = await axios.patch(
      `${BASE}/${candidatureId}/statut?statut=${statut}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getByPost: async (postId) => {
    const response = await axios.get(`${BASE}/post/${postId}`, { headers: getAuthHeader() });
    return response.data;
  },
};

export default candidatureService;