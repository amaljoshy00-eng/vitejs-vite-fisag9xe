import { useEffect, useState } from 'react';
import {
  getAdminSocialLinks,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../lib/socialLinks';

import type { SocialLink } from '../lib/socialLinks';

import './SocialLinksManager.css';

type LinkForm = {
  platform: string;
  url: string;
  display_order: number;
  visible: boolean;
};

const emptyForm: LinkForm = {
  platform: '',
  url: '',
  display_order: 0,
  visible: true,
};

function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<LinkForm>(emptyForm);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadLinks() {
    const data = await getAdminSocialLinks();
    setLinks(data);
  }

  useEffect(() => {
    async function initialize() {
      try {
        await loadLinks();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load contact links.'
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      display_order: links.length + 1,
    });
    setMessage('');
    setErrorMessage('');
    setShowForm(true);
  }

  function openEditForm(link: SocialLink) {
    setEditingId(link.id);

    setForm({
      platform: link.platform,
      url: link.url,
      display_order: link.display_order,
      visible: link.visible,
    });

    setMessage('');
    setErrorMessage('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(
    field: keyof LinkForm,
    value: string | number | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    const platform = form.platform.trim();
    const url = form.url.trim();

    if (!platform || !url) {
      setErrorMessage('Please enter both platform name and URL.');
      setSaving(false);
      return;
    }

    try {
      const wasEditing = Boolean(editingId);

      const linkData = {
        platform,
        url,
        display_order: Number(form.display_order),
        visible: form.visible,
      };

      if (editingId) {
        await updateSocialLink(editingId, linkData);
      } else {
        await addSocialLink(linkData);
      }

      await loadLinks();
      closeForm();

      setMessage(
        wasEditing
          ? 'Contact link updated successfully!'
          : 'Contact link added successfully!'
      );
    } catch (error) {
      console.error('Contact link save error:', error);

      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save contact link.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(link: SocialLink) {
    setMessage('');
    setErrorMessage('');

    try {
      await updateSocialLink(link.id, {
        visible: !link.visible,
      });

      await loadLinks();

      setMessage(
        link.visible
          ? 'Contact link hidden from your website.'
          : 'Contact link is now visible on your website.'
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to update visibility.'
      );
    }
  }

  async function handleDelete(link: SocialLink) {
    const confirmed = window.confirm(
      `Delete the ${link.platform} contact link?`
    );

    if (!confirmed) return;

    setMessage('');
    setErrorMessage('');

    try {
      await deleteSocialLink(link.id);
      await loadLinks();

      setMessage('Contact link deleted successfully!');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to delete contact link.'
      );
    }
  }

  return (
    <section className="social-manager" id="contact-links">
      <div className="social-manager-heading">
        <div>
          <p>CONTACT MANAGEMENT</p>
          <h2>Contact Links</h2>
          <span>Manage Instagram, WhatsApp, Telegram and other platforms.</span>
        </div>

        <button className="social-add-button" onClick={openAddForm}>
          + Add Contact
        </button>
      </div>

      {message && <p className="social-success-message">{message}</p>}

      {errorMessage && <p className="social-error-message">{errorMessage}</p>}

      {showForm && (
        <form className="social-link-form" onSubmit={handleSave}>
          <h3>{editingId ? 'Edit Contact Link' : 'Add Contact Link'}</h3>

          <label>Platform Name</label>
          <input
            type="text"
            value={form.platform}
            onChange={(event) => updateField('platform', event.target.value)}
            placeholder="Instagram, WhatsApp, Discord..."
            required
          />

          <label>Profile or Contact URL</label>
          <input
            type="url"
            value={form.url}
            onChange={(event) => updateField('url', event.target.value)}
            placeholder="https://..."
            required
          />

          <label>Display Order</label>
          <input
            type="number"
            min="0"
            value={form.display_order}
            onChange={(event) =>
              updateField('display_order', Number(event.target.value))
            }
          />

          <label className="social-visibility-checkbox">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(event) => updateField('visible', event.target.checked)}
            />
            Show this contact option on my website
          </label>

          <div className="social-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'SAVING...'
                : editingId
                ? 'SAVE CHANGES'
                : 'ADD CONTACT'}
            </button>

            <button type="button" onClick={closeForm}>
              CANCEL
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="social-loading">Loading contact links...</p>
      ) : links.length === 0 ? (
        <div className="social-empty">
          <h3>No additional contact links yet.</h3>
          <p>Add Instagram, WhatsApp or another platform to get started.</p>
        </div>
      ) : (
        <div className="social-link-list">
          {links.map((link) => (
            <article className="social-link-row" key={link.id}>
              <div className="social-link-info">
                <strong>{link.platform}</strong>
                <span>{link.url}</span>
                <small>Display order: {link.display_order}</small>
              </div>

              <span
                className={link.visible ? 'social-visible' : 'social-hidden'}
              >
                {link.visible ? 'VISIBLE' : 'HIDDEN'}
              </span>

              <div className="social-link-actions">
                <button onClick={() => openEditForm(link)}>Edit</button>

                <button onClick={() => toggleVisibility(link)}>
                  {link.visible ? 'Hide' : 'Show'}
                </button>

                <button
                  className="social-delete-button"
                  onClick={() => handleDelete(link)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SocialLinksManager;
