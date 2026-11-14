import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAllSiteContent, saveSiteContent } from '../lib/content';

import './WebsiteContent.css';

type ContentSection = 'hero' | 'about' | 'contact';

type ContentForm = {
  [key: string]: string;
};

type MediaImage = {
  name: string;
  url: string;
  path: string;
};

type MediaCategory = 'All' | 'Homepage' | 'About' | 'Projects' | 'Other';

const mediaCategories: MediaCategory[] = [
  'All',
  'Homepage',
  'About',
  'Projects',
  'Other',
];

const defaultContent: Record<ContentSection, ContentForm> = {
  hero: {
    heading: 'AMAL JOSHY',
    subtitle: 'INDEPENDENT VIDEO EDITOR',
    description: 'Creating stories one frame at a time.',
    background_image: '',
    primary_button: 'VIEW MY WORK',
    secondary_button: "LET'S TALK",
  },

  about: {
    heading: "HELLO, I'M AMAL",
    subtitle: 'Creating stories one frame at a time.',
    description:
      'Independent video editor with a passion for visual storytelling.',
    profile_image: '',
    skills:
      'Visual Storytelling, Cinematic Editing, Short-form Videos, Creative Transitions, Music & Pacing',
  },

  contact: {
    heading: "LET'S WORK TOGETHER",
    description: 'Have a project in mind? Get in touch.',
    email: 'amaljoshy00@gmail.com',
    telegram: 'https://t.me/a_stormbreaker',
  },
};

