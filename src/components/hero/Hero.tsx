import { useEffect, useState } from 'react';
import { getSiteContent } from '../../lib/content';
import './Hero.css';

type HeroContent = {
  heading: string;
  subtitle: string;
  description: string;
  background_image: string;
  primary_button: string;
  secondary_button: string;
};

const defaultContent: HeroContent = {
  heading: 'AMAL JOSHY',
  subtitle: 'INDEPENDENT VIDEO EDITOR',
  description:
    'I turn ideas into visual experiences.\nCreating stories through frames, motion and imagination.',
  background_image:
    'https://i.ibb.co/TqhJ94S0/Cinematic-Editing-Workstation-Setup.png',
  primary_button: 'Explore My Work',
  secondary_button: "Let's Talk",
};

function Hero() {
  const [animationKey, setAnimationKey] = useState(0);
  const [content, setContent] = useState<HeroContent>(defaultContent);

  // Load homepage content from Supabase
  useEffect(() => {
    async function loadHeroContent() {
      try {
        const savedContent = await getSiteContent<Partial<HeroContent>>('hero');

        if (savedContent) {
          setContent((previous) => ({
            ...previous,
            ...savedContent,
          }));
        }
      } catch (error) {
        console.error('Unable to load hero content:', error);
      }
    }

    loadHeroContent();
  }, []);

  // Replay animations when returning to Home
  useEffect(() => {
    const handleSectionReturn = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail === 'home') {
        setAnimationKey((previous) => previous + 1);
      }
    };

    window.addEventListener('portfolio-section-return', handleSectionReturn);

    return () => {
      window.removeEventListener(
        'portfolio-section-return',
        handleSectionReturn
      );
    };
  }, []);

  const headingParts = content.heading.trim().split(/\s+/);
  const headingFirst = headingParts[0] || 'AMAL';
  const headingRest = headingParts.slice(1).join(' ');

  return (
    <section className="hero" id="home" key={animationKey}>
      {/* FULL SCREEN BACKGROUND */}
      <div className="hero-visual">
        <img
          src={content.background_image || defaultContent.background_image}
          alt="Cinematic video editing workstation"
        />
      </div>

      <div className="hero-grid"></div>
      <div className="hero-glow"></div>

      {/* HERO CONTENT */}
      <div className="hero-layout">
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span className="hero-dot"></span>
            {content.subtitle}
          </p>

          <h1 className="hero-title">
            {headingFirst}
            {headingRest && (
              <>
                <br />
                <span>{headingRest}.</span>
              </>
            )}
          </h1>

          <div className="hero-description">
            {content.description.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </div>

          <div className="hero-actions">
            <a href="#work" className="hero-button">
              <span>▶</span>
              {content.primary_button}
              <span>↗</span>
            </a>

            <a href="#contact" className="hero-showreel">
              <span className="play-icon">▶</span>
              {content.secondary_button}
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="hero-footer">
        <span>VIDEO EDITOR &amp; VISUAL STORYTELLER</span>

        <a href="#work">
          SCROLL TO EXPLORE
          <span>↓</span>
        </a>
      </div>
    </section>
  );
}

export default Hero;
