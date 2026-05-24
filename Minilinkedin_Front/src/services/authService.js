import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
};

const extractUserFromToken = (token, fallbackEmail = null) => {
  const decoded = decodeJwt(token);
  if (!decoded) {
    return fallbackEmail ? { email: fallbackEmail, token } : { token };
  }

  const email =
    decoded.email ||
    decoded.sub ||
    decoded.username ||
    fallbackEmail ||
    null;

  const role =
    decoded.role ||
    decoded.roleEnum ||
    (decoded.roles && decoded.roles[0]) ||
    (decoded.authorities && decoded.authorities[0]?.replace('ROLE_', '')) ||
    null;

  const id =
    decoded.id ||
    decoded.userId ||
    decoded.utilisateurId ||
    null;

  const profileId =
    decoded.profileId ||
    decoded.profile_id ||
    null;

  return {
    token,
    email,
    role,
    id,
    profileId,
  };
};

const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  login: async (email, password) => {
    const payload = {
      email,
      username: email,
      password,
    };

    const response = await axios.post(`${API_URL}/login`, payload);
    const token = response.data;

    if (token) {
      localStorage.setItem('token', token);

      const user = extractUserFromToken(token, email);

      if (user.email) {
        localStorage.setItem('userEmail', user.email);
      }
      if (user.role) {
        localStorage.setItem('userRole', user.role);
      }
      if (user.id) {
        localStorage.setItem('userId', String(user.id));
      }
      if (user.profileId) {
        localStorage.setItem('profileId', String(user.profileId));
      }
    }

    return token;
  },

  logout: async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
    } catch (err) {
      console.warn('Logout server call failed:', err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('profileId');
    }
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
    return response.data;
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const storedEmail = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedProfileId = localStorage.getItem('profileId');

    const userFromToken = extractUserFromToken(token, storedEmail);

    return {
      token,
      email: userFromToken.email || storedEmail,
      role: userFromToken.role || storedRole,
      id: userFromToken.id || (storedUserId ? Number(storedUserId) : null),
      profileId: userFromToken.profileId || (storedProfileId ? Number(storedProfileId) : null),
    };
  },
};

export default authService;