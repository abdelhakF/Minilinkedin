import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';  // ajout de useNavigate
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // <-- ajout du hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
      if (response.token) {
        // Redirection immédiate vers /reset-password avec le token dans l'URL
        navigate(`/reset-password?token=${encodeURIComponent(response.token)}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email not found or error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Reset Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        {/* On retire l'affichage du token, il sera dans l'URL */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;