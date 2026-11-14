import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    async function verifyRecoverySession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session) {
          setError(
            'This password recovery link is invalid or has expired. Please request a new link.'
          );
          return;
        }

        setValidSession(true);
      } catch {
        setError(
          'Unable to verify your recovery session. Please request a new link.'
        );
      } finally {
        setCheckingSession(false);
      }
    }

    verifyRecoverySession();
  }, []);

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccess(true);
      setMessage('Your password has been reset successfully.');

      setPassword('');
      setConfirmPassword('');

      await supabase.auth.signOut();

      setTimeout(() => {
        window.location.href = '/admin';
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to reset your password.'
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

        <p className="admin-login-label">ACCOUNT RECOVERY</p>

        <h1>New Password.</h1>

        <p className="admin-login-description">
          Create a new password for your administrator account.
        </p>

        {checkingSession ? (
          <p>Verifying recovery link...</p>
        ) : success ? (
          <p style={{ color: '#4ade80', marginTop: '20px' }}>
            {message}
            <br />
            <br />
            Redirecting you to Admin Login...
          </p>
        ) : validSession ? (
          <form onSubmit={handleResetPassword}>
            <label>New Password</label>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <label>Confirm New Password</label>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            {error && <p className="admin-login-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'UPDATING...' : 'RESET PASSWORD →'}
            </button>
          </form>
        ) : (
          <p className="admin-login-error">{error}</p>
        )}

        {!success && (
          <a href="/admin" className="admin-back-home">
            ← Back to Admin Login
          </a>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
