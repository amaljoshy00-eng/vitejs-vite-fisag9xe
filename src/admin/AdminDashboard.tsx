import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from './AdminLayout';

import {
  getAdminProjects,
  addProject,
  updateProject,
  deleteProject,
} from '../lib/projects';

import type { Project } from '../lib/projects';
import './AdminDashboard.css';

type ProjectForm = {
  title: string;
  category: string;
  youtube_url: string;
  thumbnail_url: string;
  project_type: 'regular' | 'short';
  featured: boolean;
  published: boolean;
};

const emptyForm: ProjectForm = {
  title: '',
  category: 'Christian & Divine',
  youtube_url: '',
  thumbnail_url: '',
  project_type: 'regular',
  featured: false,
  published: true,
};

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }

      const parts = parsed.pathname.split('/').filter(Boolean);

      if (['shorts', 'embed', 'live'].includes(parts[0])) {
        return parts[1] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadProjects() {
    const data = await getAdminProjects();
    setProjects(data);
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user || data.user.app_metadata?.role !== 'admin') {
          await supabase.auth.signOut();
          window.location.href = '/admin';
          return;
        }

        await loadProjects();
      } catch (error) {
        console.error('Project loading error:', error);
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to load projects.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setErrorMessage('');
    setShowForm(true);
  }

  function openEditForm(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title,
      category: project.category || '',
      youtube_url: project.youtube_url,
      thumbnail_url: project.thumbnail_url || '',
      project_type: project.project_type,
      featured: project.featured ?? false,
      published: project.published,
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

  function updateForm(field: keyof ProjectForm, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSaveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    const videoId = getYouTubeId(form.youtube_url.trim());

    if (!videoId) {
      setErrorMessage('Please enter a valid YouTube video or Shorts URL.');
      setSaving(false);
      return;
    }

    const projectData = {
      title: form.title.trim(),
      category: form.category.trim(),
      youtube_url: form.youtube_url.trim(),
      thumbnail_url:
        form.thumbnail_url.trim() ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      project_type: form.project_type,
      sort_order: editingId
        ? projects.find((project) => project.id === editingId)?.sort_order ?? 0
        : projects.length + 1,
      featured: form.featured,
      published: form.published,
    };

    try {
      if (editingId) {
        await updateProject(editingId, projectData);
      } else {
        await addProject(projectData);
      }

      await loadProjects();
      closeForm();

      setMessage(
        editingId
          ? 'Project updated successfully!'
          : 'New project added successfully!'
      );
    } catch (error) {
      console.error('Project save error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save project.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle(project: Project) {
    try {
      await updateProject(project.id, {
        published: !project.published,
      });

      await loadProjects();

      setMessage(
        project.published
          ? 'Project unpublished successfully.'
          : 'Project published successfully.'
      );

      setErrorMessage('');
    } catch (error) {
      console.error('Publish update error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to update project.'
      );
    }
  }

  async function handleDeleteProject(project: Project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(project.id);
      await loadProjects();

      setMessage('Project deleted successfully.');
      setErrorMessage('');
    } catch (error) {
      console.error('Delete project error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to delete project.'
      );
    }
  }

  const regularCount = projects.filter(
    (project) => project.project_type === 'regular'
  ).length;

  const shortsCount = projects.filter(
    (project) => project.project_type === 'short'
  ).length;

  const publishedCount = projects.filter((project) => project.published).length;

  const featuredCount = projects.filter((project) => project.featured).length;

  return (
    <AdminLayout activePage="projects" title="Projects">
      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>TOTAL PROJECTS</span>
          <h2>{loading ? '...' : projects.length}</h2>
          <p>Projects in your database</p>
        </article>

        <article className="admin-stat-card">
          <span>REGULAR VIDEOS</span>
          <h2>{loading ? '...' : regularCount}</h2>
          <p>Christian &amp; Divine Videos</p>
        </article>

        <article className="admin-stat-card">
          <span>CINEMATIC SHORTS</span>
          <h2>{loading ? '...' : shortsCount}</h2>
          <p>Short-form video projects</p>
        </article>

        <article className="admin-stat-card">
          <span>FEATURED PROJECTS</span>
          <h2>{loading ? '...' : featuredCount}</h2>
          <p>Highlighted projects</p>
        </article>
      </section>

      <section className="admin-project-section">
        <div className="admin-section-heading">
          <div>
            <p>CONTENT MANAGEMENT</p>
            <h2>Your Projects</h2>
          </div>

          <button className="admin-add-button" onClick={openAddForm}>
            + Add New Project
          </button>
        </div>

        <div className="admin-project-summary">
          {projects.length} total · {publishedCount} published ·{' '}
          {projects.length - publishedCount} unpublished · {featuredCount}{' '}
          featured
        </div>

        {message && <p className="admin-success-message">{message}</p>}

        {errorMessage && <p className="admin-error-message">{errorMessage}</p>}

        {showForm && (
          <form className="admin-project-form" onSubmit={handleSaveProject}>
            <h3>{editingId ? 'Edit Project' : 'Add New Project'}</h3>

            <label>Project Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              placeholder="Enter project title"
              required
            />

            <label>YouTube Video URL</label>
            <input
              type="url"
              value={form.youtube_url}
              onChange={(event) =>
                updateForm('youtube_url', event.target.value)
              }
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />

            <label>Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              placeholder="Enter category"
            />

            <label>Project Type</label>
            <select
              value={form.project_type}
              onChange={(event) =>
                updateForm('project_type', event.target.value)
              }
            >
              <option value="regular">Regular Video</option>
              <option value="short">YouTube Short</option>
            </select>

            <label>Thumbnail URL (optional)</label>
            <input
              type="url"
              value={form.thumbnail_url}
              onChange={(event) =>
                updateForm('thumbnail_url', event.target.value)
              }
              placeholder="Leave empty to use YouTube thumbnail"
            />

            <label className="admin-publish-checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateForm('featured', event.target.checked)
                }
              />
              ⭐ Mark this project as Featured
            </label>

            <label className="admin-publish-checkbox">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  updateForm('published', event.target.checked)
                }
              />
              Publish this project on my website
            </label>

            <div className="admin-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? 'SAVING...'
                  : editingId
                  ? 'SAVE CHANGES'
                  : 'ADD PROJECT'}
              </button>

              <button type="button" onClick={closeForm}>
                CANCEL
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="admin-loading">Loading projects...</p>
        ) : (
          <div className="admin-project-list">
            {projects.map((project, index) => (
              <article className="admin-project-row" key={project.id}>
                <span className="admin-project-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <img
                  className="admin-project-thumbnail"
                  src={project.thumbnail_url}
                  alt={project.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                />

                <div className="admin-project-details">
                  <strong>{project.title}</strong>
                  <small>{project.category}</small>
                </div>

                <span className="admin-project-type">
                  {project.project_type === 'short' ? 'SHORT' : 'VIDEO'}
                </span>

                {project.featured && (
                  <span
                    style={{
                      color: '#f5b942',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    ⭐ FEATURED
                  </span>
                )}

                <span
                  className={
                    project.published ? 'admin-published' : 'admin-unpublished'
                  }
                >
                  {project.published ? 'PUBLISHED' : 'UNPUBLISHED'}
                </span>

                <div className="admin-project-actions">
                  <button onClick={() => openEditForm(project)}>Edit</button>

                  <button onClick={() => handlePublishToggle(project)}>
                    {project.published ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    className="admin-delete-button"
                    onClick={() => handleDeleteProject(project)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="admin-dashboard-footer">
        AMAL JOSHY. <span>PORTFOLIO ADMINISTRATION</span>
      </footer>
    </AdminLayout>
  );
}

export default AdminDashboard;
