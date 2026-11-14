import AdminLayout from './AdminLayout';
import './AdminOverview.css';

function AdminOverview() {
  const sections = [
    {
      icon: '▣',
      title: 'Projects',
      description:
        'Manage your portfolio videos, thumbnails and project details.',
      path: '/admin/projects',
    },
    {
      icon: '▤',
      title: 'Website Content',
      description: 'Edit your homepage, About section and Contact information.',
      path: '/admin/content',
    },
    {
      icon: '☏',
      title: 'Contact Links',
      description: 'Manage your email and social media links.',
      path: '/admin/contacts',
    },
    {
      icon: '▧',
      title: 'Media Library',
      description: 'Manage images, thumbnails and other media files.',
      path: '/admin/media',
    },
    {
      icon: '⚙',
      title: 'Settings',
      description: 'Manage your portfolio administration settings.',
      path: '/admin/settings',
    },
  ];

  return (
    <AdminLayout activePage="dashboard" title="Dashboard Overview">
      <section className="overview-welcome">
        <span>WELCOME BACK</span>
        <h2>Your creative control centre.</h2>
        <p>
          Manage your portfolio website, projects and content from one place.
        </p>
      </section>

      <section className="overview-section">
        <h2>Manage Your Website</h2>

        <div className="overview-grid">
          {sections.map((section) => (
            <a
              href={section.path}
              className="overview-card"
              key={section.title}
            >
              <div className="overview-card-icon">{section.icon}</div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <span className="overview-card-action">Open Section →</span>
            </a>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminOverview;
