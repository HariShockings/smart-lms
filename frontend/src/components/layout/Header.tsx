import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, MessageSquare, User, LogOut, Book } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar navbar-dark sticky-top bg-gradient-primary flex-md-nowrap p-0 shadow">
      <div className="container-fluid">
        <Link className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 d-flex align-items-center" to="/dashboard">
          <Book className="me-2" size={24} />
          <span>Smart LMS</span>
        </Link>
        
        <button
          className="navbar-toggler d-md-none collapsed border-0"
          type="button"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
        
        <div className="d-flex align-items-center">
          <div className="position-relative d-none d-md-block me-3">
            <Bell size={20} className="text-white cursor-pointer" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div>
          
          <div className="position-relative d-none d-md-block me-3">
            <MessageSquare size={20} className="text-white cursor-pointer" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              5
            </span>
          </div>
          
          <div className="dropdown">
            <button
              className="btn btn-link dropdown-toggle text-white text-decoration-none d-flex align-items-center"
              type="button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="me-2">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar bg-secondary d-flex justify-content-center align-items-center">
                    <User size={20} />
                  </div>
                )}
              </div>
              <span className="d-none d-md-inline-block">
                {user?.first_name} {user?.last_name}
              </span>
            </button>
            
            <ul className={`dropdown-menu dropdown-menu-end ${showMenu ? 'show' : ''}`}>
              <li>
                <Link className="dropdown-item" to="/profile">
                  <User size={16} className="me-2" />
                  Profile
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} className="me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;