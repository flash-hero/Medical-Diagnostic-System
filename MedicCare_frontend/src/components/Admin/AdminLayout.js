import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserCircle,
  FaUserMd,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'User Management' },
    { path: '/admin/doctor-approvals', icon: FaUserMd, label: 'Doctor Approvals' },
    { path: '/admin/statistics', icon: FaChartBar, label: 'Statistics' },
    { path: '/admin/profile', icon: FaUserCircle, label: 'Profile' },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon-admin">
              <FaShieldAlt />
            </div>
            <span className="logo-text">MedicCare Admin</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info-admin">
            <FaShieldAlt className="user-icon" />
            <div className="user-details">
              <span className="user-name">{user?.name || 'Administrator'}</span>
              <span className="user-role">System Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="admin-content-wrapper">
        <nav className="admin-sidebar">
          <ul className="nav-list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="nav-item-content"
                    >
                      <item.icon className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
