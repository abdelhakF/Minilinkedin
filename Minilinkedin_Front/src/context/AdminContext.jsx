import React, { createContext, useCallback, useState } from 'react';
import adminService from '../services/adminService';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeError = (err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      'Une erreur est survenue'
    );
  };

  // ───── STATS ─────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ───── USERS ─────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    try {
      return await adminService.getUserById(id);
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const banUser = useCallback(async (id) => {
    try {
      const updated = await adminService.banUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const unbanUser = useCallback(async (id) => {
    try {
      const updated = await adminService.unbanUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const validateEnseignant = useCallback(async (id) => {
    try {
      const updated = await adminService.validateEnseignant(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── POSTS ─────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllPosts();
      setPosts(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id) => {
    try {
      await adminService.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── SIGNALEMENTS ─────
  const fetchSignalements = useCallback(async (status = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getSignalements(status);
      setSignalements(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveSignalement = useCallback(async (id, deletePost = false) => {
    try {
      const updated = await adminService.resolveSignalement(id, deletePost);
      setSignalements((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const rejectSignalement = useCallback(async (id) => {
    try {
      const updated = await adminService.rejectSignalement(id);
      setSignalements((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const deleteSignalement = useCallback(async (id) => {
    try {
      await adminService.deleteSignalement(id);
      setSignalements((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── ÉTABLISSEMENTS ─────
  const fetchEtablissements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getEtablissements();
      setEtablissements(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEtablissement = useCallback(async (data) => {
    try {
      const created = await adminService.createEtablissement(data);
      setEtablissements((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const updateEtablissement = useCallback(async (id, data) => {
    try {
      const updated = await adminService.updateEtablissement(id, data);
      setEtablissements((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const deleteEtablissement = useCallback(async (id) => {
    try {
      await adminService.deleteEtablissement(id);
      setEtablissements((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── DOMAINES ─────
  const fetchDomaines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDomaines();
      setDomaines(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDomaine = useCallback(async (data) => {
    try {
      const created = await adminService.createDomaine(data);
      setDomaines((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const updateDomaine = useCallback(async (id, data) => {
    try {
      const updated = await adminService.updateDomaine(id, data);
      setDomaines((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const deleteDomaine = useCallback(async (id) => {
    try {
      await adminService.deleteDomaine(id);
      setDomaines((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const value = {
    stats,
    users,
    posts,
    signalements,
    etablissements,
    domaines,
    loading,
    error,
    setError,
    fetchStats,
    fetchUsers,
    getUserById,
    deleteUser,
    banUser,
    unbanUser,
    validateEnseignant,
    fetchPosts,
    deletePost,
    fetchSignalements,
    resolveSignalement,
    rejectSignalement,
    deleteSignalement,
    fetchEtablissements,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
    fetchDomaines,
    createDomaine,
    updateDomaine,
    deleteDomaine,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
