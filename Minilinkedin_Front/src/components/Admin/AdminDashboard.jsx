import React, { useEffect, useMemo } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './AdminLayout';

const ROLE_COLORS = {
  ETUDIANT: '#16a34a',
  ENSEIGNANT: '#0891b2',
  ADMIN: '#7c3aed',
};

const SparkLine = ({ data, color = '#3b82f6' }) => {
  const width = 280;
  const height = 60;
  const safeData = Array.isArray(data) && data.length > 0 ? data : [];
  if (safeData.length === 0) {
    return (
      <div style={{ height, color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
        Aucune donnée disponible
      </div>
    );
  }
  const counts = safeData.map((d) => Number(d.count) || 0);
  const max = Math.max(...counts, 1);
  const stepX = width / Math.max(safeData.length - 1, 1);
  const points = counts
    .map((c, i) => `${i * stepX},${height - (c / max) * height}`)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {counts.map((c, i) => (
        <circle
          key={i}
          cx={i * stepX}
          cy={height - (c / max) * height}
          r="2.5"
          fill={color}
        />
      ))}
    </svg>
  );
};

const AdminDashboard = () => {
  const { stats, loading, error, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const usersByRoleEntries = useMemo(() => {
    if (!stats?.usersByRole) return [];
    return Object.entries(stats.usersByRole);
  }, [stats]);

  const totalByRole = useMemo(
    () => usersByRoleEntries.reduce((sum, [, v]) => sum + Number(v || 0), 0),
    [usersByRoleEntries]
  );

  const styles = {
    title: { marginTop: 0, color: '#0f172a' },
    subtitle: { color: '#64748b', marginBottom: '24px' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    card: (color) => ({
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
    }),
    cardLabel: {
      fontSize: '12px',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    cardValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '6px 0 0',
    },
    cardSub: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px',
    },
    panelGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '16px',
    },
    panel: {
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    panelTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a',
      marginTop: 0,
      marginBottom: '12px',
    },
    barRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '10px',
      fontSize: '13px',
    },
    barLabel: { width: '90px', color: '#475569' },
    barTrack: {
      flex: 1,
      height: '8px',
      background: '#f1f5f9',
      borderRadius: '999px',
      overflow: 'hidden',
    },
    barFill: (color, pct) => ({
      width: `${pct}%`,
      height: '100%',
      background: color,
      transition: 'width 0.3s',
    }),
    barValue: { width: '40px', textAlign: 'right', fontWeight: '600', color: '#0f172a' },
    error: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
  };

  return (
    <AdminLayout>
      <h1 style={styles.title}>Tableau de bord</h1>
      <p style={styles.subtitle}>Aperçu général de la plateforme Mini-LinkedIn.</p>

      {error && <div style={styles.error}>{String(error)}</div>}

      {loading && !stats ? (
        <p>Chargement des statistiques...</p>
      ) : (
        <>
          <div style={styles.grid}>
            <div style={styles.card('#3b82f6')}>
              <div style={styles.cardLabel}>Utilisateurs total</div>
              <div style={styles.cardValue}>{stats?.totalUsers ?? 0}</div>
              <div style={styles.cardSub}>
                +{stats?.newUsersLast7Days ?? 0} sur 7 jours
              </div>
            </div>
            <div style={styles.card('#0891b2')}>
              <div style={styles.cardLabel}>Enseignants</div>
              <div style={styles.cardValue}>{stats?.totalTeachers ?? 0}</div>
              <div style={styles.cardSub}>
                {stats?.pendingTeachers ?? 0} en attente de validation
              </div>
            </div>
            <div style={styles.card('#f59e0b')}>
              <div style={styles.cardLabel}>Posts</div>
              <div style={styles.cardValue}>{stats?.totalPosts ?? 0}</div>
              <div style={styles.cardSub}>
                +{stats?.postsLast7Days ?? 0} sur 7 jours
              </div>
            </div>
            <div style={styles.card('#dc2626')}>
              <div style={styles.cardLabel}>Signalements en attente</div>
              <div style={styles.cardValue}>
                {stats?.pendingSignalements ?? 0}
              </div>
              <div style={styles.cardSub}>À modérer</div>
            </div>
          </div>

          <div style={styles.panelGrid}>
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Répartition par rôle</h3>
              {usersByRoleEntries.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Aucune donnée
                </div>
              ) : (
                usersByRoleEntries.map(([role, count]) => {
                  const pct = totalByRole > 0 ? (Number(count) / totalByRole) * 100 : 0;
                  return (
                    <div key={role} style={styles.barRow}>
                      <span style={styles.barLabel}>{role}</span>
                      <div style={styles.barTrack}>
                        <div style={styles.barFill(ROLE_COLORS[role] || '#64748b', pct)} />
                      </div>
                      <span style={styles.barValue}>{count}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.chartHeader}>
                <h3 style={styles.panelTitle}>Inscriptions (7 derniers jours)</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Total : {stats?.newUsersLast7Days ?? 0}
                </span>
              </div>
              <SparkLine data={stats?.usersTimeSeries} color="#3b82f6" />
            </div>

            <div style={styles.panel}>
              <div style={styles.chartHeader}>
                <h3 style={styles.panelTitle}>Publications (7 derniers jours)</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Total : {stats?.postsLast7Days ?? 0}
                </span>
              </div>
              <SparkLine data={stats?.postsTimeSeries} color="#f59e0b" />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
