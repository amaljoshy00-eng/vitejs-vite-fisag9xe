import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from './AdminLayout';
import './AdminMediaPage.css';

type MediaCategory = 'Homepage' | 'About' | 'Projects' | 'Other';

type MediaFile = {
  name: string;
  id: string;
  created_at: string;
  url: string;
  category: MediaCategory;
  path: string;
};

const categories: MediaCategory[] = ['Homepage', 'About', 'Projects', 'Other'];

function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    MediaCategory | 'All'
  >('All');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('Other');

  const loadFiles = async () => {
    setLoading(true);
    setError('');

    const allFiles: MediaFile[] = [];

    for (const category of categories) {
      const folder = category === 'Other' ? '' : category;

      const { data, error: listError } = await supabase.storage
        .from('portfolio-media')
        .list(folder, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) {
        setError(listError.message);
        setLoading(false);
        return;
      }

      (data || [])
        .filter((file) => file.id && file.name)
        .forEach((file) => {
          const path = folder ? `${folder}/${file.name}` : file.name;

          const { data: publicData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(path);

          allFiles.push({
            name: file.name,
            id: file.id,
            created_at: file.created_at,
            url: publicData.publicUrl,
            category,
            path,
          });
        });
    }

    setFiles(
      allFiles.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );

    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    for (const file of Array.from(selectedFiles)) {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name}: Only image files are allowed.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds the 10 MB limit.`);
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `${uploadCategory}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
      }
    }

    event.target.value = '';
    await loadFiles();
    setUploading(false);
  };

  const handleDelete = async (file: MediaFile) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${file.name}?`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase.storage
      .from('portfolio-media')
      .remove([file.path]);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadFiles();
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Image URL copied!');
    } catch {
      setError('Could not copy the URL. Please copy it manually.');
    }
  };

  const filteredFiles =
    selectedCategory === 'All'
      ? files
      : files.filter((file) => file.category === selectedCategory);

  return (
    <AdminLayout activePage="media" title="Media Library">
      <div className="admin-content-intro">
        <h2>Manage Your Media</h2>
        <p>
          Upload, organize, preview, copy URLs and delete images stored in
          Supabase Storage.
        </p>
      </div>

      <section className="media-library">
        <div className="media-library-heading">
          <div>
            <h2>Your Images</h2>
            <p>{files.length} images uploaded</p>
          </div>

          <div className="media-upload-controls">
            <select
              value={uploadCategory}
              onChange={(event) =>
                setUploadCategory(event.target.value as MediaCategory)
              }
              disabled={uploading}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label className="media-upload-button">
              {uploading ? 'Uploading...' : '+ Upload Images'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                hidden
              />
            </label>
          </div>
        </div>

        <div className="media-category-tabs">
          <button
            className={selectedCategory === 'All' ? 'active' : ''}
            onClick={() => setSelectedCategory('All')}
          >
            All ({files.length})
          </button>

          {categories.map((category) => {
            const count = files.filter(
              (file) => file.category === category
            ).length;

            return (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {error && <div className="media-error">{error}</div>}

        {loading ? (
          <p className="media-message">Loading your media...</p>
        ) : filteredFiles.length === 0 ? (
          <div className="media-empty">
            <div>▧</div>
            <h3>No images in this category</h3>
            <p>Upload an image to get started.</p>
          </div>
        ) : (
          <div className="media-grid">
            {filteredFiles.map((file) => (
              <article className="media-card" key={file.path}>
                <img src={file.url} alt={file.name} />

                <div className="media-card-info">
                  <span className="media-category-label">{file.category}</span>

                  <h3 title={file.name}>{file.name}</h3>

                  <div className="media-card-actions">
                    <button onClick={() => copyUrl(file.url)}>Copy URL</button>

                    <button
                      className="media-delete-button"
                      onClick={() => handleDelete(file)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminMediaPage;
