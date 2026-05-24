import axios from "axios";

const API_URL = "http://localhost:8080/api/posts";
const NETWORK_URL = "http://localhost:8080/api/network";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const postService = {
  // ===================== CRÉATION =====================
  createOffreStage: async (offre) => {
    const res = await axios.post(`${API_URL}/offre-stage`, offre, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  createSujetThese: async (sujet) => {
    const res = await axios.post(`${API_URL}/sujet-these`, sujet, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  createProjetTutore: async (projet) => {
    const res = await axios.post(`${API_URL}/projet-tutore`, projet, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  createDemande: async (demande) => {
    const res = await axios.post(`${API_URL}/demande`, demande, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  createPublication: async (publication) => {
    const res = await axios.post(`${API_URL}/publication`, publication, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== IMAGE UPLOAD =====================
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_URL}/upload-image`, formData, {
      headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  },

  // ===================== INTERACTIONS =====================
  likePost: async (postId) => {
    const res = await axios.post(
      `${API_URL}/${postId}/like`,
      {},
      { headers: getAuthHeader() },
    );
    return res.data;
  },
  unlikePost: async (postId) => {
    const res = await axios.delete(`${API_URL}/${postId}/like`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  addComment: async (postId, text) => {
    const res = await axios.post(`${API_URL}/${postId}/comment`, text, {
      headers: { ...getAuthHeader(), "Content-Type": "text/plain" },
    });
    return res.data;
  },
  sharePost: async (postId, commentShare, destinataireIds) => {
    const payload = { commentShare, destinataireIds };
    const res = await axios.post(`${API_URL}/${postId}/share`, payload, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== COMMENTAIRE INTERACTIONS =====================
  likeComment: async (commentId) => {
    const res = await axios.post(
      `${API_URL}/comments/${commentId}/like`,
      {},
      { headers: getAuthHeader() },
    );
    return res.data;
  },
  // ← AJOUTE CETTE MÉTHODE
  unlikeComment: async (commentId) => {
    const res = await axios.delete(`${API_URL}/comments/${commentId}/like`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  deleteComment: async (commentId) => {
    const res = await axios.delete(`${NETWORK_URL}/comments/${commentId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== RÉCUPÉRATION =====================
  getAllPosts: async () => {
    const res = await axios.get(API_URL, { headers: getAuthHeader() });
    return res.data;
  },
  getMyPosts: async () => {
    const res = await axios.get(`${API_URL}/me`, { headers: getAuthHeader() });
    return res.data;
  },
  getPostById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  getCommentaires: async (postId) => {
    const res = await axios.get(`${NETWORK_URL}/comments/${postId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== SUPPRESSION =====================
  deleteMyPost: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}/me`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ===================== REPOSTS (ajoutés) =====================
  repostPost: async (postId) => {
    const res = await axios.post(
      `${API_URL}/${postId}/repost`,
      {},
      { headers: getAuthHeader() },
    );
    return res.data;
  },
  getMyReposts: async () => {
    const res = await axios.get(`${API_URL}/me/reposts`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  deleteRepost: async (postId) => {
    const res = await axios.delete(`${API_URL}/${postId}/repost`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  getUserPosts: async (userId) => {
    const res = await axios.get(`${API_URL}/user/${userId}/posts`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
  getUserReposts: async (userId) => {
    const res = await axios.get(`${API_URL}/user/${userId}/reposts`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};

export default postService;
