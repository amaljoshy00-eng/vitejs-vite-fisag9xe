import AdminLayout from './AdminLayout';
import SocialLinksManager from './SocialLinksManager';

function AdminContactsPage() {
  return (
    <AdminLayout activePage="contacts" title="Contact Links">
      <div className="admin-content-intro">
        <h2>Manage Your Contact Links</h2>
        <p>
          Add, edit, hide or remove your email and social media links. Changes
          will appear on your public portfolio website.
        </p>
      </div>

      <SocialLinksManager />
    </AdminLayout>
  );
}

export default AdminContactsPage;
