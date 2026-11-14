import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const role = data.user?.app_metadata?.role;

      if (role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage(
        'If an account exists for this email, a password recovery link will be sent. Please check your inbox.'
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to send recovery email.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          AMAL <span>JOSHY.</span>
        </div>

        <p className="admin-login-label">PRIVATE ACCESS</p>

        <h1>{forgotPassword ? 'Reset Password.' : 'Welcome Back.'}</h1>

        <p className="admin-login-description">
          {forgotPassword
            ? 'Enter your admin email to receive a password recovery link.'
            : 'Sign in to manage your creative portfolio.'}
        </p>

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Your admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            {error && <p className="admin-login-error">{error}</p>}

            {message && (
              <p style={{ color: '#4ade80', marginTop: '15px' }}>{message}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'SENDING...' : 'SEND RECOVERY LINK →'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotPassword(false);
                setError('');
                setMessage('');
              }}
              style={{ marginTop: '12px' }}
            >
              ← BACK TO LOGIN
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Your admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="admin-login-error">{error}</p>}

            <div style={{ textAlign: 'right', margin: '12px 0 18px' }}>
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(true);
                  setError('');
                  setMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#a78bfa',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </button>
          </form>
        )}

        <a href="/" className="admin-back-home">
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}

export default AdminLogin;
