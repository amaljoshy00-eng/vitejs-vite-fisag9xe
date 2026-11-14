import { useEffect, useState } from 'react';
import { getSiteContent } from '../../lib/content';
import './About.css';

type AboutContent = {
  heading: string;
  subtitle: string;
  description: string;
  profile_image: string;
  skills: string;
};

const defaultContent: AboutContent = {
  heading: "HELLO, I'M AMAL",
  subtitle: 'Creating stories one frame at a time.',
  description:
    'Independent video editor with a passion for visual storytelling.',
  profile_image:
    'https://i.ibb.co/BKfhFrBJ/Sunset-Hiker-Over-Misty-Valleys.png',
  skills:
    'Visual Storytelling, Cinematic Editing, Short-form Videos, Creative Transitions, Music & Pacing',
};

function About() {
  const [animationKey, setAnimationKey] = useState(0);
  const [content, setContent] = useState<AboutContent>(defaultContent);

  // Load About content from Supabase
  useEffect(() => {
    async function loadAboutContent() {
      try {
        const savedContent = await getSiteContent<Partial<AboutContent>>(
          'about'
        );

        if (savedContent) {
          setContent((previous) => ({
            ...previous,
            ...savedContent,
          }));
        }
      } catch (error) {
        console.error('Unable to load About content:', error);
      }
    }

    loadAboutContent();
  }, []);

  // Replay animations when returning to About
  useEffect(() => {
    const handleSectionReturn = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail === 'about') {
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

  const skills = content.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <section className="about-section" id="about">
      <div className="about-container" key={animationKey}>
        <div className="about-heading">
          <p className="about-eyebrow">
            <span></span>
            THE PERSON BEHIND THE EDITS
          </p>

          <h2>
            ABOUT <span>ME.</span>
          </h2>
        </div>

        <div className="about-layout">
          {/* CINEMATIC PORTRAIT */}
          <div className="about-image-area">
            <div className="about-image-glow"></div>

            <div className="about-image-frame">
              <img
                src={content.profile_image || defaultContent.profile_image}
                alt="Cinematic sunset portrait representing the creator"
              />
            </div>

            <div className="about-image-number">01</div>
          </div>

          {/* ABOUT CONTENT */}
          <div className="about-content">
            <p className="about-small-title">{content.heading}</p>

            <h3>{content.subtitle}</h3>

            <p className="about-description">{content.description}</p>

            <div className="about-divider"></div>

            <div className="about-skills-heading">WHAT I ENJOY</div>

            <div className="about-skills">
              {skills.map((skill, index) => (
                <span key={`${skill}-${index}`}>{skill}</span>
              ))}
            </div>

            <a href="#work" className="about-button">
              EXPLORE MY WORK <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
