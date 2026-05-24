import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ThumbsUp, MessageSquare, Trash2, Tag, Repeat } from 'lucide-react';
import postService from '../../services/postService';
import { PostContext } from '../../context/PostContext';
import { useAuth } from '../../hooks/useAuth';
import './ProfilePostList.css';

const timeAgo = (dateStr) => { /* garde ta fonction */ };

const ProfilePostItem = ({ postOrRepost, isRepost, isOwner, onDelete, onDeleteRepost,
                           originalAuthorName, originalAuthorPhoto, isRepostOwner }) => {
  const navigate = useNavigate();
  const { likePost, unlikePost } = useContext(PostContext);
  const [liked, setLiked] = useState(postOrRepost.likedByMe || false);
  const [likeCount, setLikeCount] = useState(postOrRepost.likeCount || 0);

  const handleLike = async (e) => {
  e.stopPropagation();
  const targetId = isRepost ? postOrRepost.originalPostId : postOrRepost.id;
  try {
    if (liked) {
      await unlikePost(targetId);
      setLiked(false);
      setLikeCount(prev => Math.max(prev - 1, 0));
    } else {
      await likePost(targetId);
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  } catch (err) {
    console.error(err);
  }
};

  const goToPost = () => {
  const targetId = isRepost ? postOrRepost.originalPostId : postOrRepost.id;
  navigate(`/posts/${targetId}`);
};

  const authorName = isRepost ? originalAuthorName : (postOrRepost.auteurNom || 'Utilisateur');
  const authorAvatar = isRepost ? originalAuthorPhoto : postOrRepost.auteurPhotoUrl;
  const initial = (authorName || 'U').charAt(0).toUpperCase();
  const date = postOrRepost.datePublication;
  const title = postOrRepost.titre;
  const content = postOrRepost.description || '';
  const commentCount = postOrRepost.commentCount || 0;
  const postType = postOrRepost.type?.toLowerCase().replace('_', ' ') || 'publication';

  return (
    <div className="profile-post-card" onClick={goToPost} style={{ cursor: 'pointer' }}>
      <div className="post-author">
        <div className="post-avatar">
          {authorAvatar ? <img src={authorAvatar} alt={authorName} /> : <span>{initial}</span>}
        </div>
        <div className="post-author-details">
          <span className="post-author-name">
            {authorName}
            {isRepost && (
              <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'normal', color: '#666' }}>
                <Repeat size={12} style={{ display: 'inline', marginRight: '2px' }} />
                Republié
              </span>
            )}
          </span>
          <span className="post-date">
            <Calendar size={12} />
            {date ? timeAgo(date) : 'Date inconnue'}
          </span>
        </div>
        {postOrRepost.type && (
          <div className="post-type-badge">
            <Tag size={12} />
            {postType}
          </div>
        )}
      </div>

      <div className="post-card-body">
        {title && <h4 className="post-sub-title">{title}</h4>}
        {content && <p className="post-text-preview">{content}</p>}
        {postOrRepost.imageUrl && (
          <div className="post-image-wrap">
            <img src={postOrRepost.imageUrl} alt="Illustration" className="post-image" />
          </div>
        )}
      </div>

      <div className="post-card-footer">
        <div className="post-metrics">
          <button className="metric like-button" onClick={handleLike}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: liked ? '#0A66C2' : 'rgba(0,0,0,0.6)', fontWeight: liked ? '600' : 'normal' }}>
            <ThumbsUp size={16} fill={liked ? "#0A66C2" : "none"} color={liked ? "#0A66C2" : "currentColor"} />
            <span>{likeCount}</span>
          </button>
          <div className="metric">
            <MessageSquare size={16} />
            <span>{commentCount}</span>
          </div>
        </div>
        {/* Bouton suppression post original (si propriétaire) */}
        {isOwner && !isRepost && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(postOrRepost.id); }} className="btn-delete-post" title="Supprimer">
            <Trash2 size={18} />
          </button>
        )}
        {/* Bouton retirer le repost (si l'utilisateur est celui qui a republié) */}
        {isRepostOwner && (
  <button
    onClick={(e) => { e.stopPropagation(); onDeleteRepost(postOrRepost.originalPostId); }}
    className="btn-delete-post"
    title="Retirer le repost"
  >
    <Trash2 size={18} />
  </button>
)}
      </div>
    </div>
  );
};

