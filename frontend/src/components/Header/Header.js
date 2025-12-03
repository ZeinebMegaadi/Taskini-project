import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-container">
        {user && (
          <button className="menu-toggle" onClick={onMenuClick}>
            ☰
          </button>
        )}
        <Link to="/" className="logo">
          <Link to="/" className="logo">
  <h1 className="taskini-logo">Taskini</h1>
</Link>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              <Link to="/tasks" className="nav-link">Tasks</Link>
              <span className="nav-link user-name">{user.name}</span>
              <button onClick={handleLogout} className="nav-link btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

