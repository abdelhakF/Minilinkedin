import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './AdminLayout';

const ROLE_BADGE_COLOR = {
  ADMIN: '#7c3aed',
  ENSEIGNANT: '#0891b2',
  ETUDIANT: '#16a34a',
};

const isBanned = (user) => {
  return user?.account?.banned === true || user?.account?.actif === false;
};

const UsersManagement = () => {
  const {
    users,
    loading,
    error,
    setError,
    fetchUsers,
    deleteUser,
    banUser,
    unbanUser,
    validateEnseignant,
  } = useAdmin();

  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== 'ALL' && u.roleEnum !== filterRole) return false;
      if (search) {
        const term = search.toLowerCase();
        const matches =
          u.nom?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.institution?.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [users, filterRole, search]);

  const handleAction = async (action, id) => {
    setActionLoadingId(id);
    setError(null);
    try {
      await action(id);
    } catch {
      // géré dans le contexte
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ? Cette action est définitive.')) return;
    await handleAction(deleteUser, id);
    if (selectedUser?.id === id) setSelectedUser(null);
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
    select: {
      padding: '10px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white',
    },
    table: {
      width: '100%',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      background: '#f8fafc',
      fontSize: '12px',
      textTransform: 'uppercase',
      color: '#64748b',
      letterSpacing: '0.5px',
      borderBottom: '1px solid #e2e8f0',
    },
    td: {
      padding: '14px 16px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      verticalAlign: 'middle',
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
    statusOk: {
      color: '#16a34a',
      fontWeight: '600',
    },
    statusBanned: {
      color: '#dc2626',
      fontWeight: '600',
    },
    actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
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
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
    },
    detailKey: { color: '#64748b' },
    detailValue: { fontWeight: '600', color: '#0f172a' },
  };

  return (
    <AdminLayout>
      <h1 style={styles.title}>Gestion des utilisateurs</h1>
      <p style={{ color: '#64748b' }}>
        {filteredUsers.length} utilisateur(s) affiché(s) sur {users.length}.
      </p>

      {error && <div style={styles.error}>{String(error)}</div>}

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Rechercher par nom, email, institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={styles.select}
        >
          <option value="ALL">Tous les rôles</option>
          <option value="ETUDIANT">Étudiants</option>
          <option value="ENSEIGNANT">Enseignants</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button
          onClick={() => fetchUsers()}
          style={styles.btn('#0f172a')}
          disabled={loading}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {loading && users.length === 0 ? (
        <p>Chargement...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Institution</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
            {filteredUsers.map((u) => {
              const banned = isBanned(u);
              const isEnseignant = u.roleEnum === 'ENSEIGNANT';
              const isValide = u.estValide === true;
              const busy = actionLoadingId === u.id;
              return (
                <tr key={u.id}>
                  <td style={styles.td}>
                    <strong>{u.nom || '—'}</strong>
                  </td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(ROLE_BADGE_COLOR[u.roleEnum] || '#64748b')}>
                      {u.roleEnum || '—'}
                    </span>
                    {isEnseignant && !isValide && (
                      <span style={{ ...styles.badge('#f59e0b'), marginLeft: '6px' }}>
                        À valider
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>{u.institution || '—'}</td>
                  <td style={styles.td}>
                    {banned ? (
                      <span style={styles.statusBanned}>● Banni</span>
                    ) : (
                      <span style={styles.statusOk}>● Actif</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.btn('#3b82f6')}
                        onClick={() => setSelectedUser(u)}
                      >
                        Voir
                      </button>
                      {isEnseignant && !isValide && (
                        <button
                          style={styles.btn('#10b981')}
                          disabled={busy}
                          onClick={() => handleAction(validateEnseignant, u.id)}
                        >
                          Valider
                        </button>
                      )}
                      {banned ? (
                        <button
                          style={styles.btn('#10b981')}
                          disabled={busy}
                          onClick={() => handleAction(unbanUser, u.id)}
                        >
                          Débannir
                        </button>
                      ) : (
                        <button
                          style={styles.btn('#f59e0b')}
                          disabled={busy}
                          onClick={() => handleAction(banUser, u.id)}
                        >
                          Bannir
                        </button>
                      )}
                      <button
                        style={styles.btn('#dc2626')}
                        disabled={busy}
                        onClick={() => handleDelete(u.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <div style={styles.modal} onClick={() => setSelectedUser(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Détails de l'utilisateur</h2>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>ID</span>
              <span style={styles.detailValue}>{selectedUser.id}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Nom</span>
              <span style={styles.detailValue}>{selectedUser.nom || '—'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Email</span>
              <span style={styles.detailValue}>{selectedUser.email}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Téléphone</span>
              <span style={styles.detailValue}>{selectedUser.phone || '—'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Rôle</span>
              <span style={styles.detailValue}>{selectedUser.roleEnum}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Institution</span>
              <span style={styles.detailValue}>{selectedUser.institution || '—'}</span>
            </div>
            {selectedUser.roleEnum === 'ENSEIGNANT' && (
              <>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Spécialité</span>
                  <span style={styles.detailValue}>{selectedUser.specialite || '—'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Diplôme</span>
                  <span style={styles.detailValue}>{selectedUser.diplome || '—'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailKey}>Validé</span>
                  <span style={styles.detailValue}>
                    {selectedUser.estValide ? 'Oui' : 'Non'}
                  </span>
                </div>
              </>
            )}
            {selectedUser.roleEnum === 'ETUDIANT' && (
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Niveau d'étude</span>
                <span style={styles.detailValue}>{selectedUser.niveauEtude || '—'}</span>
              </div>
            )}
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Statut</span>
              <span style={styles.detailValue}>
                {isBanned(selectedUser) ? '🚫 Banni' : '✅ Actif'}
              </span>
            </div>
            <button
              style={{ ...styles.btn('#0f172a'), marginTop: '16px', width: '100%' }}
              onClick={() => setSelectedUser(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersManagement;
