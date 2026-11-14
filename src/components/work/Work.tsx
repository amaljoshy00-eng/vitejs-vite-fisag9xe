import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getProjects } from '../../lib/projects';
import './Work.css';

type WorkProject = {
  id: string;
  databaseId: string;
  title: string;
  category: string;
  thumbnail_url: string;
  featured: boolean;
};

function getYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/]+)/
  );

  return match ? match[1] : url;
}

function Work() {
  const [activeVideo, setActiveVideo] = useState<WorkProject | null>(null);
  const [titleAnimationKey, setTitleAnimationKey] = useState(0);

  const [regularProjects, setRegularProjects] = useState<WorkProject[]>([]);
  const [shortProjects, setShortProjects] = useState<WorkProject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // SEPARATE FEATURED AND NORMAL PROJECTS
  const featuredProjects = regularProjects.filter(
    (project) => project.featured
  );

  const normalProjects = regularProjects.filter((project) => !project.featured);

  const featuredShortProjects = shortProjects.filter(
    (project) => project.featured
  );

  const normalShortProjects = shortProjects.filter(
    (project) => !project.featured
  );

  // LOAD PROJECTS FROM SUPABASE
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError('');

        const data = await getProjects();

        const regular = data
          .filter((project) => project.project_type === 'regular')
          .map((project) => ({
            id: getYouTubeId(project.youtube_url),
            databaseId: project.id,
            title: project.title,
            category: project.category || '',
            thumbnail_url:
              project.thumbnail_url ||
              `https://i.ytimg.com/vi/${getYouTubeId(
                project.youtube_url
              )}/hqdefault.jpg`,
            featured: project.featured ?? false,
          }));

        const shorts = data
          .filter((project) => project.project_type === 'short')
          .map((project) => ({
            id: getYouTubeId(project.youtube_url),
            databaseId: project.id,
            title: project.title,
            category: project.category || '',
            thumbnail_url:
              project.thumbnail_url ||
              `https://i.ytimg.com/vi/${getYouTubeId(
                project.youtube_url
              )}/hqdefault.jpg`,
            featured: project.featured ?? false,
          }));

        setRegularProjects(regular);
        setShortProjects(shorts);
      } catch (err) {
        console.error('Failed to load portfolio projects:', err);
        setError('Unable to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // CARD REVEAL ANIMATIONS
  useEffect(() => {
    if (loading || error) return;

    const cards = document.querySelectorAll('#work .work-card');

    const revealCards = () => {
      cards.forEach((card, index) => {
        card.classList.remove('card-visible');
        card.classList.add('reveal-ready');

        void (card as HTMLElement).offsetWidth;

        window.setTimeout(() => {
          card.classList.add('card-visible');
        }, index * 70);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    cards.forEach((card) => {
      card.classList.add('reveal-ready');
      observer.observe(card);
    });

    const handleSectionReturn = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail === 'work') {
        revealCards();
        setTitleAnimationKey((previous) => previous + 1);
      }
    };

    window.addEventListener('portfolio-section-return', handleSectionReturn);

    return () => {
      observer.disconnect();

      window.removeEventListener(
        'portfolio-section-return',
        handleSectionReturn
      );
    };
  }, [loading, error, regularProjects, shortProjects]);

  // VIDEO POPUP SCROLL LOCK
  useEffect(() => {
    document.body.style.overflow = activeVideo ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [activeVideo]);

  // RENDER PROJECT CARDS
  const renderProjects = (
    projects: WorkProject[],
    isShort = false,
    isFeatured = false
  ) => (
    <div
      className={`work-grid ${isShort ? 'short-grid' : ''} ${
        isFeatured ? 'featured-grid' : ''
      }`}
    >
      {projects.map((project, index) => (
        <article
          className={`work-card ${isFeatured ? 'featured-card' : ''}`}
          key={project.databaseId}
        >
          <button
            className={`work-thumbnail ${isShort ? 'short-thumbnail' : ''}`}
            onClick={() => setActiveVideo(project)}
            aria-label={`Play ${project.title}`}
          >
            <img
              src={project.thumbnail_url}
              alt={project.title}
              loading="lazy"
            />

            {isFeatured && (
              <span className="featured-project-badge">★ FEATURED PROJECT</span>
            )}

            {!isFeatured && (
              <span className="work-category-badge">
                {isShort ? 'CINEMATIC' : 'DIVINE EDIT'}
              </span>
            )}

            <span className="work-play">▶</span>

            <span className="work-number">
              {String(index + 1).padStart(2, '0')}
            </span>
          </button>

          <div className="work-card-info">
            <div>
              <h3>{project.title}</h3>
              <p>{project.category}</p>
            </div>

            <span className="work-arrow">↗</span>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <>
      <section className="work-section" id="work">
        <div className="work-container">
          {/* SECTION HEADING */}
          <div className="work-heading">
            <div>
              <p className="work-eyebrow">
                <span></span>
                MY CREATIVE PORTFOLIO
              </p>

              <div className="work-title-animation" key={titleAnimationKey}>
                <h2 className="work-animated-title">
                  <span className="title-selected">SELECTED</span>
                  <span className="title-works">WORKS.</span>
                </h2>

                <div className="work-title-line"></div>
              </div>
            </div>

            <p className="work-intro">
              A collection of divine visual stories and cinematic moments,
              crafted through creativity, editing and imagination.
            </p>
          </div>

          {loading ? (
            <p>Loading projects...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              {/* FEATURED PROJECTS - REGULAR VIDEOS AND SHORTS */}
              {featuredProjects.length + featuredShortProjects.length > 0 && (
                <section className="featured-projects-section">
                  <div className="work-subheading featured-heading">
                    <h3>★ Featured Projects</h3>
                    <span>
                      {String(
                        featuredProjects.length + featuredShortProjects.length
                      ).padStart(2, '0')}{' '}
                      FEATURED
                    </span>
                  </div>

                  {featuredProjects.length > 0 &&
                    renderProjects(featuredProjects, false, true)}

                  {featuredShortProjects.length > 0 &&
                    renderProjects(featuredShortProjects, true, true)}
                </section>
              )}

              {/* NORMAL CHRISTIAN & DIVINE VIDEOS */}
              <div className="work-subheading normal-projects-heading">
                <h3>Christian &amp; Divine Videos</h3>
                <span>
                  {String(normalProjects.length).padStart(2, '0')} PROJECTS
                </span>
              </div>

              {normalProjects.length > 0 ? (
                renderProjects(normalProjects)
              ) : (
                <p className="work-empty-message">
                  {featuredProjects.length > 0
                    ? 'All regular projects are currently featured.'
                    : 'No projects available yet.'}
                </p>
              )}

              {/* NORMAL CINEMATIC SHORTS */}
              <div className="work-subheading shorts-heading">
                <h3>Cinematic Shots</h3>
                <span>
                  {String(normalShortProjects.length).padStart(2, '0')} PROJECTS
                </span>
              </div>

              {normalShortProjects.length > 0 ? (
                renderProjects(normalShortProjects, true)
              ) : (
                <p className="work-empty-message">
                  {featuredShortProjects.length > 0
                    ? 'All cinematic shots are currently featured.'
                    : 'No cinematic shots available yet.'}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* VIDEO POPUP */}
      {activeVideo &&
        createPortal(
          <div
            className="video-modal"
            onClick={() => setActiveVideo(null)}
            role="presentation"
          >
            <div
              className="video-modal-content"
              role="dialog"
              aria-modal="true"
              aria-label={activeVideo.title}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="video-modal-header">
                <h3>{activeVideo.title}</h3>

                <button
                  className="video-close"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Close video"
                >
                  ✕
                </button>
              </div>

              <div className="video-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="video-modal-footer">
                <span>WATCHING: {activeVideo.category}</span>

                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube ↗
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Work;
