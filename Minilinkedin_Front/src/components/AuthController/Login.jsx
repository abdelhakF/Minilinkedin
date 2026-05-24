import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const redirectUser = (currentUser) => {
    const role = String(currentUser?.role || '')
      .replace(/^ROLE_/i, '')
      .trim()
      .toUpperCase();

    if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }

    navigate('/feed', { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setError('');

    try {
      const loggedInUser = await login(email, password);
      redirectUser(loggedInUser || user);
    } catch (err) {
      const message =
        err?.response?.data ||
        err?.response?.data?.message ||
        'Invalid credentials';

      setError(typeof message === 'string' ? message : 'Invalid credentials');
      console.log('LOGIN ERROR:', err?.response?.status, err?.response?.data);
    } finally {
      setLoadingForm(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '20px',
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: 'white',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
    title: {
      marginBottom: '20px',
      textAlign: 'center',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '16px',
    },
    input: {
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid #cbd5e1',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '10px',
      background: '#2563eb',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '8px',
    },
    error: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '10px',
      borderRadius: '10px',
      marginBottom: '16px',
    },
    links: {
      marginTop: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formGroup}>
          <label>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button style={styles.button} type="submit" disabled={loadingForm}>
          {loadingForm ? 'Connecting...' : 'Login'}
        </button>

        <div style={styles.links}>
          <Link to="/register">Create account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;