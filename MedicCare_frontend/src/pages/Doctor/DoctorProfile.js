import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaStethoscope,
  FaEdit,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import DoctorLayout from '../../components/Doctor/DoctorLayout';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './DoctorPages.css';

const DoctorProfile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    specialty: '',
    phoneNumber: '',
  });
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfileData(response.data);
      setEditData(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await profileAPI.updateProfile(editData);
      setProfileData(editData);
      setIsEditing(false);
      
      login({
        ...user,
        name: `${editData.firstName || ''} ${editData.lastName || ''}`.trim() || editData.username,
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <DoctorLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your professional information</p>
          </div>
          {!isEditing ? (
            <button className="btn btn-primary" onClick={handleEdit}>
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-success" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="profile-container"
          >
            <div className="profile-card">
              <div className="profile-avatar">
                <FaUser className="avatar-icon" />
              </div>

              <div className="profile-info">
                <div className="info-row">
                  <div className="info-group">
                    <label>
                      <FaUser /> Username
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.username : profileData.username}
                      disabled
                      className="info-value disabled"
                    />
                  </div>
                  <div className="info-group">
                    <label>
                      <FaEnvelope /> Email
                    </label>
                    <input
                      type="email"
                      value={isEditing ? editData.email : profileData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`info-value ${!isEditing ? 'disabled' : ''}`}
                    />
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <label>
                      <FaUser /> First Name
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.firstName || '' : profileData.firstName || ''}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className={`info-value ${!isEditing ? 'disabled' : ''}`}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="info-group">
                    <label>
                      <FaUser /> Last Name
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.lastName || '' : profileData.lastName || ''}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className={`info-value ${!isEditing ? 'disabled' : ''}`}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <label>
                      <FaStethoscope /> Specialty
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.specialty || '' : profileData.specialty || ''}
                      onChange={(e) => handleChange('specialty', e.target.value)}
                      disabled={!isEditing}
                      className={`info-value ${!isEditing ? 'disabled' : ''}`}
                      placeholder="Enter specialty"
                    />
                  </div>
                  <div className="info-group">
                    <label>
                      <FaPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={isEditing ? editData.phoneNumber || '' : profileData.phoneNumber || ''}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      className={`info-value ${!isEditing ? 'disabled' : ''}`}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .profile-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .avatar-icon {
          font-size: 80px;
          color: #10b981;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .info-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .info-group label svg {
          color: #10b981;
        }

        .info-value {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }

        .info-value:not(.disabled):hover {
          border-color: #10b981;
        }

        .info-value:not(.disabled):focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .info-value.disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .info-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DoctorLayout>
  );
};

export default DoctorProfile;
