import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const styles = {
    container: {
      position: 'fixed',
      inset: 0,
      display: 'flex',
      background: '#f3f4f6',
      zIndex: 10,
    },
    sidebar: {
      width: '240px',
      flexShrink: 0,
      background: '#0f172a',
      color: 'white',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    brand: {
      padding: '0 20px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontSize: '20px',
      fontWeight: '700',
    },
    nav: {
      flex: 1,
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    navLink: (active) => ({
      color: 'white',
      textDecoration: 'none',
      padding: '12px 20px',
      borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
      background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
      fontWeight: active ? '600' : '400',
    }),
    bottom: {
      padding: '20px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    },
    userInfo: {
      fontSize: '13px',
      opacity: 0.8,
      marginBottom: '10px',
    },
    logoutBtn: {
      width: '100%',
      border: 'none',
      padding: '10px',
      borderRadius: '8px',
      background: '#dc2626',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: '30px',
      overflowY: 'auto',
      overflowX: 'hidden',
      minWidth: 0,
    },
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>🛠️ Admin Space</div>
        <nav style={styles.nav}>
          <Link to="/admin" style={styles.navLink(isActive('/admin'))}>
            📊 Dashboard
          </Link>
          <Link to="/admin/users" style={styles.navLink(isActive('/admin/users'))}>
            👥 Utilisateurs
          </Link>
          <Link to="/admin/posts" style={styles.navLink(isActive('/admin/posts'))}>
            📝 Posts
          </Link>
          <Link to="/admin/signalements" style={styles.navLink(isActive('/admin/signalements'))}>
            🚩 Signalements
          </Link>
          <Link to="/admin/catalogues" style={styles.navLink(isActive('/admin/catalogues'))}>
            📚 Catalogues
          </Link>
        </nav>
        <div style={styles.bottom}>
          <div style={styles.userInfo}>{user?.email}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>
      <main style={styles.content}>{children}</main>
    </div>
  );
};

export default AdminLayout;
