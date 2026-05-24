import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminService = {
  // ===================== STATS =====================
  getDashboardStats: async () => {
    const res = await axios.get(`${API_URL}/stats`, {
      headers: getAuthHeader(),
    });
    return res.data; // DashboardStatsDTO étendu
  },

  // ===================== USERS =====================
  getAllUsers: async () => {
    const res = await axios.get(`${API_URL}/users`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await axios.get(`${API_URL}/users/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await axios.delete(`${API_URL}/users/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  banUser: async (id) => {
    const res = await axios.put(`${API_URL}/users/${id}/ban`, {}, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  unbanUser: async (id) => {
    const res = await axios.put(`${API_URL}/users/${id}/unban`, {}, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  validateEnseignant: async (id) => {
    const res = await axios.put(`${API_URL}/enseignants/${id}/validate`, {}, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== POSTS =====================
  getAllPosts: async () => {
    const res = await axios.get(`${API_URL}/posts`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  deletePost: async (id) => {
    const res = await axios.delete(`${API_URL}/posts/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== SIGNALEMENTS =====================
  getSignalements: async (status = null) => {
    const res = await axios.get(`${API_URL}/signalements`, {
      headers: getAuthHeader(),
      params: status ? { status } : {},
    });
    return res.data; // List<Signalement>
  },

  resolveSignalement: async (id, deletePost = false) => {
    const res = await axios.put(
      `${API_URL}/signalements/${id}/resolve`,
      {},
      {
        headers: getAuthHeader(),
        params: { deletePost },
      }
    );
    return res.data;
  },

  rejectSignalement: async (id) => {
    const res = await axios.put(
      `${API_URL}/signalements/${id}/reject`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  deleteSignalement: async (id) => {
    const res = await axios.delete(`${API_URL}/signalements/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== ÉTABLISSEMENTS =====================
  getEtablissements: async () => {
    const res = await axios.get(`${API_URL}/etablissements`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  createEtablissement: async (data) => {
    const res = await axios.post(`${API_URL}/etablissements`, data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  updateEtablissement: async (id, data) => {
    const res = await axios.put(`${API_URL}/etablissements/${id}`, data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  deleteEtablissement: async (id) => {
    const res = await axios.delete(`${API_URL}/etablissements/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== DOMAINES =====================
  getDomaines: async () => {
    const res = await axios.get(`${API_URL}/domaines`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  createDomaine: async (data) => {
    const res = await axios.post(`${API_URL}/domaines`, data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  updateDomaine: async (id, data) => {
    const res = await axios.put(`${API_URL}/domaines/${id}`, data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  deleteDomaine: async (id) => {
    const res = await axios.delete(`${API_URL}/domaines/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};

export default adminService;
