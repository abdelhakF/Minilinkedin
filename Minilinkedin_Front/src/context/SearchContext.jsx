import React, { createContext, useCallback, useState } from 'react';
import searchService from '../services/searchService';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [results, setResults] = useState(null);      // résultat de la recherche en cours
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeError = (err) => {
    return err?.response?.data?.message || err?.response?.data || err.message || 'Erreur de recherche';
  };

  // Action générique qui met à jour results/loading/error
  const executeSearch = useCallback(async (searchFn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchFn(...args);
      setResults(data);
      return data;
    } catch (err) {
      const msg = normalizeError(err);
      setError(msg);
      setResults(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Recherche globale
  const rechercheGlobale = useCallback((q) => {
    return executeSearch(searchService.rechercheGlobale, q);
  }, [executeSearch]);

  // Utilisateurs par nom
  const rechercherParNom = useCallback((nom) => {
    return executeSearch(searchService.rechercherParNom, nom);
  }, [executeSearch]);

  // Utilisateurs par institution
  const rechercherParInstitution = useCallback((institution) => {
    return executeSearch(searchService.rechercherParInstitution, institution);
  }, [executeSearch]);

  // Utilisateurs par rôle
  const rechercherParRole = useCallback((role) => {
    return executeSearch(searchService.rechercherParRole, role);
  }, [executeSearch]);

  // Enseignants par spécialité
  const rechercherEnseignants = useCallback((specialite) => {
    return executeSearch(searchService.rechercherEnseignants, specialite);
  }, [executeSearch]);

  // Posts
  const rechercherPosts = useCallback(({ q, type } = {}) => {
    return executeSearch(searchService.rechercherPosts, { q, type });
  }, [executeSearch]);

  // Offres de stage
  const getOffresStage = useCallback(() => {
    return executeSearch(searchService.getOffresStage);
  }, [executeSearch]);

  // Sujets de thèse
  const getSujetsThese = useCallback(() => {
    return executeSearch(searchService.getSujetsThese);
  }, [executeSearch]);

  // Projets tutorés
  const getProjetsTutores = useCallback(() => {
    return executeSearch(searchService.getProjetsTutores);
  }, [executeSearch]);

  // Compétences
  const rechercherCompetences = useCallback((q) => {
    return executeSearch(searchService.rechercherCompetences, q);
  }, [executeSearch]);

  const value = {
    results,
    loading,
    error,
    rechercheGlobale,
    rechercherParNom,
    rechercherParInstitution,
    rechercherParRole,
    rechercherEnseignants,
    rechercherPosts,
    getOffresStage,
    getSujetsThese,
    getProjetsTutores,
    rechercherCompetences,
    setError,   // pour réinitialiser l'erreur si besoin
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};