const ProfilePostList = ({ isOwner, refreshKey, profileUserId }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const getCurrentUserId = () => {
  if (user?.id) return user.id;
  if (user?.userId) return user.userId;
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return parsed?.id || parsed?.userId;
    } catch(e) {}
  }
  return localStorage.getItem('userId');
};
const currentUserId = Number(localStorage.getItem('userId'));
console.log("currentUserId =", currentUserId);
console.log("user =", user);
      let ownPosts = [], reposts = [];

      if (!profileUserId || profileUserId === currentUserId) {
        // Mon propre profil
        [ownPosts, reposts] = await Promise.all([
          postService.getMyPosts(),
          postService.getMyReposts().catch(() => [])
        ]);
      } else {
        // Profil d’un autre utilisateur
        [ownPosts, reposts] = await Promise.all([
          postService.getUserPosts(profileUserId).catch(() => []),
          postService.getUserReposts(profileUserId).catch(() => [])
        ]);
      }

      const merged = [];

      ownPosts.forEach(post => {
        merged.push({
          post,
          isRepost: false,
          originalAuthorName: null,
          originalAuthorPhoto: null,
          isRepostOwner: false,
          date: post.datePublication
        });
      });

      reposts.forEach(repost => {
  if (repost) {
    const isRepostOwner = (repost.reposterId === currentUserId);
    merged.push({
      post: repost,
      isRepost: true,
      originalAuthorName: repost.auteurNom,
      originalAuthorPhoto: repost.auteurPhotoUrl,
      isRepostOwner: isRepostOwner,
      date: repost.repostedAt
    });
  }
  console.log(`Repost: originalPostId=${repost.originalPostId}, reposterId=${repost.reposterId}, currentUserId=${currentUserId}, isOwner=${repost.reposterId === currentUserId}`);
});

// ✅ AJOUTE ICI le console.log (à l’intérieur du try)
console.log("Reposts reçus :", reposts.map(r => ({ id: r.id, reposterId: r.reposterId, auteurNom: r.auteurNom })));

      merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(merged);
    } catch (err) {
      setError('Impossible de charger les publications.');
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, profileUserId]);

  useEffect(() => {
    const handleCommentAdded = () => fetchData();
    window.addEventListener('commentAdded', handleCommentAdded);
    return () => window.removeEventListener('commentAdded', handleCommentAdded);
  }, []);

  const handleDeletePost = async (postId) => {
    if (window.confirm('Supprimer cette publication ?')) {
      try {
        await postService.deleteMyPost(postId);
        fetchData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteRepost = async (postId) => {
    if (window.confirm('Retirer ce repost de votre profil ?')) {
      try {
        await postService.deleteRepost(postId);
        fetchData();
      } catch (err) {
        alert('Erreur lors du retrait du repost');
      }
    }
  };

  if (loading) return <div className="profile-loading">Chargement des publications...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Publications récentes</h2>
      </div>
      <div className="profile-posts-container">
        {items.length === 0 ? (
          <p className="empty-state">Aucune publication trouvée.</p>
        ) : (
          <div className="profile-posts-grid">
            {items.map((item, idx) => (
              <ProfilePostItem
                key={idx}
                postOrRepost={item.post}
                isRepost={item.isRepost}
                isOwner={isOwner}
                onDelete={handleDeletePost}
                onDeleteRepost={handleDeleteRepost}
                originalAuthorName={item.originalAuthorName}
                originalAuthorPhoto={item.originalAuthorPhoto}
                isRepostOwner={item.isRepostOwner}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePostList;