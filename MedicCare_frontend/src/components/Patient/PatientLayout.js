import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaRobot,
  FaCalendarAlt,
  FaHistory,
  FaSignOutAlt,
  FaUserCircle,
  FaHeartbeat,
  FaBell,
  FaComments,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import FloatingChat from '../FloatingChat';
import './PatientLayout.css';

const PatientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/patient/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/patient/chatbot', icon: FaRobot, label: 'AI Assistant' },
    { path: '/patient/disease-prediction', icon: FaHeartbeat, label: 'Health Check' },
    { path: '/patient/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/patient/messages', icon: FaComments, label: 'Messages' },
    { path: '/patient/history', icon: FaHistory, label: 'History' },
    { path: '/patient/profile', icon: FaUserCircle, label: 'Profile' },
  ];

  const handleSendMessage = (message) => {
    console.log('Sending message:', message);
  };

  return (
    <div className="patient-layout">
      <header className="patient-header-new">
        <div className="header-container">
          <div className="header-brand">
            <div className="brand-icon-patient">
              <div className="heartbeat-icon">
                <FaHeartbeat />
              </div>
            </div>
            <div className="brand-text">
              <h1>MedicCare</h1>
              <span>Health Portal</span>
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
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="patient-underline"
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
              <div className="user-avatar-patient">
                <FaUserCircle />
              </div>
              <div className="user-meta">
                <span className="user-greeting">{user?.name || 'Patient'}</span>
                <span className="user-subtitle">Patient Portal</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <main className="patient-main-content">{children}</main>

      <FloatingChat userRole="patient" onSendMessage={handleSendMessage} />
    </div>
  );
};

export default PatientLayout;
