import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from './AdminLayout';
import './AdminSettingsPage.css';

function AdminSettingsPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function loadAdminProfile() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (!data.user) {
          setError('Unable to find the logged-in admin account.');
          return;
        }

        setEmail(data.user.email || 'Not available');
        setRole(data.user.app_metadata?.role || 'User');

        setCreatedAt(new Date(data.user.created_at).toLocaleDateString());
      } catch (err) {
        console.error('Admin profile error:', err);
        setError('Unable to load admin account information.');
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();
  }, []);

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('Your new password must be different.');
      return;
    }

    setChangingPassword(true);

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Your current password is incorrect.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordMessage('Your password has been changed successfully.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to change your password. Please try again.';

      setPasswordError(message);
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <AdminLayout activePage="settings" title="Settings">
      <div className="admin-settings-page">
        <div className="admin-content-intro">
          <h2>Admin Settings</h2>
          <p>Manage your administrator account and portfolio preferences.</p>
        </div>

        {/* Administrator Profile */}
        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">👤</div>
            <div>
              <h3>Administrator Profile</h3>
              <p>Your administrator account information.</p>
            </div>
          </div>

          {loading ? (
            <p className="settings-loading">Loading account information...</p>
          ) : error ? (
            <p className="settings-error">{error}</p>
          ) : (
            <div className="settings-profile-details">
              <div className="settings-detail-row">
                <span>Email Address</span>
                <strong>{email}</strong>
              </div>

              <div className="settings-detail-row">
                <span>Account Role</span>
                <strong className="settings-role-badge">{role}</strong>
              </div>

              <div className="settings-detail-row">
                <span>Account Created</span>
                <strong>{createdAt}</strong>
              </div>

              <div className="settings-detail-row">
                <span>Account Status</span>
                <strong className="settings-status">
                  <span></span> Active
                </strong>
              </div>
            </div>
          )}
        </section>

        {/* Change Password */}
        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">🔐</div>
            <div>
              <h3>Change Password</h3>
              <p>Update your administrator account password securely.</p>
            </div>
          </div>

          <form
            onSubmit={handlePasswordChange}
            className="settings-password-form"
          >
            <div className="settings-form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <small>Use at least 8 characters.</small>
            </div>

            <div className="settings-form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <label className="settings-show-password">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
              />
              Show passwords
            </label>

            {passwordError && (
              <div className="settings-message settings-message-error">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="settings-message settings-message-success">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              className="settings-update-button"
              disabled={changingPassword}
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminSettingsPage;
