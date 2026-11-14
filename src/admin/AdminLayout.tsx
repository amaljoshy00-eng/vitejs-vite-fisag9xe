import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import AdminSidebar from './AdminSidebar';
import { supabase } from '../lib/supabase';
import './AdminLayout.css';

type AdminLayoutProps = {
  activePage: string;
  title: string;
  children: ReactNode;
};

function AdminLayout({ activePage, title, children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      const { data, error } = await supabase.auth.getSession();

      const session = data.session;
      const isAdmin = !error && session?.user?.app_metadata?.role === 'admin';

      if (!mounted) return;

      if (!isAdmin) {
        window.location.replace('/admin');
        return;
      }

      setAuthorized(true);
      setCheckingAuth(false);
    };

    checkAdminAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.replace('/admin');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checkingAuth || !authorized) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-spinner"></div>
        <p>Verifying administrator access...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        activePage={activePage}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="admin-layout-main">
        <header className="admin-layout-header">
          <button
            className="admin-mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>

          <div>
            <span className="admin-header-label">CONTROL PANEL</span>
            <h1>{title}</h1>
          </div>
        </header>

        <div className="admin-layout-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
