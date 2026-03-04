import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaFilter,
} from 'react-icons/fa';
import DoctorLayout from '../../components/Doctor/DoctorLayout';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './DoctorPages.css';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const doctorName = user?.name || user?.username || '';
  const [filter, setFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorName) fetchAppointments();
  }, [doctorName]);

  const fetchAppointments = async () => {
    try {
      const res = await doctorAPI.getAppointments(doctorName);
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, 'CONFIRMED');
      toast.success('Appointment confirmed!');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to confirm appointment');
    }
  };

  const handleDecline = async (id) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, 'CANCELLED');
      toast.error('Appointment declined.');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to decline appointment');
    }
  };

  const handleDelay = async (id) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, 'DELAYED');
      toast.success('Appointment delayed.');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to delay appointment');
    }
  };

  const filteredAppointments =
    filter === 'all'
      ? appointments
      : appointments.filter((apt) => apt.status?.toUpperCase() === filter.toUpperCase());

  return (
    <DoctorLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Appointment Management</h1>
            <p className="page-subtitle">Review and manage patient appointments</p>
          </div>
        </div>

        <div className="filter-bar">
          <FaFilter className="filter-icon" />
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="doctor-appointments-grid">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="doctor-appointment-card-full"
            >
              <div className="appointment-patient-header">
                <div className="patient-avatar">
                  <FaUser />
                </div>
                <div className="patient-info-header">
                  <h3>{appointment.patient?.username || 'Patient'}</h3>
                  <p>{appointment.patient?.firstName ? `${appointment.patient.firstName} ${appointment.patient.lastName || ''}` : ''}</p>
                </div>
                <span className={`status-pill ${appointment.status?.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-details-doctor">
                <div className="detail-row">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{appointment.appointmentDate}</span>
                </div>
                <div className="detail-row">
                  <FaClock className="detail-icon" />
                  <span>{appointment.appointmentTime}</span>
                </div>
              </div>

              <div className="appointment-reason-doctor">
                <strong>Reason:</strong> {appointment.reason}
              </div>

              {appointment.status?.toUpperCase() === 'PENDING' && (
                <div className="appointment-actions-doctor">
                  <button
                    className="btn-action accept"
                    onClick={() => handleAccept(appointment.id)}
                  >
                    <FaCheck /> Accept
                  </button>
                  <button
                    className="btn-action delay"
                    onClick={() => handleDelay(appointment.id)}
                  >
                    <FaClock /> Delay
                  </button>
                  <button
                    className="btn-action decline"
                    onClick={() => handleDecline(appointment.id)}
                  >
                    <FaTimes /> Decline
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointments;
