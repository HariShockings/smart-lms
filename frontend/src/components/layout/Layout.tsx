import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="container-fluid">
        <div className="row">
          <div className={`col-md-3 col-lg-2 d-md-block bg-light sidebar collapse ${sidebarCollapsed ? 'd-none' : ''}`}>
            <Sidebar userRole={user?.role || 'student'} />
          </div>
          
          <main className={`col-md-9 ms-sm-auto col-lg-10 px-md-4 ${sidebarCollapsed ? 'col-md-12' : ''}`}>
            <div className="pt-3 pb-2 mb-3">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;