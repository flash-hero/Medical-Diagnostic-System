import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaRobot,
  FaCalendarCheck,
  FaUsers,
  FaComments,
  FaSignOutAlt,
  FaUserMd,
  FaUserCircle,
  FaBell,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './DoctorLayout.css';

const DoctorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/doctor/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/doctor/appointments', icon: FaCalendarCheck, label: 'Appointments', badge: 5 },
    { path: '/doctor/patients', icon: FaUsers, label: 'Patients' },
    { path: '/doctor/messages', icon: FaComments, label: 'Messages' },
    { path: '/doctor/chatbot', icon: FaRobot, label: 'AI Assistant' },
    { path: '/doctor/profile', icon: FaUserCircle, label: 'Profile' },
  ];

  return (
    <div className="doctor-layout">
      <header className="doctor-header-new">
        <div className="header-container">
          <div className="header-brand">
            <div className="brand-icon">
              <FaUserMd />
            </div>
            <div className="brand-text">
              <h1>MedicCare</h1>
              <span>Professional</span>
            </div>
          </div>

          <nav className="header-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`header-nav-item ${isActive ? 'active' : ''}`}
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="nav-item-wrapper"
                  >
                    <item.icon className="nav-item-icon" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="doctor-underline"
                      className="nav-underline"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <button className="notification-btn" title="Notifications">
              <FaBell />
              <span className="notification-dot"></span>
            </button>
            <div className="header-user">
              <div className="user-avatar">
                <FaUserMd />
              </div>
              <div className="user-meta">
                <span className="user-greeting">Dr. {user?.name || 'Doctor'}</span>
                <span className="user-subtitle">Medical Professional</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <main className="doctor-main-content">{children}</main>
    </div>
  );
};

export default DoctorLayout;
