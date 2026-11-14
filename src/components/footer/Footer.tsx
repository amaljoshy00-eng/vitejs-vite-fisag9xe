import { useEffect, useState } from 'react';
import { getVisibleSocialLinks } from '../../lib/socialLinks';
import type { SocialLink } from '../../lib/socialLinks';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function loadSocialLinks() {
      try {
        const links = await getVisibleSocialLinks();
        setSocialLinks(links);
      } catch (error) {
        console.error('Unable to load footer contact links:', error);
      }
    }

    loadSocialLinks();
  }, []);

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#home" className="footer-logo">
              AMAL <span>JOSHY.</span>
            </a>

            <p>
              Independent Video Editor
              <br />
              Visual Storyteller.
            </p>
          </div>

          <div className="footer-navigation">
            <h3>EXPLORE</h3>
            <a href="#home">Home</a>
            <a href="#work">My Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-social">
            <h3>LET'S CONNECT</h3>

            <a href="mailto:amaljoshy00@gmail.com">
              Email <span>↗</span>
            </a>

            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.platform} <span>↗</span>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>© {currentYear} AMAL JOSHY. All Rights Reserved.</p>

          <p className="footer-made">
            DESIGNED WITH <span>♥</span> &amp; CREATIVITY
          </p>

          <a href="#home" className="footer-back-top">
            BACK TO TOP <span>↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
