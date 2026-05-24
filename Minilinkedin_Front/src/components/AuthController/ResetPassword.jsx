import React, { useState, useEffect } from 'react';   // ajout de useEffect
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // ajout de useSearchParams
import authService from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();            // <-- récupère les params d'URL
  const tokenFromUrl = searchParams.get('token') || ''; // peut être null

  const [token, setToken] = useState(tokenFromUrl);    // pré-rempli
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Met à jour le champ token si l'URL change (théoriquement utile si on revient)
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      setMessage(response);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Set New Password</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <div className="form-group">
          <label>Reset Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            readOnly={!!tokenFromUrl}  // optionnel : verrouille si le token vient de l'URL
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;