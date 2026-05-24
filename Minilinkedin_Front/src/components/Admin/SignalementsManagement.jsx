import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './AdminLayout';

const STATUS_LABELS = {
  PENDING: 'En attente',
  RESOLVED: 'Résolu',
  REJECTED: 'Rejeté',
};

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  RESOLVED: '#16a34a',
  REJECTED: '#64748b',
};

const formatDateTime = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('fr-FR');
  } catch {
    return String(d);
  }
};

const SignalementsManagement = () => {
  const {
    signalements,
    loading,
    error,
    setError,
    fetchSignalements,
    resolveSignalement,
    rejectSignalement,
    deleteSignalement,
  } = useAdmin();

  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchSignalements(filterStatus === 'ALL' ? null : filterStatus);
  }, [filterStatus, fetchSignalements]);

  const handleAction = async (fn, id, ...args) => {
    setActionLoadingId(id);
    setError(null);
    try {
      await fn(id, ...args);
    } catch {
      // géré dans le contexte
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolve = (id, withDelete) => {
    const message = withDelete
      ? 'Résoudre ce signalement et SUPPRIMER le post associé ?'
      : 'Résoudre ce signalement (sans supprimer le post) ?';
    if (!window.confirm(message)) return;
    handleAction(resolveSignalement, id, withDelete);
  };

  const handleReject = (id) => {
    if (!window.confirm('Rejeter ce signalement ?')) return;
    handleAction(rejectSignalement, id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer définitivement ce signalement ?')) return;
    handleAction(deleteSignalement, id);
  };

  const styles = {
    title: { marginTop: 0, color: '#0f172a' },
    toolbar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
      flexWrap: 'wrap',
    },
    badge: (color) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white',
      background: color,
    }),
    motif: {
      background: '#f8fafc',
      borderLeft: '3px solid #cbd5e1',
      padding: '10px 14px',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#334155',
      fontStyle: 'italic',
    },
    meta: { fontSize: '12px', color: '#64748b' },
    postBlock: {
      background: '#f8fafc',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '13px',
    },
    actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    btn: (color) => ({
      border: 'none',
      padding: '6px 12px',
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
      <h1 style={styles.title}>Modération des signalements</h1>
      <p style={{ color: '#64748b' }}>
        {signalements.length} signalement(s) affiché(s).
      </p>

      {error && <div style={styles.error}>{String(error)}</div>}

      <div style={styles.toolbar}>
        <label style={{ fontSize: '13px', color: '#475569' }}>Statut :</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.select}
        >
          <option value="PENDING">En attente</option>
          <option value="RESOLVED">Résolus</option>
          <option value="REJECTED">Rejetés</option>
          <option value="ALL">Tous</option>
        </select>
        <button
          onClick={() => fetchSignalements(filterStatus === 'ALL' ? null : filterStatus)}
          style={styles.btn('#0f172a')}
          disabled={loading}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {loading && signalements.length === 0 ? (
        <p>Chargement...</p>
      ) : signalements.length === 0 ? (
        <p style={{ color: '#64748b' }}>Aucun signalement.</p>
      ) : (
        <div style={styles.list}>
          {signalements.map((s) => {
            const busy = actionLoadingId === s.id;
            const isPending = s.status === 'PENDING';
            return (
              <div key={s.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.badge(STATUS_COLORS[s.status] || '#64748b')}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                    <span style={{ marginLeft: '10px', fontWeight: '600' }}>
                      Signalement #{s.id}
                    </span>
                  </div>
                  <div style={styles.meta}>
                    Créé le {formatDateTime(s.createdAt)}
                    {s.resolvedAt && ` · Traité le ${formatDateTime(s.resolvedAt)}`}
                  </div>
                </div>

                <div style={styles.meta}>
                  <strong>Reporter :</strong>{' '}
                  {s.reporter
                    ? `${s.reporter.nom || 'Inconnu'} (${s.reporter.email || '—'}) - ${s.reporter.roleEnum || ''}`
                    : '—'}
                </div>

                <div style={styles.motif}>« {s.motif || 'Sans motif'} »</div>

                {s.post ? (
                  <div style={styles.postBlock}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Post #{s.post.id} : {s.post.titre || '(sans titre)'}
                    </div>
                    {s.post.description && (
                      <div style={{ color: '#475569', marginBottom: '4px' }}>
                        {s.post.description.slice(0, 200)}
                        {s.post.description.length > 200 ? '...' : ''}
                      </div>
                    )}
                    <div style={styles.meta}>
                      Auteur : {s.post.auteur?.nom || '—'}
                      {s.post.auteur?.email && ` (${s.post.auteur.email})`}
                    </div>
                  </div>
                ) : (
                  <div style={styles.meta}>Post supprimé ou indisponible</div>
                )}

                <div style={styles.actions}>
                  {isPending && (
                    <>
                      <button
                        style={styles.btn('#16a34a')}
                        disabled={busy}
                        onClick={() => handleResolve(s.id, false)}
                      >
                        ✓ Résoudre (garder le post)
                      </button>
                      <button
                        style={styles.btn('#dc2626')}
                        disabled={busy}
                        onClick={() => handleResolve(s.id, true)}
                      >
                        ✓ Résoudre + supprimer le post
                      </button>
                      <button
                        style={styles.btn('#64748b')}
                        disabled={busy}
                        onClick={() => handleReject(s.id)}
                      >
                        ✗ Rejeter
                      </button>
                    </>
                  )}
                  <button
                    style={styles.btn('#7f1d1d')}
                    disabled={busy}
                    onClick={() => handleDelete(s.id)}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default SignalementsManagement;
