import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaUserMd, FaShieldAlt, FaEdit, FaTrash, FaSearch, FaBan, FaCheck, FaUserCheck, FaClock, FaExclamationTriangle, FaTimes, FaSave } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspensionDuration, setSuspensionDuration] = useState('temporary');
  const [suspensionDate, setSuspensionDate] = useState('');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'doctor':
        return <FaUserMd />;
      case 'admin':
        return <FaShieldAlt />;
      default:
        return <FaUser />;
    }
  };

  // Delete with confirmation popup
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminAPI.deleteUser(userToDelete.id);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Edit user
  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const updates = {};
      if (editForm.username !== editUser.username) updates.username = editForm.username;
      if (editForm.email !== editUser.email) updates.email = editForm.email;
      if (editForm.role !== editUser.role) updates.role = editForm.role;
      
      if (Object.keys(updates).length === 0) {
        toast('No changes made');
        setShowEditModal(false);
        return;
      }
      
      await adminAPI.updateUser(editUser.id, updates);
      await fetchUsers();
      setShowEditModal(false);
      setEditUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    }
  };

  // Suspend
  const handleSuspendClick = (user) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
    setSuspensionDuration('temporary');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSuspensionDate(tomorrow.toISOString().slice(0, 16));
  };

  const handleSuspendConfirm = async () => {
    try {
      const endDate = suspensionDuration === 'temporary' ? suspensionDate : null;
      await adminAPI.suspendUser(selectedUser.id, endDate);
      await fetchUsers();
      setShowSuspendModal(false);
      toast.success(`User ${selectedUser.username} suspended successfully`);
    } catch (err) {
      console.error('Suspend error:', err);
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await adminAPI.unsuspendUser(userId);
      await fetchUsers();
      toast.success('User unsuspended successfully');
    } catch (err) {
      toast.error('Failed to unsuspend user');
    }
  };

  const handleApproveDoctor = async (userId) => {
    try {
      await adminAPI.approveDoctor(userId);
      await fetchUsers();
      toast.success('Doctor approved successfully');
    } catch (err) {
      toast.error('Failed to approve doctor');
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || 'active').toLowerCase();
    let className = 'status-badge';
    let icon = null;
    
    switch (statusLower) {
      case 'active':
        className += ' status-active';
        icon = <FaCheck />;
        break;
      case 'suspended':
        className += ' status-suspended';
        icon = <FaBan />;
        break;
      case 'pending':
        className += ' status-pending';
        icon = <FaClock />;
        break;
      default:
        className += ' status-active';
        icon = <FaCheck />;
    }
    
    return (
      <span className={className}>
        {icon}
        {statusLower}
      </span>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (user.role || '').toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="page-header">
          <div>
            <h1 className="admin-page-title">User Management</h1>
            <p className="admin-page-subtitle">Manage platform users and permissions</p>
          </div>
        </div>

        <div className="admin-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="role-filters">
            {['all', 'patient', 'doctor', 'admin'].map((role) => (
              <button
                key={role}
                className={`role-filter-btn ${roleFilter === role ? 'active' : ''}`}
                onClick={() => setRoleFilter(role)}
              >
                {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-table-container"
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{getRoleIcon(user.role)}</div>
                      <span className="user-name">{user.username}</span>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <span className={`role-badge ${(user.role || '').toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(user.status)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.status === 'PENDING' && (user.role === 'DOCTOR' || user.role === 'doctor') && (
                        <button
                          className="action-btn approve"
                          onClick={() => handleApproveDoctor(user.id)}
                          title="Approve Doctor"
                        >
                          <FaUserCheck />
                        </button>
                      )}
                      {(user.status === 'SUSPENDED' || user.status === 'suspended') && (
                        <button
                          className="action-btn unsuspend"
                          onClick={() => handleUnsuspend(user.id)}
                          title="Unsuspend User"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {user.status !== 'SUSPENDED' && user.status !== 'suspended' && 
                       (user.role || '').toUpperCase() !== 'ADMIN' && (
                        <button
                          className="action-btn suspend"
                          onClick={() => handleSuspendClick(user)}
                          title="Suspend User"
                        >
                          <FaBan />
                        </button>
                      )}
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditClick(user)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      {(user.role || '').toUpperCase() !== 'ADMIN' && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(user)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Suspension Modal */}
      <AnimatePresence>
        {showSuspendModal && (
          <div className="modal-overlay" onClick={() => setShowSuspendModal(false)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2><FaBan style={{ color: '#FDB924', marginRight: 8 }} /> Suspend User</h2>
                <button className="modal-close-btn" onClick={() => setShowSuspendModal(false)}><FaTimes /></button>
              </div>
              <p>Suspend <strong>{selectedUser?.username}</strong>. Choose duration:</p>
              
              <div className="suspension-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="temporary"
                    checked={suspensionDuration === 'temporary'}
                    onChange={(e) => setSuspensionDuration(e.target.value)}
                  />
                  <span>Temporary (until specific date)</span>
                </label>
                
                {suspensionDuration === 'temporary' && (
                  <input
                    type="datetime-local"
                    value={suspensionDate}
                    onChange={(e) => setSuspensionDate(e.target.value)}
                    className="date-input"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                )}
                
                <label className="radio-option">
                  <input
                    type="radio"
                    value="indefinite" 
                    checked={suspensionDuration === 'indefinite'}
                    onChange={(e) => setSuspensionDuration(e.target.value)}
                  />
                  <span>Indefinite (until manually unsuspended)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowSuspendModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleSuspendConfirm}>
                  Suspend User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <motion.div
              className="modal-content delete-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2><FaExclamationTriangle style={{ color: '#FF3B3B', marginRight: 8 }} /> Confirm Deletion</h2>
                <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
              </div>
              <div className="delete-warning">
                <div className="delete-warning-icon">
                  <FaExclamationTriangle />
                </div>
                <p>Are you sure you want to delete <strong>{userToDelete?.username}</strong>?</p>
                <p className="delete-warning-sub">This action cannot be undone. All data associated with this user will be permanently removed.</p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                  <FaTrash style={{ marginRight: 6 }} /> Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <motion.div
              className="modal-content edit-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2><FaEdit style={{ color: '#3B82F6', marginRight: 8 }} /> Edit User</h2>
                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}><FaTimes /></button>
              </div>
              
              <div className="edit-form">
                <div className="edit-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="edit-input"
                  />
                </div>
                <div className="edit-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="edit-input"
                  />
                </div>
                <div className="edit-field">
                  <label>Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="edit-input edit-select"
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="patient">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="doctor">Doctor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleEditSave}>
                  <FaSave style={{ marginRight: 6 }} /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminUsers;
