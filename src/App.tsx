import { useEffect } from 'react';

import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import Work from './components/work/Work';
import About from './components/about/About';
import Reviews from './components/reviews/Reviews';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';

import AdminOverview from './admin/AdminOverview';
import AdminContentPage from './admin/AdminContentPage';
import AdminContactsPage from './admin/AdminContactsPage';
import AdminMediaPage from './admin/AdminMediaPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import AdminLogin from './admin/AdminLogin';
import ResetPassword from './admin/ResetPassword';
import AdminDashboard from './admin/AdminDashboard';
import AdminReviewsPage from './admin/AdminReviewsPage';

function App() {
  const currentPath = window.location.pathname;

  // EXISTING NAVIGATION ANIMATION
  useEffect(() => {
    const handleSectionReturn = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const section = document.getElementById(customEvent.detail);

      if (!section) return;

      section.classList.remove('section-replay');
      void section.offsetWidth;
      section.classList.add('section-replay');
    };

    window.addEventListener('portfolio-section-return', handleSectionReturn);

    return () => {
      window.removeEventListener(
        'portfolio-section-return',
        handleSectionReturn
      );
    };
  }, []);

  // ADMIN LOGIN
  if (currentPath === '/admin') {
    return <AdminLogin />;
  }

  // PASSWORD RESET
  if (currentPath === '/reset-password') {
    return <ResetPassword />;
  }

  // ADMIN DASHBOARD
  if (currentPath === '/admin/dashboard') {
    return <AdminOverview />;
  }

  // ADMIN PROJECTS
  if (currentPath === '/admin/projects') {
    return <AdminDashboard />;
  }
  // ADMIN REVIEWS
  if (currentPath === '/admin/reviews') {
    return <AdminReviewsPage />;
  }

  // ADMIN WEBSITE CONTENT
  if (currentPath === '/admin/content') {
    return <AdminContentPage />;
  }

  // ADMIN CONTACTS
  if (currentPath === '/admin/contacts') {
    return <AdminContactsPage />;
  }

  // ADMIN MEDIA LIBRARY
  if (currentPath === '/admin/media') {
    return <AdminMediaPage />;
  }

  // ADMIN SETTINGS
  if (currentPath === '/admin/settings') {
    return <AdminSettingsPage />;
  }

  // MAIN PORTFOLIO WEBSITE
  return (
    <>
      <style>{`
        .section-replay {
          animation: sectionEntrance 0.7s ease both;
        }

        @keyframes sectionEntrance {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }

        .section-replay .work-heading,
        .section-replay .work-subheading {
          animation: contentEntrance 0.8s ease both;
        }

        .section-replay .work-intro {
          animation: contentEntrance 0.9s ease both;
        }

        .section-replay .work-grid {
          animation: contentEntrance 1s ease both;
        }

        @keyframes contentEntrance {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .section-replay,
          .section-replay .work-heading,
          .section-replay .work-subheading,
          .section-replay .work-intro,
          .section-replay .work-grid {
            animation: none;
          }
        }
      `}</style>

      <Navbar />

      <main>
        <Hero />
        <Work />
        <About />
        <Reviews />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

export default App;
