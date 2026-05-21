import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🅿</span>
          <span className="brand-text">SmartPark</span>
        </Link>
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {isAdmin() ? (
          <>
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Dashboard</Link>
            <Link to="/admin/slots" className={isActive('/admin/slots') ? 'active' : ''}>Slots</Link>
            <Link to="/admin/bookings" className={isActive('/admin/bookings') ? 'active' : ''}>Bookings</Link>
            <Link to="/admin/qr-validator" className={isActive('/admin/qr-validator') ? 'active' : ''}>QR Validator</Link>
          </>
        ) : (
          <>
            <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
            <Link to="/parking-map" className={isActive('/parking-map') ? 'active' : ''}>Parking Map</Link>
            <Link to="/bookings" className={isActive('/bookings') ? 'active' : ''}>My Bookings</Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span className="user-name">👤 {user?.name}</span>
        <span className={`role-badge ${isAdmin() ? 'admin' : 'user'}`}>
          {isAdmin() ? 'Admin' : 'User'}
        </span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
