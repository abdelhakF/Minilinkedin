import React, { createContext, useCallback, useState } from 'react';
import postService from '../services/postService';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeError = (err) =>
    err?.response?.data?.message || err?.response?.data || err.message || 'Une erreur est survenue';

  // ───── CRÉATION ─────
  const createOffreStage = useCallback(async (offre) => {
    try {
      const newPost = await postService.createOffreStage(offre);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const createSujetThese = useCallback(async (sujet) => {
    try {
      const newPost = await postService.createSujetThese(sujet);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const createProjetTutore = useCallback(async (projet) => {
    try {
      const newPost = await postService.createProjetTutore(projet);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const createDemande = useCallback(async (demande) => {
    try {
      const newPost = await postService.createDemande(demande);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const createPublication = useCallback(async (publication) => {
    try {
      const newPost = await postService.createPublication(publication);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── INTERACTIONS ─────
  const likePost = useCallback(async (postId) => {
    try {
      await postService.likePost(postId);
      // FIX: use 'likeCount' (matches backend field name)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount: (p.likeCount || 0) + 1, likedByMe: true } : p
        )
      );
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const unlikePost = useCallback(async (postId) => {
    try {
      await postService.unlikePost(postId);
      // FIX: use 'likeCount' (matches backend field name)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likeCount: Math.max((p.likeCount || 0) - 1, 0), likedByMe: false }
            : p
        )
      );
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const addComment = useCallback(async (postId, text) => {
  try {
    const comment = await postService.addComment(postId, text);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { 
              ...p, 
              comments: [...(p.comments || []), comment],
              commentCount: (p.commentCount || 0) + 1
            }
          : p
      )
    );
    return comment;
  } catch (err) {
    setError(normalizeError(err));
    throw err;
  }
}, []);

  const sharePost = useCallback(async (postId, commentShare) => {
    try {
      await postService.sharePost(postId, commentShare);
      // FIX: use 'shareCount' (matches backend field name)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
        )
      );
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  // ───── CHARGEMENT ─────
  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getAllPosts();
      setPosts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getMyPosts();
      setPosts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ───── SUPPRESSION ─────
  const deleteMyPost = useCallback(async (id) => {
    try {
      await postService.deleteMyPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const repostPost = useCallback(async (postId) => {
    try {
        const newPost = await postService.repostPost(postId);
        // Mettre à jour le shareCount du post original dans le state
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
            )
        );
        // Ajouter le nouveau post (si vous voulez l'afficher dans le fil)
        setPosts((prev) => [newPost, ...prev]);
        return newPost;
    } catch (err) {
        setError(normalizeError(err));
        throw err;
    }
}, []);

const deleteRepost = useCallback(async (postId) => {
    try {
        await postService.deleteRepost(postId);
        // Décrémenter le shareCount du post original dans le state
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, shareCount: Math.max((p.shareCount || 0) - 1, 0) } : p
            )
        );
    } catch (err) {
        setError(normalizeError(err));
        throw err;
    }
}, []);

// Ajoute deleteRepost dans le value

  const value = {
    posts,
    loading,
    error,
    createOffreStage,
    createSujetThese,
    createProjetTutore,
    createDemande,
    createPublication,
    likePost,
    unlikePost,
    addComment,
    sharePost,
    deleteRepost,
    repostPost,
    fetchAllPosts,
    fetchMyPosts,
    deleteMyPost,
    setError,
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};