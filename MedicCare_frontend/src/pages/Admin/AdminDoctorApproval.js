import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserMd, FaCheck, FaTimes, FaSearch, FaClock, FaEnvelope, FaUserCheck, FaTimesCircle } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const AdminDoctorApproval = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [doctorToReject, setDoctorToReject] = useState(null);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const res = await adminAPI.getUsers();
      const allUsers = res.data || [];
      const pending = allUsers.filter(
        (u) =>
          (u.status === 'PENDING' || u.status === 'pending') &&
          ((u.role || '').toUpperCase() === 'DOCTOR')
      );
      setDoctors(pending);
    } catch (err) {
      console.error('Error fetching pending doctors:', err);
      toast.error('Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctor) => {
    try {
      await adminAPI.approveDoctor(doctor.id);
      setDoctors(doctors.filter((d) => d.id !== doctor.id));
      toast.success(`Dr. ${doctor.username} has been approved!`);
    } catch (err) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleRejectClick = (doctor) => {
    setDoctorToReject(doctor);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    try {
      await adminAPI.deleteUser(doctorToReject.id);
      setDoctors(doctors.filter((d) => d.id !== doctorToReject.id));
      setShowRejectModal(false);
      setDoctorToReject(null);
      toast.success('Doctor application rejected');
    } catch (err) {
      toast.error('Failed to reject doctor');
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      (d.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="page-header">
          <div>
            <h1 className="admin-page-title">Doctor Approvals</h1>
            <p className="admin-page-subtitle">
              Review and approve pending doctor registrations
            </p>
          </div>
          <div className="pending-count-badge">
            <FaClock /> {doctors.length} Pending
          </div>
        </div>

        {doctors.length > 0 && (
          <div className="admin-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search pending doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading pending doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">
              <FaUserCheck />
            </div>
            <h3>No Pending Approvals</h3>
            <p>All doctor registrations have been reviewed. Check back later for new applications.</p>
          </motion.div>
        ) : (
          <div className="approval-cards-grid">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                className="approval-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="approval-card-header">
                  <div className="doctor-avatar-large">
                    <FaUserMd />
                  </div>
                  <div className="approval-status-tag">
                    <FaClock /> Pending Review
                  </div>
                </div>

                <div className="approval-card-body">
                  <h3 className="doctor-name">{doctor.username}</h3>
                  <div className="doctor-info-row">
                    <FaEnvelope className="info-icon" />
                    <span>{doctor.email}</span>
                  </div>
                </div>

                <div className="approval-card-actions">
                  <button
                    className="approval-btn approve-btn"
                    onClick={() => handleApprove(doctor)}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="approval-btn reject-btn"
                    onClick={() => handleRejectClick(doctor)}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>
                  <FaTimesCircle style={{ color: '#FF3B3B', marginRight: 8 }} /> Reject Doctor
                </h2>
                <button className="modal-close-btn" onClick={() => setShowRejectModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="delete-warning">
                <div className="delete-warning-icon">
                  <FaTimesCircle />
                </div>
                <p>
                  Are you sure you want to reject <strong>{doctorToReject?.username}</strong>'s application?
                </p>
                <p className="delete-warning-sub">
                  This will permanently delete their account.
                </p>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setDoctorToReject(null);
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleRejectConfirm}>
                  <FaTimes style={{ marginRight: 6 }} /> Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminDoctorApproval;
