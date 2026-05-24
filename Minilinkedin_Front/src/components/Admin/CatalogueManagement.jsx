import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './AdminLayout';

const styles = {
  title: { marginTop: 0, color: '#0f172a' },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  tab: (active) => ({
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    color: active ? '#0f172a' : '#64748b',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    marginBottom: '-1px',
  }),
  toolbar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
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
  btn: (color) => ({
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    background: color,
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  }),
  smallBtn: (color) => ({
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    background: color,
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  }),
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
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  formLabel: { fontSize: '13px', color: '#475569', fontWeight: '600' },
  formInput: {
    padding: '10px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  actions: { display: 'flex', gap: '6px' },
};

const EtablissementsTab = () => {
  const {
    etablissements,
    loading,
    error,
    setError,
    fetchEtablissements,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (new) | object (edit)
  const [form, setForm] = useState({ nom: '', ville: '', pays: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEtablissements();
  }, [fetchEtablissements]);

  const filtered = useMemo(() => {
    if (!search) return etablissements;
    const t = search.toLowerCase();
    return etablissements.filter(
      (e) =>
        e.nom?.toLowerCase().includes(t) ||
        e.ville?.toLowerCase().includes(t) ||
        e.pays?.toLowerCase().includes(t)
    );
  }, [etablissements, search]);

  const openCreate = () => {
    setEditing({});
    setForm({ nom: '', ville: '', pays: '', description: '' });
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({
      nom: e.nom || '',
      ville: e.ville || '',
      pays: e.pays || '',
      description: e.description || '',
    });
  };

  const close = () => {
    setEditing(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateEtablissement(editing.id, form);
      } else {
        await createEtablissement(form);
      }
      close();
    } catch {
      // géré
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet établissement ?')) return;
    await deleteEtablissement(id);
  };

  return (
    <>
      <div style={styles.toolbar}>
        <input
          style={styles.input}
          placeholder="Rechercher par nom, ville, pays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={styles.btn('#3b82f6')} onClick={openCreate}>
          ➕ Ajouter
        </button>
        <button
          style={styles.btn('#0f172a')}
          onClick={() => fetchEtablissements()}
          disabled={loading}
        >
          🔄
        </button>
      </div>

      {error && <div style={styles.error}>{String(error)}</div>}

      {loading && etablissements.length === 0 ? (
        <p>Chargement...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Ville</th>
              <th style={styles.th}>Pays</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>
                  Aucun établissement.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id}>
                <td style={styles.td}><strong>{e.nom}</strong></td>
                <td style={styles.td}>{e.ville || '—'}</td>
                <td style={styles.td}>{e.pays || '—'}</td>
                <td style={styles.td}>
                  {e.description
                    ? e.description.length > 60
                      ? e.description.slice(0, 60) + '...'
                      : e.description
                    : '—'}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button style={styles.smallBtn('#3b82f6')} onClick={() => openEdit(e)}>
                      Modifier
                    </button>
                    <button style={styles.smallBtn('#dc2626')} onClick={() => handleDelete(e.id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div style={styles.modal} onClick={close}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>
              {editing.id ? 'Modifier l\'établissement' : 'Nouvel établissement'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Nom *</label>
                <input
                  style={styles.formInput}
                  required
                  value={form.nom}
                  onChange={(ev) => setForm({ ...form, nom: ev.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Ville</label>
                <input
                  style={styles.formInput}
                  value={form.ville}
                  onChange={(ev) => setForm({ ...form, ville: ev.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Pays</label>
                <input
                  style={styles.formInput}
                  value={form.pays}
                  onChange={(ev) => setForm({ ...form, pays: ev.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  style={{ ...styles.formInput, resize: 'vertical', minHeight: '80px' }}
                  value={form.description}
                  onChange={(ev) => setForm({ ...form, description: ev.target.value })}
                />
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.btn('#64748b')} onClick={close}>
                  Annuler
                </button>
                <button type="submit" style={styles.btn('#3b82f6')} disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const DomainesTab = () => {
  const {
    domaines,
    loading,
    error,
    setError,
    fetchDomaines,
    createDomaine,
    updateDomaine,
    deleteDomaine,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDomaines();
  }, [fetchDomaines]);

  const filtered = useMemo(() => {
    if (!search) return domaines;
    const t = search.toLowerCase();
    return domaines.filter(
      (d) =>
        d.nom?.toLowerCase().includes(t) ||
        d.description?.toLowerCase().includes(t)
    );
  }, [domaines, search]);

  const openCreate = () => {
    setEditing({});
    setForm({ nom: '', description: '' });
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ nom: d.nom || '', description: d.description || '' });
  };

  const close = () => {
    setEditing(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateDomaine(editing.id, form);
      } else {
        await createDomaine(form);
      }
      close();
    } catch {
      // géré
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce domaine ?')) return;
    await deleteDomaine(id);
  };

  return (
    <>
      <div style={styles.toolbar}>
        <input
          style={styles.input}
          placeholder="Rechercher par nom ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={styles.btn('#3b82f6')} onClick={openCreate}>
          ➕ Ajouter
        </button>
        <button
          style={styles.btn('#0f172a')}
          onClick={() => fetchDomaines()}
          disabled={loading}
        >
          🔄
        </button>
      </div>

      {error && <div style={styles.error}>{String(error)}</div>}

      {loading && domaines.length === 0 ? (
        <p>Chargement...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>
                  Aucun domaine.
                </td>
              </tr>
            )}
            {filtered.map((d) => (
              <tr key={d.id}>
                <td style={styles.td}><strong>{d.nom}</strong></td>
                <td style={styles.td}>
                  {d.description
                    ? d.description.length > 100
                      ? d.description.slice(0, 100) + '...'
                      : d.description
                    : '—'}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button style={styles.smallBtn('#3b82f6')} onClick={() => openEdit(d)}>
                      Modifier
                    </button>
                    <button style={styles.smallBtn('#dc2626')} onClick={() => handleDelete(d.id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div style={styles.modal} onClick={close}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>
              {editing.id ? 'Modifier le domaine' : 'Nouveau domaine'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Nom *</label>
                <input
                  style={styles.formInput}
                  required
                  value={form.nom}
                  onChange={(ev) => setForm({ ...form, nom: ev.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  style={{ ...styles.formInput, resize: 'vertical', minHeight: '100px' }}
                  value={form.description}
                  onChange={(ev) => setForm({ ...form, description: ev.target.value })}
                />
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.btn('#64748b')} onClick={close}>
                  Annuler
                </button>
                <button type="submit" style={styles.btn('#3b82f6')} disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const CatalogueManagement = () => {
  const [tab, setTab] = useState('etablissements');

  return (
    <AdminLayout>
      <h1 style={styles.title}>Gestion des catalogues</h1>
      <p style={{ color: '#64748b' }}>
        Maintenance des établissements et domaines d'études officiels.
      </p>

      <div style={styles.tabs}>
        <button
          style={styles.tab(tab === 'etablissements')}
          onClick={() => setTab('etablissements')}
        >
          🏛️ Établissements
        </button>
        <button
          style={styles.tab(tab === 'domaines')}
          onClick={() => setTab('domaines')}
        >
          📖 Domaines d'études
        </button>
      </div>

      {tab === 'etablissements' ? <EtablissementsTab /> : <DomainesTab />}
    </AdminLayout>
  );
};

export default CatalogueManagement;
