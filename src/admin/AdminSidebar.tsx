import { useEffect, useState } from 'react';
import './AdminSidebar.css';
import { getAllReviews } from '../lib/reviews';

type AdminSidebarProps = {
  activePage: string;
  mobileOpen: boolean;
  onClose: () => void;
};

function AdminSidebar({ activePage, mobileOpen, onClose }: AdminSidebarProps) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function loadPendingCount() {
      try {
        const reviews = await getAllReviews();

        setPendingCount(
          reviews.filter((review) => review.status === 'pending').length
        );
      } catch (error) {
        console.error('Error loading pending review count:', error);
      }
    }

    loadPendingCount();

    // Refresh the count every 30 seconds
    const interval = window.setInterval(loadPendingCount, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '◈',
      path: '/admin/dashboard',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: '▣',
      path: '/admin/projects',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: '★',
      path: '/admin/reviews',
    },
    {
      id: 'content',
      label: 'Website Content',
      icon: '▤',
      path: '/admin/content',
    },
    {
      id: 'contacts',
      label: 'Contact Links',
      icon: '☏',
      path: '/admin/contacts',
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: '▧',
      path: '/admin/media',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙',
      path: '/admin/settings',
    },
  ];

  async function handleLogout() {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <>
      {mobileOpen && (
        <div className="admin-sidebar-overlay" onClick={onClose} />
      )}

      <aside
        className={`admin-sidebar ${mobileOpen ? 'admin-sidebar-open' : ''}`}
      >
        <div className="admin-brand">
          AMAL <span>JOSHY.</span>
          <small>CONTROL PANEL</small>
        </div>

        <nav className="admin-navigation">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={activePage === item.id ? 'admin-nav-active' : ''}
              onClick={onClose}
            >
              <span>
                {item.icon} {item.label}
              </span>

              {item.id === 'reviews' && pendingCount > 0 && (
                <span className="pending-review-badge">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </a>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          ↗ Sign Out
        </button>
      </aside>
    </>
  );
}

export default AdminSidebar;
