import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const notificationService = {
  // Récupérer mes notifications
  getMyNotifications: async () => {
    const res = await axios.get(`${API_URL}/me`, {
      headers: getAuthHeader(),
    });
    return res.data; // List<Notification>
  },

  // Supprimer une notification
  deleteNotification: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data; // string message
  },

  markAsRead: async (id) => {
  return axios.put(
    `${API_URL}/read/${id}`,
    {},
    { headers: getAuthHeader() }
  );
},

};

export default notificationService;