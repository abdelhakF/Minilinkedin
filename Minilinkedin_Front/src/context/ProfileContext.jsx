import React, { createContext, useCallback, useEffect, useState } from 'react';
import profileService from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeError = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Failed to load profile';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') return data.message || data.error || 'Failed to load profile';
    return 'Failed to load profile';
  };

  const loadProfile = useCallback(async () => {
    if (authLoading) return null;

    if (!isAuthenticated) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setError(null);
      } else {
        setProfile(null);
        setError(normalizeError(err));
        console.error('Error loading profile:', err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // 👇 NOUVELLE FONCTION POUR CHARGER UN PROFIL PAR SON ID
  const getProfileById = useCallback(async (id) => {
    try {
      const data = await profileService.getProfileById(id);
      return data;
    } catch (err) {
      console.error('Error loading profile by ID:', err);
      return null;
    }
  }, []);

  const createProfile = useCallback(async (profileRequest) => {
    try {
      const newProfile = await profileService.createProfile(profileRequest);
      setProfile(newProfile);
      setError(null);
      return newProfile;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    if (!profile) throw new Error('No profile to update');
    try {
      const updated = await profileService.updateProfile(profile.id, profileData);
      setProfile(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, [profile]);

  const deleteProfile = useCallback(async () => {
    if (!profile) throw new Error('No profile to delete');
    try {
      await profileService.deleteProfile(profile.id);
      setProfile(null);
      setError(null);
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, [profile]);

  const addExperience = useCallback(async (experience) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.addExperience(profile.id, experience);
    setProfile(updated);
    return updated;
  }, [profile]);

  const updateExperience = useCallback(async (experienceId, experience) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.updateExperience(profile.id, experienceId, experience);
    setProfile(updated);
    return updated;
  }, [profile]);

  const removeExperience = useCallback(async (experienceId) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.removeExperience(profile.id, experienceId);
    setProfile(updated);
    return updated;
  }, [profile]);

  const addEducation = useCallback(async (education) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.addEducation(profile.id, education);
    setProfile(updated);
    return updated;
  }, [profile]);

  const updateEducation = useCallback(async (educationId, education) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.updateEducation(profile.id, educationId, education);
    setProfile(updated);
    return updated;
  }, [profile]);

  const removeEducation = useCallback(async (educationId) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.removeEducation(profile.id, educationId);
    setProfile(updated);
    return updated;
  }, [profile]);

  const addSkill = useCallback(async (skill) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.addSkill(profile.id, skill);
    setProfile(updated);
    return updated;
  }, [profile]);

  const updateSkill = useCallback(async (skillId, skill) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.updateSkill(profile.id, skillId, skill);
    setProfile(updated);
    return updated;
  }, [profile]);

  const removeSkill = useCallback(async (skillId) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.removeSkill(profile.id, skillId);
    setProfile(updated);
    return updated;
  }, [profile]);

  const addAccomplishment = useCallback(async (accomplishment) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.addAccomplishment(profile.id, accomplishment);
    setProfile(updated);
    return updated;
  }, [profile]);

  const updateAccomplishment = useCallback(async (accomplishmentId, accomplishment) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.updateAccomplishment(profile.id, accomplishmentId, accomplishment);
    setProfile(updated);
    return updated;
  }, [profile]);

  const removeAccomplishment = useCallback(async (accomplishmentId) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.removeAccomplishment(profile.id, accomplishmentId);
    setProfile(updated);
    return updated;
  }, [profile]);

  const addRecommendation = useCallback(async (profileId, recommendation) => {
    const updated = await profileService.addRecommendation(profileId, recommendation);
    if (profile && profile.id === profileId) {
      setProfile(updated);
    }
    return updated;
  }, [profile]);

  const acceptRecommendation = useCallback(async (recommendationId) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.acceptRecommendation(profile.id, recommendationId);
    setProfile(updated);
    return updated;
  }, [profile]);

  const rejectRecommendation = useCallback(async (recommendationId) => {
    if (!profile) throw new Error('No profile');
    const updated = await profileService.rejectRecommendation(profile.id, recommendationId);
    setProfile(updated);
    return updated;
  }, [profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value = {
    profile,
    loading: loading || authLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addAccomplishment,
    updateAccomplishment,
    removeAccomplishment,
    addRecommendation,
    acceptRecommendation,
    rejectRecommendation,
    refreshProfile: loadProfile,
    getProfileById, // 👇 AJOUTÉ ICI POUR Y AVOIR ACCÈS
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};