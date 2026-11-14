import { useEffect, useState } from 'react';
import { getSiteContent } from '../../lib/content';
import { getVisibleSocialLinks } from '../../lib/socialLinks';
import type { SocialLink } from '../../lib/socialLinks';
import './Contact.css';

type ContactContent = {
  heading: string;
  description: string;
  email: string;
};

const defaultContent: ContactContent = {
  heading: "LET'S WORK TOGETHER",
  description:
    "Have an idea, a creative project or just want to connect? I'd love to hear from you. Let's bring your vision to life.",
  email: 'amaljoshy00@gmail.com',
};

function Contact() {
  const [animationKey, setAnimationKey] = useState(0);
  const [content, setContent] = useState<ContactContent>(defaultContent);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Load Contact content and visible social links from Supabase
  useEffect(() => {
    async function loadContactData() {
      try {
        const [savedContent, savedLinks] = await Promise.all([
          getSiteContent<Partial<ContactContent>>('contact'),
          getVisibleSocialLinks(),
        ]);

        if (savedContent) {
          setContent((previous) => ({
            ...previous,
            ...savedContent,
          }));
        }

        setSocialLinks(savedLinks);
      } catch (error) {
        console.error('Unable to load Contact data:', error);
      }
    }

    loadContactData();
  }, []);

  // Replay animations when returning to Contact
  useEffect(() => {
    const handleSectionReturn = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail === 'contact') {
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

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container" key={animationKey}>
        <p className="contact-eyebrow">
          <span></span>
          LET'S CONNECT
        </p>

        <div className="contact-main">
          <div className="contact-heading">
            <h2>{content.heading}</h2>

            <h3>LET'S CREATE SOMETHING.</h3>
          </div>

          <p className="contact-description">{content.description}</p>

          {/* CONTACT BUTTONS */}
          <div className="contact-buttons">
            {content.email && (
              <a
                href={`mailto:${content.email}`}
                className="contact-email-button"
              >
                <span>EMAIL ME</span>
                <span className="contact-button-arrow">↗</span>
              </a>
            )}

            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-telegram-button"
              >
                <span>{link.platform.toUpperCase()}</span>
                <span className="contact-button-arrow">↗</span>
              </a>
            ))}
          </div>

          {content.email && (
            <a href={`mailto:${content.email}`} className="contact-email">
              {content.email}
            </a>
          )}

          {/* DYNAMIC CONTACT LINKS */}
          {socialLinks.map((link) => (
            <a
              key={`detail-${link.id}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-telegram-link"
            >
              {link.platform}
            </a>
          ))}
        </div>

        {/* FOOTER */}
        <div className="contact-bottom">
          <div className="contact-brand">
            AMAL <span>JOSHY.</span>
            <p>VIDEO EDITOR &amp; VISUAL STORYTELLER</p>
          </div>

          <a href="#home" className="back-to-top">
            BACK TO TOP <span>↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
