import axios from 'axios';

const API_URL = 'http://localhost:8080/api/profile';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const profileService = {
  // =========================
  // PROFIL PRINCIPAL
  // =========================

  getMyProfile: async () => {
    const response = await axios.get(`${API_URL}/me`, {
      headers: getAuthHeader(),
    });

    return response.data;
  },

  getProfileById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  },

  createProfile: async (profileRequest) => {
    const response = await axios.post(API_URL, profileRequest, {
      headers: getAuthHeader(),
    });

    return response.data;
  },

  updateProfile: async (id, profileData) => {
    const response = await axios.put(`${API_URL}/${id}`, profileData, {
      headers: getAuthHeader(),
    });

    return response.data;
  },

  deleteProfile: async (id) => {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
  },

  // =========================
  // EXPERIENCES
  // =========================

  getExperiences: async (profileId) => {
    const response = await axios.get(
      `${API_URL}/${profileId}/experiences`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  addExperience: async (profileId, experience) => {
    const response = await axios.post(
      `${API_URL}/${profileId}/experience`,
      experience,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  updateExperience: async (profileId, experienceId, experience) => {
    const response = await axios.put(
      `${API_URL}/${profileId}/experience/${experienceId}`,
      experience,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  removeExperience: async (profileId, experienceId) => {
    const response = await axios.delete(
      `${API_URL}/${profileId}/experience/${experienceId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  // =========================
  // EDUCATIONS
  // =========================

  getEducations: async (profileId) => {
    const response = await axios.get(
      `${API_URL}/${profileId}/educations`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  addEducation: async (profileId, education) => {
    const response = await axios.post(
      `${API_URL}/${profileId}/education`,
      education,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  updateEducation: async (profileId, educationId, education) => {
    const response = await axios.put(
      `${API_URL}/${profileId}/education/${educationId}`,
      education,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  removeEducation: async (profileId, educationId) => {
    const response = await axios.delete(
      `${API_URL}/${profileId}/education/${educationId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  // =========================
  // SKILLS
  // =========================

  getSkills: async (profileId) => {
    const response = await axios.get(
      `${API_URL}/${profileId}/skills`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  addSkill: async (profileId, skill) => {
    const response = await axios.post(
      `${API_URL}/${profileId}/skill`,
      skill,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  updateSkill: async (profileId, skillId, skill) => {
    const response = await axios.put(
      `${API_URL}/${profileId}/skill/${skillId}`,
      skill,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  removeSkill: async (profileId, skillId) => {
    const response = await axios.delete(
      `${API_URL}/${profileId}/skill/${skillId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  // =========================
  // ACCOMPLISHMENTS
  // =========================

  getAccomplishments: async (profileId) => {
    const response = await axios.get(
      `${API_URL}/${profileId}/accomplishments`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  addAccomplishment: async (profileId, accomplishment) => {
    const response = await axios.post(
      `${API_URL}/${profileId}/accomplishment`,
      accomplishment,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  updateAccomplishment: async (
    profileId,
    accomplishmentId,
    accomplishment
  ) => {
    const response = await axios.put(
      `${API_URL}/${profileId}/accomplishment/${accomplishmentId}`,
      accomplishment,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  removeAccomplishment: async (profileId, accomplishmentId) => {
    const response = await axios.delete(
      `${API_URL}/${profileId}/accomplishment/${accomplishmentId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  // =========================
  // RECOMMENDATIONS
  // =========================
  getRecommendations: async (profileId) => {
    const response = await axios.get(
      `${API_URL}/${profileId}/recommendations`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  addRecommendation: async (profileId, recommendation) => {
    const response = await axios.post(
      `${API_URL}/${profileId}/recommendation`,
      recommendation,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  acceptRecommendation: async (profileId, recommendationId) => {
    const response = await axios.put(
      `${API_URL}/${profileId}/recommendation/${recommendationId}/accept`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  rejectRecommendation: async (profileId, recommendationId) => {
    const response = await axios.put(
      `${API_URL}/${profileId}/recommendation/${recommendationId}/reject`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },
};

export default profileService;