import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navigateToSection = (sectionId: string) => {
    closeMenu();

    window.dispatchEvent(
      new CustomEvent('portfolio-section-return', {
        detail: sectionId,
      })
    );
  };

  return (
    <header className="navbar">
      {/* BRAND */}
      <a
        href="#home"
        className="navbar-logo"
        onClick={() => navigateToSection('home')}
      >
        AMAL <span>JOSHY.</span>
      </a>

      {/* NAVIGATION */}
      <nav
        id="main-navigation"
        className={`navbar-links ${menuOpen ? 'menu-open' : ''}`}
        aria-label="Main navigation"
      >
        <a
          href="#home"
          className="active"
          onClick={() => navigateToSection('home')}
        >
          Home
        </a>

        <a href="#work" onClick={() => navigateToSection('work')}>
          My Work
        </a>

        <a href="#about" onClick={() => navigateToSection('about')}>
          About
        </a>

        <a href="#reviews" onClick={() => navigateToSection('reviews')}>
          Reviews
        </a>

        <a href="#contact" onClick={() => navigateToSection('contact')}>
          Contact
        </a>

        <a
          href="#contact"
          className="navbar-mobile-cta"
          onClick={() => navigateToSection('contact')}
        >
          Let's Talk ↗
        </a>
      </nav>

      {/* DESKTOP CONTACT BUTTON */}
      <a
        href="#contact"
        className="navbar-cta"
        onClick={() => navigateToSection('contact')}
      >
        Let's Talk <span>↗</span>
      </a>

      {/* MOBILE MENU BUTTON */}
      <button
        className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}

export default Navbar;
