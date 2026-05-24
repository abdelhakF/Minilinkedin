import axios from 'axios';

const API_URL = 'http://localhost:8080/api/search';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const searchService = {
  // Recherche globale (utilisateurs + posts + compétences)
  rechercheGlobale: async (q) => {
    const res = await axios.get(`${API_URL}?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeader(),   // 👈 ajout
    });
    return res.data;
  },

  // Utilisateurs par nom
  rechercherParNom: async (nom) => {
    const res = await axios.get(`${API_URL}/users`, { 
      params: { nom },
      headers: getAuthHeader(),   // 👈 ajout
    });
    return res.data;
  },

  // Utilisateurs par institution
  rechercherParInstitution: async (institution) => {
    const res = await axios.get(`${API_URL}/users`, { 
      params: { institution },
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Utilisateurs par rôle (ETUDIANT, ENSEIGNANT, ADMINISTRATEUR)
  rechercherParRole: async (role) => {
    const res = await axios.get(`${API_URL}/users`, { 
      params: { role },
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Enseignants par spécialité
  rechercherEnseignants: async (specialite) => {
    const res = await axios.get(`${API_URL}/enseignants`, {
      params: { specialite },
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Posts (par mot-clé et/ou type)
  rechercherPosts: async ({ q, type } = {}) => {
    const params = {};
    if (q) params.q = q;
    if (type) params.type = type;
    const res = await axios.get(`${API_URL}/posts`, { 
      params,
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Offres de stage
  getOffresStage: async () => {
    const res = await axios.get(`${API_URL}/offres`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Sujets de thèse
  getSujetsThese: async () => {
    const res = await axios.get(`${API_URL}/theses`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Projets tutorés
  getProjetsTutores: async () => {
    const res = await axios.get(`${API_URL}/projets`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Compétences
  rechercherCompetences: async (q) => {
    const params = q ? { q } : {};
    const res = await axios.get(`${API_URL}/skills`, { 
      params,
      headers: getAuthHeader(),
    });
    return res.data;
  }
};

export default searchService;