function WebsiteContent() {
  const [activeSection, setActiveSection] = useState<ContentSection>('hero');

  const [content, setContent] =
    useState<Record<ContentSection, ContentForm>>(defaultContent);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaCategory, setMediaCategory] = useState<MediaCategory>('All');

  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedImageField, setSelectedImageField] = useState('');

  // Load saved website content
  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getAllSiteContent();

        if (data) {
          const updatedContent = { ...defaultContent };

          data.forEach((item) => {
            const key = item.content_key as ContentSection;

            if (key === 'hero' || key === 'about' || key === 'contact') {
              updatedContent[key] = {
                ...updatedContent[key],
                ...(item.content_value as ContentForm),
              };
            }
          });

          setContent(updatedContent);
        }
      } catch (error) {
        console.error('Content loading error:', error);
        setErrorMessage('Unable to load saved website content.');
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  // Update a content field
  function updateField(field: string, value: string) {
    setContent((previous) => ({
      ...previous,
      [activeSection]: {
        ...previous[activeSection],
        [field]: value,
      },
    }));
  }

  // Save website content
  async function handleSave() {
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      await saveSiteContent(activeSection, content[activeSection]);

      setMessage('Website content saved successfully!');
    } catch (error) {
      console.error('Content save error:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save website content.'
      );
    } finally {
      setSaving(false);
    }
  }

  // Open Media Library
  async function openMediaPicker(fieldName: string) {
    setSelectedImageField(fieldName);
    setPickerOpen(true);

    setMediaLoading(true);
    setMediaError('');
    setMediaImages([]);
    setMediaSearch('');
    setMediaCategory('All');

    const folders = ['', 'Homepage', 'About', 'Projects'];
    const allImages: MediaImage[] = [];

    for (const folder of folders) {
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .list(folder, {
          limit: 100,
          sortBy: {
            column: 'created_at',
            order: 'desc',
          },
        });

      if (error) {
        setMediaError(error.message);
        setMediaLoading(false);
        return;
      }

      (data || [])
        .filter((file) => file.id && file.name)
        .forEach((file) => {
          const path = folder ? `${folder}/${file.name}` : file.name;

          const { data: publicData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(path);

          allImages.push({
            name: path,
            url: publicData.publicUrl,
            path,
          });
        });
    }

    // Include original images already used on the website
    allImages.push(
      {
        name: 'Current Hero Image',
        url: 'https://i.ibb.co/TqhJ94S0/Cinematic-Editing-Workstation-Setup.png',
        path: 'legacy-hero',
      },
      {
        name: 'Current About Image',
        url: 'https://i.ibb.co/BKfhFrBJ/Sunset-Hiker-Over-Misty-Valleys.png',
        path: 'legacy-about',
      }
    );

    setMediaImages(allImages);
    setMediaLoading(false);
  }

  // Select an image
  function selectImage(image: MediaImage) {
    updateField(selectedImageField, image.url);

    setPickerOpen(false);

    setMessage('Image selected. Remember to save your changes.');
  }

  // Determine image category
  function getImageCategory(image: MediaImage): MediaCategory {
    if (image.path.startsWith('Homepage/') || image.path === 'legacy-hero') {
      return 'Homepage';
    }

    if (image.path.startsWith('About/') || image.path === 'legacy-about') {
      return 'About';
    }

    if (image.path.startsWith('Projects/')) {
      return 'Projects';
    }

    // Root-level images belong to Other
    return 'Other';
  }

  // Filter images by category and search
  const filteredMediaImages = mediaImages.filter((image) => {
    const matchesSearch = image.name
      .toLowerCase()
      .includes(mediaSearch.toLowerCase());

    const matchesCategory =
      mediaCategory === 'All' || getImageCategory(image) === mediaCategory;

    return matchesSearch && matchesCategory;
  });

  // Website content fields
  const sectionFields = {
    hero: [
      {
        name: 'heading',
        label: 'Main Heading',
        type: 'text',
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },
      {
        name: 'background_image',
        label: 'Background Image URL',
        type: 'image',
      },
      {
        name: 'primary_button',
        label: 'Primary Button Text',
        type: 'text',
      },
      {
        name: 'secondary_button',
        label: 'Secondary Button Text',
        type: 'text',
      },
    ],

    about: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
      },
      {
        name: 'description',
        label: 'Biography',
        type: 'textarea',
      },
      {
        name: 'profile_image',
        label: 'Profile Image URL',
        type: 'image',
      },
      {
        name: 'skills',
        label: 'Skills (separate with commas)',
        type: 'textarea',
      },
    ],

    contact: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
      },
      {
        name: 'telegram',
        label: 'Telegram URL',
        type: 'text',
      },
    ],
  };

  return (
    <section className="website-content-editor" id="website-content">
      <div className="website-content-heading">
        <p>PORTFOLIO CUSTOMIZATION</p>
        <h2>Website Content</h2>
        <span>Manage the content displayed on your portfolio.</span>
      </div>

      {/* Website content tabs */}
      <div className="website-content-tabs">
        {(['hero', 'about', 'contact'] as ContentSection[]).map((section) => (
          <button
            key={section}
            className={activeSection === section ? 'active' : ''}
            onClick={() => {
              setActiveSection(section);
              setMessage('');
              setErrorMessage('');
            }}
          >
            {section === 'hero'
              ? 'Homepage'
              : section === 'about'
              ? 'About'
              : 'Contact'}
          </button>
        ))}
      </div>

      {/* Content editing form */}
      <div className="website-content-form">
        {loading ? (
          <p>Loading website content...</p>
        ) : (
          <>
            {sectionFields[activeSection].map((field) => (
              <div className="website-content-field" key={field.name}>
                <label>{field.label}</label>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={content[activeSection][field.name] || ''}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                  />
                ) : field.type === 'image' ? (
                  <>
                    <input
                      type="text"
                      value={content[activeSection][field.name] || ''}
                      placeholder="Paste image URL or choose from Media Library"
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="website-media-picker-button"
                      onClick={() => openMediaPicker(field.name)}
                    >
                      ▧ Choose from Media Library
                    </button>

                    {content[activeSection][field.name] && (
                      <div className="website-image-preview">
                        <img
                          src={content[activeSection][field.name]}
                          alt="Selected preview"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    type={field.type}
                    value={content[activeSection][field.name] || ''}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                  />
                )}
              </div>
            ))}

            {message && <p className="website-content-success">{message}</p>}

            {errorMessage && (
              <p className="website-content-error">{errorMessage}</p>
            )}

            <button
              className="website-content-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'SAVING...' : 'SAVE CHANGES →'}
            </button>
          </>
        )}
      </div>

      {/* Media Library image picker */}
      {pickerOpen && (
        <div
          className="website-media-overlay"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="website-media-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Picker heading */}
            <div className="website-media-modal-header">
              <div>
                <h2>Select an Image</h2>
                <p>Choose an image from your Media Library.</p>
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Close image picker"
              >
                ✕
              </button>
            </div>

            {/* Category filters */}
            <div className="website-media-categories">
              {mediaCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={mediaCategory === category ? 'active' : ''}
                  onClick={() => setMediaCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Image search */}
            <div className="website-media-search">
              <input
                type="search"
                placeholder="Search images by name or category..."
                value={mediaSearch}
                onChange={(event) => setMediaSearch(event.target.value)}
              />
            </div>

            {/* Image results */}
            {mediaLoading ? (
              <p className="website-media-status">Loading images...</p>
            ) : mediaError ? (
              <p className="website-media-error">{mediaError}</p>
            ) : mediaImages.length === 0 ? (
              <p className="website-media-status">
                No images found. Upload images in Media Library first.
              </p>
            ) : filteredMediaImages.length === 0 ? (
              <p className="website-media-status">
                No images match your search or category.
              </p>
            ) : (
              <div className="website-media-grid">
                {filteredMediaImages.map((image) => (
                  <button
                    type="button"
                    className="website-media-item"
                    key={image.path}
                    onClick={() => selectImage(image)}
                    title={image.name}
                  >
                    <img src={image.url} alt={image.name} />
                    <span>{image.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default WebsiteContent;
