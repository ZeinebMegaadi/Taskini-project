import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close only on mobile (<768px)
  const handleMobileClose = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Taskini</h2>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>
        
        <div className="sidebar-user">
          {user.profilePhoto ? (
            <img 
              src={`http://localhost:5000/${user.profilePhoto}`} 
              alt={user.name}
              className="sidebar-user-photo"
            />
          ) : (
            <div className="sidebar-user-photo-placeholder">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name || 'User'}</p>
            <p className="sidebar-user-email">{user.email || ''}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/" 
            className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
            onClick={handleMobileClose}
          >
            <span className="sidebar-icon"></span>
            Home
          </Link>

          <Link 
            to="/tasks" 
            className={`sidebar-link ${isActive('/tasks') ? 'active' : ''}`}
            onClick={handleMobileClose}
          >
            <span className="sidebar-icon"></span>
            My Tasks
          </Link>

          <Link 
            to="/calendar" 
            className={`sidebar-link ${isActive('/calendar') ? 'active' : ''}`}
            onClick={handleMobileClose}
          >
            <span className="sidebar-icon"></span>
            Calendar
          </Link>

          <Link 
            to="/profile" 
            className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={handleMobileClose}
          >
            <span className="sidebar-icon"></span>
            Profile
          </Link>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-version">Taskini</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
