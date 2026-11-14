import AdminLayout from './AdminLayout';
import WebsiteContent from './WebsiteContent';
import './AdminContentPage.css';

function AdminContentPage() {
  return (
    <AdminLayout activePage="content" title="Website Content">
      <div className="admin-content-intro">
        <h2>Manage Your Portfolio Content</h2>
        <p>
          Update the text and information displayed across your public portfolio
          website.
        </p>
      </div>

      <WebsiteContent />
    </AdminLayout>
  );
}

export default AdminContentPage;
