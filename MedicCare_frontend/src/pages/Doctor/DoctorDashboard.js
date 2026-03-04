import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaCalendarCheck,
  FaClipboardList,
  FaChartLine,
  FaArrowRight,
} from 'react-icons/fa';
import DoctorLayout from '../../components/Doctor/DoctorLayout';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';
import './DoctorPages.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const doctorName = user?.name || user?.username || '';
  const [dashStats, setDashStats] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, aptsRes] = await Promise.all([
          doctorAPI.getStats(doctorName).catch(() => ({ data: {} })),
          doctorAPI.getAppointments(doctorName).catch(() => ({ data: [] })),
        ]);
        setDashStats(statsRes.data || {});
        const today = new Date().toISOString().split('T')[0];
        const todayApts = (aptsRes.data || []).filter(a =>
          a.appointmentDate === today || a.status?.toUpperCase() === 'PENDING'
        ).slice(0, 5);
        setTodayAppointments(todayApts);
      } catch (err) {
        console.error('Error fetching doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorName) fetchData();
  }, [doctorName]);

  const stats = [
    { label: 'Today\'s Appointments', value: dashStats.todayAppointments ?? '0', icon: FaCalendarCheck, color: '#0066FF' },
    { label: 'Total Patients', value: dashStats.totalPatients ?? '0', icon: FaUsers, color: '#10B981' },
    { label: 'Pending Requests', value: dashStats.pendingRequests ?? '0', icon: FaClipboardList, color: '#F59E0B' },
    { label: 'Completed', value: dashStats.completedAppointments ?? '0', icon: FaChartLine, color: '#FF3B3B' },
  ];

  return (
    <DoctorLayout>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="page-subtitle">Manage your practice efficiently</p>
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                <stat.icon style={{ color: stat.color }} />
              </div>
              <div className="stat-info">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid-doctor">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="dashboard-section"
          >
            <div className="section-header">
              <h2 className="section-title">Today's Schedule</h2>
              <Link to="/doctor/appointments" className="section-link">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="appointments-list">
              {todayAppointments.length > 0 ? todayAppointments.map((apt) => (
                <div key={apt.id} className="doctor-appointment-card">
                  <div className="appointment-time-badge">{apt.appointmentTime}</div>
                  <div className="appointment-patient-info">
                    <h4>{apt.patient?.username || 'Patient'}</h4>
                    <span className="appointment-type">{apt.reason}</span>
                  </div>
                  <span className={`status-badge ${apt.status?.toLowerCase()}`}>{apt.status}</span>
                </div>
              )) : (
                <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No appointments found</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="dashboard-section"
          >
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-doctor">
              <Link to="/doctor/patients" className="action-card-doctor">
                <FaUsers />
                <span>Patient Records</span>
              </Link>
              <Link to="/doctor/chatbot" className="action-card-doctor">
                <FaChartLine />
                <span>AI Assistant</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
