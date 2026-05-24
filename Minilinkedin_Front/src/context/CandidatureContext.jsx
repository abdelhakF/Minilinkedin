import React, { createContext, useCallback, useState } from 'react';
import candidatureService from '../services/candidatureService';

export const CandidatureContext = createContext();

export const CandidatureProvider = ({ children }) => {
  const [myCandidatures, setMyCandidatures] = useState([]); // mes candidatures
  const [candidaturesByPost, setCandidaturesByPost] = useState({}); // postId -> Candidature[]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeError = (err) => {
    return err?.response?.data?.message || err?.response?.data || err.message || 'Erreur';
  };

  // Postuler
  const postuler = useCallback(async (candidatureData, postId) => {
    setLoading(true);
    setError(null);
    try {
      const newCandidature = await candidatureService.postuler(candidatureData, postId);
      // Ajouter la nouvelle candidature à la liste personnelle
      setMyCandidatures((prev) => [...prev, newCandidature]);
      return newCandidature;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les candidatures pour un post (enseignant)
  const fetchCandidaturesByPost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidatureService.getByPost(postId);
      setCandidaturesByPost((prev) => ({ ...prev, [postId]: data }));
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer mes candidatures (étudiant)
  const fetchMyCandidatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidatureService.getMyCandidatures();
      setMyCandidatures(data);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    myCandidatures,
    candidaturesByPost,
    loading,
    error,
    postuler,
    fetchCandidaturesByPost,
    fetchMyCandidatures,
    setError,
  };

  return (
    <CandidatureContext.Provider value={value}>
      {children}
    </CandidatureContext.Provider>
  );
};