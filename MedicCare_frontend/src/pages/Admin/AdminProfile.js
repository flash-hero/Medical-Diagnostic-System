import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaTimes,
  FaShieldAlt,
} from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminPages.css';

const AdminProfile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    role: 'ADMIN',
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
        name: editData.username,
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
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Administrator Profile</h1>
            <p className="page-subtitle">Manage your administrator account</p>
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
                <FaShieldAlt className="avatar-icon" />
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
                  <div className="info-group full-width">
                    <label>
                      <FaShieldAlt /> Role
                    </label>
                    <input
                      type="text"
                      value="Administrator"
                      disabled
                      className="info-value disabled"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-note">
                <FaShieldAlt />
                <p>
                  As an administrator, you have full access to the system. Contact the system
                  administrator to modify username or role settings.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
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
          color: #8b5cf6;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
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

        .info-group.full-width {
          grid-column: 1 / -1;
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
          color: #8b5cf6;
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
          border-color: #8b5cf6;
        }

        .info-value:not(.disabled):focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .info-value.disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .admin-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
          border-radius: 8px;
          border-left: 4px solid #8b5cf6;
        }

        .admin-note svg {
          font-size: 20px;
          color: #8b5cf6;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .admin-note p {
          margin: 0;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.5;
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
          border-top-color: #8b5cf6;
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
    </AdminLayout>
  );
};

export default AdminProfile;
