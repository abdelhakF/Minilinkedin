import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './AdminLayout';

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR');
  } catch {
    return String(d);
  }
};

const PostsManagement = () => {
  const { posts, loading, error, setError, fetchPosts, deletePost } = useAdmin();
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    if (!search) return posts;
    const term = search.toLowerCase();
    return posts.filter((p) => {
      return (
        p.titre?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.auteur?.nom?.toLowerCase().includes(term) ||
        p.auteur?.email?.toLowerCase().includes(term)
      );
    });
  }, [posts, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce post ? Cette action est définitive.')) return;
    setActionLoadingId(id);
    setError(null);
    try {
      await deletePost(id);
    } catch {
      // géré dans le contexte
    } finally {
      setActionLoadingId(null);
    }
  };

  const styles = {
    title: { marginTop: 0, color: '#0f172a' },
    toolbar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '14px',
      flex: 1,
      minWidth: '200px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '16px',
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '8px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
    },
    meta: {
      fontSize: '12px',
      color: '#64748b',
    },
    desc: {
      fontSize: '13px',
      color: '#334155',
      lineHeight: 1.5,
      maxHeight: '90px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    image: {
      width: '100%',
      height: '140px',
      objectFit: 'cover',
      borderRadius: '8px',
      background: '#f1f5f9',
    },
    statsRow: {
      display: 'flex',
      gap: '16px',
      fontSize: '12px',
      color: '#64748b',
    },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '6px' },
    btn: (color) => ({
      border: 'none',
      padding: '6px 10px',
      borderRadius: '6px',
      background: color,
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
    }),
    error: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
    },
  };

  return (
    <AdminLayout>
      <h1 style={styles.title}>Gestion des posts</h1>
      <p style={{ color: '#64748b' }}>
        {filteredPosts.length} post(s) affiché(s) sur {posts.length}.
      </p>

      {error && <div style={styles.error}>{String(error)}</div>}

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Rechercher par titre, description, auteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={() => fetchPosts()}
          style={styles.btn('#0f172a')}
          disabled={loading}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <p>Chargement des posts...</p>
      ) : filteredPosts.length === 0 ? (
        <p style={{ color: '#64748b' }}>Aucun post trouvé.</p>
      ) : (
        <div style={styles.grid}>
          {filteredPosts.map((p) => (
            <div key={p.id} style={styles.card}>
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.titre} style={styles.image} />
              )}
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{p.titre || '(sans titre)'}</h3>
                <span style={styles.meta}>#{p.id}</span>
              </div>
              <div style={styles.meta}>
                Par <strong>{p.auteur?.nom || 'Inconnu'}</strong>
                {p.auteur?.email && ` (${p.auteur.email})`}
              </div>
              <div style={styles.meta}>
                Publié le {formatDate(p.datePublication)}
                {p.dateLimite && ` · Limite : ${formatDate(p.dateLimite)}`}
              </div>
              {p.description && <div style={styles.desc}>{p.description}</div>}
              <div style={styles.statsRow}>
                <span>❤️ {p.likeCount ?? 0}</span>
                <span>🔁 {p.shareCount ?? 0}</span>
                <span>📨 {p.candidatures?.length ?? 0} candidatures</span>
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.btn('#dc2626')}
                  disabled={actionLoadingId === p.id}
                  onClick={() => handleDelete(p.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default PostsManagement;
